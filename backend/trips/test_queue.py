from django.test import TestCase
from django.contrib.auth import get_user_model
from terminals.models import Terminal, DestinationZone
from drivers.models import DriverProfile, DriverStatus
from trips.models import PassengerQueueEntry, TripDispatch, QueueStatus, TripType
from trips.dispatch_service import check_and_dispatch, generate_queue_number
from django.utils import timezone

User = get_user_model()

class QueueDispatchTests(TestCase):
    def setUp(self):
        self.terminal = Terminal.objects.create(
            name="Test Terminal",
            code="test-term",
            address="Test Address",
            regular_capacity_per_tricycle=4
        )
        self.dest = DestinationZone.objects.create(
            terminal=self.terminal,
            name="Test Plaza",
            distance_km=1.5
        )

        # Create two drivers
        u1 = User.objects.create_user(username="d1", role="DRIVER")
        self.driver1 = DriverProfile.objects.create(
            user=u1, terminal=self.terminal, body_number="001",
            plate_number="AAA-111", status=DriverStatus.QUEUED,
            queue_entered_at=timezone.now()
        )

        u2 = User.objects.create_user(username="d2", role="DRIVER")
        self.driver2 = DriverProfile.objects.create(
            user=u2, terminal=self.terminal, body_number="002",
            plate_number="BBB-222", status=DriverStatus.QUEUED,
            queue_entered_at=timezone.now() + timezone.timedelta(minutes=2)
        )

    def test_fifo_ordering(self):
        # Driver 1 entered before Driver 2, so Driver 1 is head of queue
        head = DriverProfile.objects.filter(terminal=self.terminal, status=DriverStatus.QUEUED).order_by('queue_entered_at').first()
        self.assertEqual(head.id, self.driver1.id)

    def test_regular_batch_dispatch_at_capacity(self):
        # Join 4 passengers
        passengers = []
        for i in range(4):
            u = User.objects.create_user(username=f"p{i}")
            p = PassengerQueueEntry.objects.create(
                user=u, terminal=self.terminal, destination=self.dest,
                trip_type=TripType.REGULAR, party_size=1,
                queue_number=f"R-00{i+1}", status=QueueStatus.WAITING,
                distance_km=1.5, computed_fare=20.00
            )
            passengers.append(p)

        dispatch = check_and_dispatch(self.terminal.id)
        self.assertIsNotNone(dispatch)
        self.assertEqual(dispatch.driver.id, self.driver1.id)
        self.assertEqual(dispatch.total_fare, 80.00)
        self.assertEqual(dispatch.passenger_entries.count(), 4)

        # Check driver status updated to ASSIGNED
        self.driver1.refresh_from_db()
        self.assertEqual(self.driver1.status, DriverStatus.ASSIGNED)

    def test_special_trip_instant_dispatch(self):
        u = User.objects.create_user(username="special_pax")
        p = PassengerQueueEntry.objects.create(
            user=u, terminal=self.terminal, destination=self.dest,
            trip_type=TripType.SPECIAL, party_size=1,
            queue_number="S-001", status=QueueStatus.WAITING,
            distance_km=1.5, computed_fare=60.00
        )

        dispatch = check_and_dispatch(self.terminal.id)
        self.assertIsNotNone(dispatch)
        self.assertEqual(dispatch.driver.id, self.driver1.id)
        self.assertEqual(dispatch.trip_type, TripType.SPECIAL)
        self.assertEqual(dispatch.total_fare, 60.00)

    def test_manual_driver_override_dispatch(self):
        # Only 2 passengers waiting
        for i in range(2):
            u = User.objects.create_user(username=f"manual_p{i}")
            PassengerQueueEntry.objects.create(
                user=u, terminal=self.terminal, destination=self.dest,
                trip_type=TripType.REGULAR, party_size=1,
                queue_number=f"R-00{i+1}", status=QueueStatus.WAITING,
                distance_km=1.5, computed_fare=20.00
            )

        # Auto dispatch does nothing since count < 4
        dispatch_auto = check_and_dispatch(self.terminal.id, manual_override=False)
        self.assertIsNone(dispatch_auto)

        # Driver triggers manual override
        dispatch_manual = check_and_dispatch(self.terminal.id, manual_override=True, driver_override_profile=self.driver1)
        self.assertIsNotNone(dispatch_manual)
        self.assertEqual(dispatch_manual.passenger_entries.count(), 2)
        self.assertEqual(dispatch_manual.total_fare, 40.00)
