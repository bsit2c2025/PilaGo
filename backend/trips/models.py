import uuid
from django.db import models
from django.conf import settings
from terminals.models import Terminal, DestinationZone
from drivers.models import DriverProfile

class TripType(models.TextChoices):
    REGULAR = 'REGULAR', 'Regular Trip (Shared)'
    SPECIAL = 'SPECIAL', 'Special Trip ("Extra" / Solo)'

class QueueStatus(models.TextChoices):
    WAITING = 'WAITING', 'Waiting in Queue'
    CALLED = 'CALLED', 'Next in Line / Boarding'
    IN_TRANSIT = 'IN_TRANSIT', 'Dispatched / In Transit'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class PassengerQueueEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='queue_entries')
    terminal = models.ForeignKey(Terminal, on_delete=models.CASCADE, related_name='passenger_queue')
    destination = models.ForeignKey(DestinationZone, on_delete=models.PROTECT, related_name='queue_entries')
    trip_type = models.CharField(max_length=20, choices=TripType.choices, default=TripType.REGULAR)
    party_size = models.PositiveSmallIntegerField(default=1)
    queue_number = models.CharField(max_length=20) # e.g. "R-101", "S-042"
    status = models.CharField(max_length=20, choices=QueueStatus.choices, default=QueueStatus.WAITING)
    
    # Snapshot at booking time
    distance_km = models.DecimalField(max_digits=5, decimal_places=2)
    is_discounted = models.BooleanField(default=False)
    computed_fare = models.DecimalField(max_digits=6, decimal_places=2)
    ticket_qr_token = models.CharField(max_length=64, unique=True, blank=True)
    is_boarded = models.BooleanField(default=False)
    boarded_at = models.DateTimeField(null=True, blank=True)
    
    joined_at = models.DateTimeField(auto_now_add=True)
    called_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['joined_at']

    def save(self, *args, **kwargs):
        if not self.ticket_qr_token:
            self.ticket_qr_token = f"TKT-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.queue_number} ({self.trip_type}) - {self.destination.name}"

class TripDispatch(models.Model):
    dispatch_number = models.CharField(max_length=30, unique=True)
    driver = models.ForeignKey(DriverProfile, on_delete=models.PROTECT, related_name='dispatches')
    terminal = models.ForeignKey(Terminal, on_delete=models.CASCADE, related_name='dispatches')
    trip_type = models.CharField(max_length=20, choices=TripType.choices)
    passenger_entries = models.ManyToManyField(PassengerQueueEntry, related_name='trip_dispatches')
    total_fare = models.DecimalField(max_digits=8, decimal_places=2)
    dispatched_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-dispatched_at']

    def __str__(self):
        return f"Dispatch {self.dispatch_number} (Tricycle #{self.driver.body_number})"
