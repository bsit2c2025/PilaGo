#!/usr/bin/env python3
"""
PilaGo Live Demo Walkthrough Script
Simulates live passenger queuing, FIFO driver dispatch, fare matrix verification,
and digital ticket issuance.
"""

import sys
import os
import django
from decimal import Decimal

# Set up Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pilago_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from terminals.models import Terminal, DestinationZone
from drivers.models import DriverProfile, DriverStatus
from trips.models import PassengerQueueEntry, TripDispatch, QueueStatus, TripType
from trips.fare_calculator import calculate_trip_fare
from trips.dispatch_service import check_and_dispatch, generate_queue_number
from django.utils import timezone

User = get_user_model()

def run_demo():
    print("=" * 65)
    print("      PILAGO: SMART TRICYCLE QUEUE & FARE DEMONSTRATION")
    print("=" * 65)

    terminal = Terminal.objects.filter(code='bayan-central').first()
    if not terminal:
        print("[!] Terminal not found. Please run: python manage.py seed_data")
        return

    print(f"\n📍 ACTIVE TERMINAL: {terminal.name} (Code: {terminal.code})")
    print(f"   Max Regular Capacity per Tricycle: {terminal.regular_capacity_per_tricycle} passengers\n")

    # 1. Driver FIFO Roster
    print("--- [1] DRIVER FIFO QUEUE CHECK-IN ---")
    drivers = DriverProfile.objects.filter(terminal=terminal, status=DriverStatus.QUEUED).order_by('queue_entered_at')
    for idx, d in enumerate(drivers, 1):
        print(f"   Rank #{idx}: Tricycle Body #{d.body_number} ({d.user.get_full_name()}) - Plate: {d.plate_number}")

    # 2. Fare Matrix Verification
    print("\n--- [2] MUNICIPAL FARE MATRIX CALCULATION ---")
    dest = terminal.destinations.filter(distance_km__gt=2.0).first()
    if dest:
        reg_fare = calculate_trip_fare(dest.distance_km, 'REGULAR', is_discounted=False)
        student_fare = calculate_trip_fare(dest.distance_km, 'REGULAR', is_discounted=True)
        special_fare = calculate_trip_fare(dest.distance_km, 'SPECIAL', is_discounted=False)

        print(f"   Destination: {dest.name} ({dest.distance_km} km)")
        print(f"   • Regular Shared Fare: ₱{reg_fare['total_fare']:.2f} (Base: ₱{reg_fare['base_fare']:.2f} + Extra: ₱{reg_fare['distance_charge']:.2f})")
        print(f"   • Student (20% Off):   ₱{student_fare['total_fare']:.2f} (Base: ₱{student_fare['base_fare']:.2f} + Extra: ₱{student_fare['distance_charge']:.2f})")
        print(f"   • Special Solo Trip:   ₱{special_fare['total_fare']:.2f} (Base: ₱{special_fare['base_fare']:.2f} + Extra: ₱{special_fare['distance_charge']:.2f})")

    # 3. Simulate Passenger Queuing
    print("\n--- [3] PASSENGER QUEUE SIMULATION ---")
    p1 = User.objects.filter(username='passenger_maria').first()
    p2 = User.objects.filter(username='student_carlos').first()

    if p1 and p2 and dest:
        # Clear existing active entries for clean demo
        PassengerQueueEntry.objects.filter(user__in=[p1, p2], status=QueueStatus.WAITING).delete()

        q1 = PassengerQueueEntry.objects.create(
            user=p1, terminal=terminal, destination=dest,
            trip_type=TripType.REGULAR, party_size=1,
            queue_number=generate_queue_number(terminal, 'REGULAR'),
            status=QueueStatus.WAITING, distance_km=dest.distance_km,
            is_discounted=False, computed_fare=reg_fare['total_fare']
        )
        print(f"   [+] Passenger Maria entered queue -> Ticket: {q1.queue_number} (Fare: ₱{q1.computed_fare:.2f})")

        q2 = PassengerQueueEntry.objects.create(
            user=p2, terminal=terminal, destination=dest,
            trip_type=TripType.REGULAR, party_size=1,
            queue_number=generate_queue_number(terminal, 'REGULAR'),
            status=QueueStatus.WAITING, distance_km=dest.distance_km,
            is_discounted=True, computed_fare=student_fare['total_fare']
        )
        print(f"   [+] Student Carlos (20% Off) entered queue -> Ticket: {q2.queue_number} (Fare: ₱{q2.computed_fare:.2f})")
        print(f"       Digital Ticket QR Token: {q2.ticket_qr_token}")
        print(f"       Verification URL: http://localhost:5173/verify/{q2.ticket_qr_token}")

    # 4. Driver Dispatch Evaluation
    print("\n--- [4] DISPATCH TRIGGER EVALUATION ---")
    waiting_count = PassengerQueueEntry.objects.filter(terminal=terminal, status=QueueStatus.WAITING).count()
    print(f"   Current waiting regular passengers: {waiting_count}/4")
    head_driver = DriverProfile.objects.filter(terminal=terminal, status=DriverStatus.QUEUED).order_by('queue_entered_at').first()

    if head_driver:
        print(f"   Head of Line Driver: Tricycle #{head_driver.body_number}")
        print("   Triggering Driver Manual Departure Override ('Dispatch Now')...")
        dispatch = check_and_dispatch(terminal.id, manual_override=True, driver_override_profile=head_driver)
        if dispatch:
            print(f"   [✓] Dispatch Successful: Dispatch #{dispatch.dispatch_number}")
            print(f"       Assigned Tricycle: Body #{head_driver.body_number} ({head_driver.user.get_full_name()})")
            print(f"       Passengers Boarded: {dispatch.passenger_entries.count()}")
            print(f"       Total Cash Fare Collected: ₱{dispatch.total_fare:.2f}")

    print("\n" + "=" * 65)
    print("      DEMONSTRATION COMPLETE - ALL SYSTEMS NOMINAL")
    print("=" * 65)

if __name__ == '__main__':
    run_demo()
