from django.db import models
from django.conf import settings
from terminals.models import Terminal

class DriverStatus(models.TextChoices):
    OFFLINE = 'OFFLINE', 'Offline'
    QUEUED = 'QUEUED', 'In Terminal Queue'
    ASSIGNED = 'ASSIGNED', 'Assigned / Boarding'
    ON_TRIP = 'ON_TRIP', 'On Trip'
    PAUSED = 'PAUSED', 'On Break / Unavailable'

class DriverProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver_profile')
    terminal = models.ForeignKey(Terminal, on_delete=models.SET_NULL, null=True, blank=True, related_name='drivers')
    license_number = models.CharField(max_length=50)
    body_number = models.CharField(max_length=20) # e.g. "042"
    plate_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=DriverStatus.choices, default=DriverStatus.OFFLINE)
    queue_entered_at = models.DateTimeField(null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)

    class Meta:
        ordering = ['queue_entered_at']

    def __str__(self):
        return f"Tricycle #{self.body_number} - {self.user.get_full_name() or self.user.username}"
