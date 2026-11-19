import uuid
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import PassengerQueueEntry, TripDispatch, QueueStatus, TripType
from drivers.models import DriverProfile, DriverStatus
from terminals.models import Terminal

def generate_queue_number(terminal: Terminal, trip_type: str) -> str:
    """
    Generates daily sequential queue numbers: R-001, S-042
    """
    prefix = 'R' if trip_type == TripType.REGULAR else 'S'
    start_of_day = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    count_today = PassengerQueueEntry.objects.filter(
        terminal=terminal,
        trip_type=trip_type,
        joined_at__gte=start_of_day
    ).count() + 1
    return f"{prefix}-{count_today:03d}"

def broadcast_board_update(terminal_id: int):
    """
    Pushes live update to the public TV queue monitor and active clients.
    """
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    try:
        terminal = Terminal.objects.get(id=terminal_id)
    except Terminal.DoesNotExist:
        return

    # Fetch active boarding dispatches
    active_dispatches = TripDispatch.objects.filter(
        terminal=terminal,
        completed_at__isnull=True
    ).order_by('-dispatched_at')[:5]

    boarding_list = []
    for d in active_dispatches:
        boarding_list.append({
            'dispatch_number': d.dispatch_number,
            'trip_type': d.trip_type,
            'body_number': d.driver.body_number,
            'queue_numbers': list(d.passenger_entries.values_list('queue_number', flat=True)),
        })

    data = {
        'type': 'board_refresh',
        'terminal_id': terminal_id,
        'terminal_name': terminal.name,
        'now_boarding': boarding_list,
        'waiting_regular_count': PassengerQueueEntry.objects.filter(terminal=terminal, trip_type=TripType.REGULAR, status=QueueStatus.WAITING).count(),
        'waiting_special_count': PassengerQueueEntry.objects.filter(terminal=terminal, trip_type=TripType.SPECIAL, status=QueueStatus.WAITING).count(),
        'available_drivers_count': DriverProfile.objects.filter(terminal=terminal, status=DriverStatus.QUEUED).count(),
        'updated_at': timezone.now().isoformat(),
    }

    async_to_sync(channel_layer.group_send)(
        f"terminal_{terminal_id}_board",
        {
            'type': 'board.message',
            'data': data
        }
    )

def check_and_dispatch(terminal_id: int, manual_override: bool = False, driver_override_profile: DriverProfile = None):
    """
    Evaluates passenger and driver queues and triggers dispatches based on FIFO.
    """
    terminal = Terminal.objects.get(id=terminal_id)
    now = timezone.now()

    # 1. Check for SPECIAL trips first (1 passenger / booking = 1 tricycle immediately)
    waiting_special = PassengerQueueEntry.objects.filter(
        terminal=terminal,
        trip_type=TripType.SPECIAL,
        status=QueueStatus.WAITING
    ).order_by('joined_at').first()

    if waiting_special:
        # Find head driver in FIFO
        head_driver = DriverProfile.objects.filter(
            terminal=terminal,
            status=DriverStatus.QUEUED
        ).order_by('queue_entered_at').first()

        if head_driver:
            dispatch = TripDispatch.objects.create(
                dispatch_number=f"DSP-{uuid.uuid4().hex[:8].upper()}",
                driver=head_driver,
                terminal=terminal,
                trip_type=TripType.SPECIAL,
                total_fare=waiting_special.computed_fare
            )
            dispatch.passenger_entries.add(waiting_special)
            waiting_special.status = QueueStatus.CALLED
            waiting_special.called_at = now
            waiting_special.save()

            head_driver.status = DriverStatus.ASSIGNED
            head_driver.save()

            broadcast_board_update(terminal_id)
            return dispatch

    # 2. Check for REGULAR trips (capacity = 4 pax or manual driver override)
    waiting_regular = list(
        PassengerQueueEntry.objects.filter(
            terminal=terminal,
            trip_type=TripType.REGULAR,
            status=QueueStatus.WAITING
        ).order_by('joined_at')[:terminal.regular_capacity_per_tricycle]
    )

    pax_count = len(waiting_regular)
    can_dispatch = (pax_count >= terminal.regular_capacity_per_tricycle) or (manual_override and pax_count > 0)

    if can_dispatch:
        # Select driver: either the driver who requested manual override or head FIFO driver
        assigned_driver = driver_override_profile or DriverProfile.objects.filter(
            terminal=terminal,
            status=DriverStatus.QUEUED
        ).order_by('queue_entered_at').first()

        if assigned_driver:
            total_fare = sum(p.computed_fare for p in waiting_regular)
            dispatch = TripDispatch.objects.create(
                dispatch_number=f"DSP-{uuid.uuid4().hex[:8].upper()}",
                driver=assigned_driver,
                terminal=terminal,
                trip_type=TripType.REGULAR,
                total_fare=total_fare
            )
            dispatch.passenger_entries.set(waiting_regular)

            for p in waiting_regular:
                p.status = QueueStatus.CALLED
                p.called_at = now
                p.save()

            assigned_driver.status = DriverStatus.ASSIGNED
            assigned_driver.save()

            broadcast_board_update(terminal_id)
            return dispatch

    return None
