from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from terminals.models import Terminal, DestinationZone
from drivers.models import DriverProfile, DriverStatus
from trips.models import PassengerQueueEntry, TripDispatch, QueueStatus, TripType

User = get_user_model()

class EndToEndPilaGoFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.terminal = Terminal.objects.create(
            name="Bayan Central Terminal",
            code="bayan-central",
            address="Rizal Ave",
            regular_capacity_per_tricycle=4
        )
        self.dest1 = DestinationZone.objects.create(
            terminal=self.terminal,
            name="City Hall",
            distance_km=1.5
        )
        self.dest2 = DestinationZone.objects.create(
            terminal=self.terminal,
            name="Provincial High School",
            distance_km=2.0
        )

        # Driver Pedro
        self.d_user = User.objects.create_user(username="driver_pedro", password="driver123", role="DRIVER")
        self.driver_pedro = DriverProfile.objects.create(
            user=self.d_user,
            terminal=self.terminal,
            body_number="042",
            plate_number="ABC-1234",
            status=DriverStatus.QUEUED,
        )

        # Passenger Maria (Regular)
        self.p_maria = User.objects.create_user(
            username="passenger_maria", password="pass123", role="PASSENGER", discount_type="NONE"
        )

        # Passenger Carlos (Student with 20% discount verified)
        self.p_carlos = User.objects.create_user(
            username="student_carlos", password="pass123", role="PASSENGER",
            discount_type="STUDENT", is_discount_verified=True
        )

    def test_complete_passenger_and_driver_flow(self):
        # 1. Carlos calculates discounted fare
        self.client.force_authenticate(user=self.p_carlos)
        res = self.client.post('/api/fare/calculate/', {
            'destination_id': self.dest2.id,
            'trip_type': 'REGULAR'
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['base_fare'], 16.00) # 20% off 20.00
        self.assertEqual(res.data['total_fare'], 16.00)

        # 2. Maria calculates regular fare
        self.client.force_authenticate(user=self.p_maria)
        res = self.client.post('/api/fare/calculate/', {
            'destination_id': self.dest1.id,
            'trip_type': 'REGULAR'
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['base_fare'], 20.00)
        self.assertEqual(res.data['total_fare'], 20.00)

        # 3. Maria joins queue
        res_join = self.client.post('/api/queue/join/', {
            'destination_id': self.dest1.id,
            'trip_type': 'REGULAR'
        })
        self.assertEqual(res_join.status_code, 201)
        self.assertEqual(res_join.data['queue_number'], 'R-001')
        self.assertEqual(res_join.data['status'], 'WAITING')

        # 4. Carlos joins queue
        self.client.force_authenticate(user=self.p_carlos)
        res_join_carlos = self.client.post('/api/queue/join/', {
            'destination_id': self.dest2.id,
            'trip_type': 'REGULAR'
        })
        self.assertEqual(res_join_carlos.status_code, 201)
        self.assertEqual(res_join_carlos.data['queue_number'], 'R-002')
        self.assertEqual(res_join_carlos.data['people_ahead'], 1)

        # 5. Public Board check while waiting
        res_board = self.client.get('/api/public/board/bayan-central/')
        self.assertEqual(res_board.status_code, 200)
        self.assertEqual(res_board.data['waiting_regular_count'], 2)
        self.assertEqual(res_board.data['upcoming_regular'], ['R-001', 'R-002'])

        # 6. Two more passengers join to hit capacity of 4
        for i in range(3, 5):
            u = User.objects.create_user(username=f"user_{i}")
            self.client.force_authenticate(user=u)
            self.client.post('/api/queue/join/', {
                'destination_id': self.dest1.id,
                'trip_type': 'REGULAR'
            })

        # 7. Check that capacity of 4 automatically triggered dispatch for Driver Pedro (#042)
        self.driver_pedro.refresh_from_db()
        self.assertEqual(self.driver_pedro.status, DriverStatus.ASSIGNED)

        # Check driver's active assignment endpoint
        self.client.force_authenticate(user=self.d_user)
        res_assign = self.client.get('/api/driver/current-assignment/')
        self.assertEqual(res_assign.status_code, 200)
        self.assertTrue(res_assign.data['has_assignment'])
        self.assertEqual(len(res_assign.data['passengers']), 4)
        # Total fare: 3 regular (₱20 each = ₱60) + 1 student (₱16) = ₱76.00
        self.assertEqual(res_assign.data['total_fare'], 76.00)

        # 8. Driver completes trip upon cash payment
        dispatch_id = res_assign.data['dispatch_id']
        res_complete = self.client.post(f'/api/driver/dispatch/{dispatch_id}/complete/', {
            're_enter_queue': True
        })
        self.assertEqual(res_complete.status_code, 200)
        self.driver_pedro.refresh_from_db()
        self.assertEqual(self.driver_pedro.status, DriverStatus.QUEUED)
