from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Terminal, DestinationZone
from .serializers import TerminalSerializer, DestinationZoneSerializer
from trips.models import PassengerQueueEntry, TripDispatch

class TerminalListView(generics.ListCreateAPIView):
    queryset = Terminal.objects.filter(is_active=True)
    serializer_class = TerminalSerializer
    permission_classes = [permissions.AllowAny]

class TerminalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Terminal.objects.all()
    serializer_class = TerminalSerializer
    lookup_field = 'code'
    permission_classes = [permissions.AllowAny]

class DestinationZoneListCreateView(generics.ListCreateAPIView):
    serializer_class = DestinationZoneSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        terminal_id = self.request.query_params.get('terminal')
        if terminal_id:
            return DestinationZone.objects.filter(terminal_id=terminal_id, is_active=True)
        return DestinationZone.objects.filter(is_active=True)

class PublicBoardSnapshotView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, code):
        try:
            terminal = Terminal.objects.get(code=code, is_active=True)
        except Terminal.DoesNotExist:
            return Response({'error': 'Terminal not found'}, status=status.HTTP_404_NOT_FOUND)

        # Active dispatches / boarding
        active_dispatches = TripDispatch.objects.filter(
            terminal=terminal,
            completed_at__isnull=True
        ).order_by('-dispatched_at')[:5]

        boarding_list = []
        for d in active_dispatches:
            numbers = list(d.passenger_entries.values_list('queue_number', flat=True))
            boarding_list.append({
                'dispatch_number': d.dispatch_number,
                'trip_type': d.trip_type,
                'body_number': d.driver.body_number,
                'plate_number': d.driver.plate_number,
                'driver_name': d.driver.user.get_full_name() or d.driver.user.username,
                'queue_numbers': numbers,
                'dispatched_at': d.dispatched_at,
            })

        # Upcoming waiting passengers
        upcoming_regular = list(
            PassengerQueueEntry.objects.filter(
                terminal=terminal, trip_type='REGULAR', status='WAITING'
            ).order_by('joined_at').values_list('queue_number', flat=True)[:10]
        )

        upcoming_special = list(
            PassengerQueueEntry.objects.filter(
                terminal=terminal, trip_type='SPECIAL', status='WAITING'
            ).order_by('joined_at').values_list('queue_number', flat=True)[:10]
        )

        # Driver queue FIFO order
        drivers_in_queue = []
        for d in terminal.drivers.filter(status='QUEUED').order_by('queue_entered_at'):
            drivers_in_queue.append({
                'body_number': d.body_number,
                'plate_number': d.plate_number,
                'driver_name': d.user.get_full_name() or d.user.username,
                'rating': float(d.rating),
            })

        return Response({
            'terminal': {
                'id': terminal.id,
                'name': terminal.name,
                'code': terminal.code,
                'address': terminal.address,
                'regular_capacity': terminal.regular_capacity_per_tricycle,
            },
            'now_boarding': boarding_list,
            'upcoming_regular': upcoming_regular,
            'upcoming_special': upcoming_special,
            'drivers_in_queue': drivers_in_queue,
            'waiting_regular_count': PassengerQueueEntry.objects.filter(terminal=terminal, trip_type='REGULAR', status='WAITING').count(),
            'waiting_special_count': PassengerQueueEntry.objects.filter(terminal=terminal, trip_type='SPECIAL', status='WAITING').count(),
            'available_drivers_count': len(drivers_in_queue),
        })
