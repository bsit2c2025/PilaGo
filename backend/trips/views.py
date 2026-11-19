from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import PassengerQueueEntry, TripDispatch, QueueStatus, TripType
from .serializers import (
    FareCalculationRequestSerializer,
    JoinQueueSerializer,
    PassengerQueueEntrySerializer,
)
from .fare_calculator import calculate_trip_fare
from .dispatch_service import generate_queue_number, check_and_dispatch, broadcast_board_update
from terminals.models import DestinationZone, Terminal
from drivers.models import DriverProfile

class FareCalculateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = FareCalculationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dest_id = serializer.validated_data['destination_id']
        trip_type = serializer.validated_data['trip_type']

        try:
            destination = DestinationZone.objects.get(id=dest_id, is_active=True)
        except DestinationZone.DoesNotExist:
            return Response({'error': 'Destination not found'}, status=status.HTTP_404_NOT_FOUND)

        is_discounted = False
        if request.user.is_authenticated and request.user.is_discount_verified:
            is_discounted = True

        result = calculate_trip_fare(
            distance_km=destination.distance_km,
            trip_type=trip_type,
            is_discounted=is_discounted,
            base_override=destination.base_fare_override
        )
        result['destination_name'] = destination.name
        result['terminal_name'] = destination.terminal.name
        return Response(result)

class JoinQueueView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = JoinQueueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Check if passenger is already active in a queue
        existing = PassengerQueueEntry.objects.filter(
            user=request.user,
            status__in=[QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_TRANSIT]
        ).first()

        if existing:
            return Response({
                'message': 'You already have an active queue entry.',
                'entry': PassengerQueueEntrySerializer(existing).data
            }, status=status.HTTP_400_BAD_REQUEST)

        # Resolve destination
        try:
            destination = DestinationZone.objects.get(id=data['destination_id'], is_active=True)
        except DestinationZone.DoesNotExist:
            return Response({'error': 'Destination not found'}, status=status.HTTP_404_NOT_FOUND)

        terminal = destination.terminal
        trip_type = data['trip_type']
        party_size = data.get('party_size', 1)

        # Check discount
        is_discounted = request.user.is_discount_verified and request.user.discount_type != 'NONE'

        fare_calc = calculate_trip_fare(
            distance_km=destination.distance_km,
            trip_type=trip_type,
            is_discounted=is_discounted,
            base_override=destination.base_fare_override
        )

        computed_fare = fare_calc['total_fare']
        if trip_type == TripType.REGULAR and party_size > 1:
            computed_fare = computed_fare * party_size

        queue_number = generate_queue_number(terminal, trip_type)

        entry = PassengerQueueEntry.objects.create(
            user=request.user,
            terminal=terminal,
            destination=destination,
            trip_type=trip_type,
            party_size=party_size,
            queue_number=queue_number,
            status=QueueStatus.WAITING,
            distance_km=destination.distance_km,
            is_discounted=is_discounted,
            computed_fare=computed_fare
        )

        # Check if immediate dispatch can happen
        check_and_dispatch(terminal.id)
        broadcast_board_update(terminal.id)

        # Re-fetch entry in case it was immediately assigned
        entry.refresh_from_db()

        return Response(PassengerQueueEntrySerializer(entry).data, status=status.HTTP_201_CREATED)

class MyQueueStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        entry = PassengerQueueEntry.objects.filter(
            user=request.user,
            status__in=[QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_TRANSIT]
        ).first()

        if not entry:
            return Response({'has_active_queue': False})

        return Response({
            'has_active_queue': True,
            'entry': PassengerQueueEntrySerializer(entry).data
        })

class CancelQueueView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, entry_id):
        try:
            entry = PassengerQueueEntry.objects.get(id=entry_id, user=request.user, status=QueueStatus.WAITING)
        except PassengerQueueEntry.DoesNotExist:
            return Response({'error': 'Active waiting entry not found'}, status=status.HTTP_404_NOT_FOUND)

        entry.status = QueueStatus.CANCELLED
        entry.save()

        broadcast_board_update(entry.terminal_id)

        return Response({'message': 'Queue entry cancelled successfully.'})

class DriverManualDispatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            profile = request.user.driver_profile
        except DriverProfile.DoesNotExist:
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)

        if not profile.terminal:
            return Response({'error': 'Driver not assigned to a terminal'}, status=status.HTTP_400_BAD_REQUEST)

        # Trigger manual override dispatch with current waiting passengers
        dispatch = check_and_dispatch(
            terminal_id=profile.terminal_id,
            manual_override=True,
            driver_override_profile=profile
        )

        if not dispatch:
            return Response({'error': 'No waiting passengers available to dispatch.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Tricycle dispatch triggered successfully.',
            'dispatch_id': dispatch.id,
            'dispatch_number': dispatch.dispatch_number,
        })

class TripTicketDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            entry = PassengerQueueEntry.objects.get(ticket_qr_token=token)
        except PassengerQueueEntry.DoesNotExist:
            return Response({'error': 'Invalid ticket token'}, status=status.HTTP_404_NOT_FOUND)

        dispatch = entry.trip_dispatches.first()
        assigned_driver = None
        if dispatch:
            driver = dispatch.driver
            assigned_driver = {
                'body_number': driver.body_number,
                'plate_number': driver.plate_number,
                'driver_name': driver.user.get_full_name() or driver.user.username,
            }

        return Response({
            'ticket_token': entry.ticket_qr_token,
            'queue_number': entry.queue_number,
            'status': entry.status,
            'terminal_name': entry.terminal.name,
            'destination_name': entry.destination.name,
            'distance_km': float(entry.distance_km),
            'trip_type': entry.trip_type,
            'party_size': entry.party_size,
            'passenger_name': entry.user.get_full_name() or entry.user.username,
            'is_discounted': entry.is_discounted,
            'computed_fare': float(entry.computed_fare),
            'assigned_driver': assigned_driver,
            'joined_at': entry.joined_at,
            'called_at': entry.called_at,
        })

class ValidateBoardingTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        raw_token = request.data.get('ticket_token', '').strip()
        if not raw_token:
            return Response({'error': 'Ticket token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # If a full URL is scanned, extract token
        token = raw_token.split('/')[-1].strip()

        try:
            entry = PassengerQueueEntry.objects.get(ticket_qr_token=token)
        except PassengerQueueEntry.DoesNotExist:
            return Response({'error': f'Invalid ticket token: {token}'}, status=status.HTTP_404_NOT_FOUND)

        driver_profile = getattr(request.user, 'driver_profile', None)
        if driver_profile:
            dispatch = TripDispatch.objects.filter(driver=driver_profile, completed_at__isnull=True).first()
            if not dispatch or not dispatch.passenger_entries.filter(id=entry.id).exists():
                return Response({
                    'error': f'Ticket {entry.queue_number} is not assigned to your active tricycle dispatch.'
                }, status=status.HTTP_400_BAD_REQUEST)

        was_already_boarded = entry.is_boarded
        entry.is_boarded = True
        if not entry.boarded_at:
            entry.boarded_at = timezone.now()
        entry.save()

        return Response({
            'success': True,
            'message': 'Passenger verified and marked boarded!' if not was_already_boarded else 'Passenger was already verified.',
            'was_already_boarded': was_already_boarded,
            'passenger': {
                'id': entry.id,
                'queue_number': entry.queue_number,
                'passenger_name': entry.user.get_full_name() or entry.user.username,
                'destination': entry.destination.name,
                'computed_fare': float(entry.computed_fare),
                'is_discounted': entry.is_discounted,
                'is_boarded': True,
            }
        })
