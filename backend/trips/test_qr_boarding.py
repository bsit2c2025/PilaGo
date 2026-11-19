"""
Phase 7 Integration Tests — Camera QR Boarding Verification
Tests for ValidateBoardingTicketView (POST /api/driver/verify-ticket/)
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from terminals.models import Terminal, DestinationZone
from drivers.models import DriverProfile
from trips.models import PassengerQueueEntry, TripDispatch, QueueStatus, TripType


def _make_terminal():
    return Terminal.objects.get_or_create(
        code="TEST", defaults={"name": "Test Terminal", "is_active": True}
    )[0]


def _make_destination(terminal, km=3.0):
    return DestinationZone.objects.get_or_create(
        name="TestVille",
        defaults={"terminal": terminal, "distance_km": km, "is_active": True},
    )[0]


def _make_driver(username="driver_qr"):
    u, _ = User.objects.get_or_create(username=username)
    u.set_password("pass123")
    u.save()
    terminal = _make_terminal()
    profile, _ = DriverProfile.objects.get_or_create(
        user=u,
        defaults={
            "license_number": "QR-LIC-001",
            "body_number": "QR-001",
            "plate_number": "QR-PLATE",
            "terminal": terminal,
            "status": "QUEUED",
        },
    )
    return profile


def _make_passenger(username="pax_qr"):
    u, _ = User.objects.get_or_create(username=username)
    u.set_password("pass123")
    u.save()
    return u


def _make_entry(passenger_user, terminal, destination, token="TKT-ABCDEF123456", queue_number="R-001"):
    return PassengerQueueEntry.objects.create(
        user=passenger_user,
        terminal=terminal,
        destination=destination,
        trip_type=TripType.REGULAR,
        queue_number=queue_number,
        status=QueueStatus.WAITING,
        distance_km=destination.distance_km,
        computed_fare=Decimal("25.00"),
        is_discounted=False,
        ticket_qr_token=token,
    )


class ValidateBoardingTicketViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.terminal = _make_terminal()
        self.destination = _make_destination(self.terminal)
        self.driver_profile = _make_driver()
        self.driver_user = self.driver_profile.user
        self.passenger_user = _make_passenger()
        self.TOKEN = "TKT-ABCDEF123456"
        self.entry = _make_entry(
            self.passenger_user, self.terminal, self.destination, token=self.TOKEN
        )
        # Create an active dispatch and link the entry
        self.dispatch = TripDispatch.objects.create(
            driver=self.driver_profile,
            terminal=self.terminal,
            trip_type=TripType.REGULAR,
            dispatch_number="TEST-DISPATCH-001",
            total_fare=Decimal("25.00"),
        )
        self.dispatch.passenger_entries.add(self.entry)

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    # ------------------------------------------------------------------ #
    # Happy path                                                           #
    # ------------------------------------------------------------------ #

    def test_valid_token_marks_boarded(self):
        """POST with a valid token marks is_boarded=True and returns passenger data."""
        self._auth(self.driver_user)
        url = reverse("driver_verify_ticket")
        resp = self.client.post(url, {"ticket_token": self.TOKEN}, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertFalse(data["was_already_boarded"])
        self.assertTrue(data["passenger"]["is_boarded"])
        self.assertEqual(data["passenger"]["queue_number"], "R-001")

        # DB must be updated
        self.entry.refresh_from_db()
        self.assertTrue(self.entry.is_boarded)
        self.assertIsNotNone(self.entry.boarded_at)

    def test_full_url_token_extracted(self):
        """If the QR encodes a full URL, extract just the token suffix."""
        self._auth(self.driver_user)
        url = reverse("driver_verify_ticket")
        full_url = f"https://pilago.example.com/verify/{self.TOKEN}"
        resp = self.client.post(url, {"ticket_token": full_url}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])

    def test_already_boarded_returns_flag(self):
        """Scanning the same token twice sets was_already_boarded=True."""
        self._auth(self.driver_user)
        url = reverse("driver_verify_ticket")
        # First scan
        self.client.post(url, {"ticket_token": self.TOKEN}, format="json")
        # Second scan
        resp = self.client.post(url, {"ticket_token": self.TOKEN}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertTrue(data["was_already_boarded"])

    # ------------------------------------------------------------------ #
    # Error cases                                                          #
    # ------------------------------------------------------------------ #

    def test_invalid_token_returns_404(self):
        """Unknown token → 404."""
        self._auth(self.driver_user)
        url = reverse("driver_verify_ticket")
        resp = self.client.post(url, {"ticket_token": "TKT-DOESNOTEXIST"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_missing_token_returns_400(self):
        """Empty/missing ticket_token → 400."""
        self._auth(self.driver_user)
        url = reverse("driver_verify_ticket")
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_returns_401(self):
        """Unauthenticated requests are rejected."""
        url = reverse("driver_verify_ticket")
        resp = self.client.post(url, {"ticket_token": self.TOKEN}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_driver_cannot_scan_other_dispatch_ticket(self):
        """A driver cannot validate a ticket that isn't in their active dispatch."""
        # Create a second driver and entry NOT linked to them
        other_pax = _make_passenger("pax_other")
        other_entry = _make_entry(
            other_pax, self.terminal, self.destination, token="TKT-ZZZZZZ000000", queue_number="R-002"
        )
        # other_entry is NOT added to self.dispatch

        self._auth(self.driver_user)
        url = reverse("driver_verify_ticket")
        resp = self.client.post(url, {"ticket_token": "TKT-ZZZZZZ000000"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("not assigned", resp.json()["error"])

    def test_admin_user_can_scan_any_ticket(self):
        """An admin (non-driver) user can verify any ticket (admin inspection)."""
        admin_user, _ = User.objects.get_or_create(
            username="admin_qr", defaults={"is_staff": True}
        )
        admin_user.set_password("admin123")
        admin_user.save()
        self._auth(admin_user)

        url = reverse("driver_verify_ticket")
        resp = self.client.post(url, {"ticket_token": self.TOKEN}, format="json")
        # Admin has no driver_profile → no dispatch check → should succeed
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
