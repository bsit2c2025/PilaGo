from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import DriverProfile, DriverStatus
from .serializers import DriverProfileSerializer
from terminals.models import Terminal
from trips.models import TripDispatch

class DriverProfileDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.driver_profile
            return Response(DriverProfileSerializer(profile).data)
        except DriverProfile.DoesNotExist:
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)

class DriverCheckInView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            profile = request.user.driver_profile
        except DriverProfile.DoesNotExist:
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)

        terminal_id = request.data.get('terminal_id')
        if not terminal_id and not profile.terminal:
            return Response({'error': 'terminal_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        if terminal_id:
            try:
                terminal = Terminal.objects.get(id=terminal_id, is_active=True)
                profile.terminal = terminal
            except Terminal.DoesNotExist:
                return Response({'error': 'Terminal not found'}, status=status.HTTP_404_NOT_FOUND)

        profile.status = DriverStatus.QUEUED
        profile.queue_entered_at = timezone.now()
        profile.save()

        # Trigger queue check in case passengers are already waiting!
        from trips.dispatch_service import check_and_dispatch
        check_and_dispatch(profile.terminal_id)

        return Response({
            'message': f'Checked in to {profile.terminal.name} FIFO queue.',
            'profile': DriverProfileSerializer(profile).data
        })

class DriverStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        try:
            profile = request.user.driver_profile
        except DriverProfile.DoesNotExist:
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in DriverStatus.values:
            return Response({'error': f'Invalid status. Allowed: {DriverStatus.values}'}, status=status.HTTP_400_BAD_REQUEST)

        profile.status = new_status
        if new_status == DriverStatus.QUEUED:
            profile.queue_entered_at = timezone.now()
        elif new_status in [DriverStatus.OFFLINE, DriverStatus.PAUSED]:
            profile.queue_entered_at = None
        profile.save()

        if new_status == DriverStatus.QUEUED and profile.terminal_id:
            from trips.dispatch_service import check_and_dispatch
            check_and_dispatch(profile.terminal_id)

        return Response(DriverProfileSerializer(profile).data)

class DriverCurrentAssignmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.driver_profile
        except DriverProfile.DoesNotExist:
            return Response({'error': 'Driver profile not found'}, status=status.HTTP_404_NOT_FOUND)

        dispatch = TripDispatch.objects.filter(
            driver=profile,
            completed_at__isnull=True
        ).first()

        if not dispatch:
            return Response({
                'has_assignment': False,
                'driver_status': profile.status,
                'queue_position': DriverProfileSerializer(profile).data['queue_position'],
            })

        passengers = []
        for p in dispatch.passenger_entries.all():
            passengers.append({
                'id': p.id,
                'queue_number': p.queue_number,
                'passenger_name': p.user.get_full_name() or p.user.username,
                'destination': p.destination.name,
                'distance_km': float(p.distance_km),
                'computed_fare': float(p.computed_fare),
                'is_discounted': p.is_discounted,
                'is_boarded': p.is_boarded,
                'ticket_qr_token': p.ticket_qr_token,
                'status': p.status,
            })

        return Response({
            'has_assignment': True,
            'dispatch_id': dispatch.id,
            'dispatch_number': dispatch.dispatch_number,
            'trip_type': dispatch.trip_type,
            'total_fare': float(dispatch.total_fare),
            'dispatched_at': dispatch.dispatched_at,
            'passengers': passengers,
        })

class CompleteTripView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, dispatch_id):
        try:
            profile = request.user.driver_profile
            dispatch = TripDispatch.objects.get(id=dispatch_id, driver=profile, completed_at__isnull=True)
        except (DriverProfile.DoesNotExist, TripDispatch.DoesNotExist):
            return Response({'error': 'Active dispatch not found'}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        dispatch.completed_at = now
        dispatch.save()

        # Update passenger entries
        dispatch.passenger_entries.update(status='COMPLETED', completed_at=now)

        # Prompt driver to re-enter queue if they want
        re_enter = request.data.get('re_enter_queue', True)
        if re_enter and profile.terminal:
            profile.status = DriverStatus.QUEUED
            profile.queue_entered_at = now
        else:
            profile.status = DriverStatus.OFFLINE
            profile.queue_entered_at = None
        profile.save()

        # Broadcast update to terminal
        from trips.dispatch_service import broadcast_board_update
        broadcast_board_update(dispatch.terminal_id)

        return Response({
            'message': 'Trip marked completed successfully.',
            'profile': DriverProfileSerializer(profile).data
        })
