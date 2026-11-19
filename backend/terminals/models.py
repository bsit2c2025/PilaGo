import uuid
from django.db import models

class Terminal(models.Model):
    name = models.CharField(max_length=150)
    code = models.SlugField(unique=True)
    address = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    qr_code_token = models.CharField(max_length=64, unique=True, blank=True)
    is_active = models.BooleanField(default=True)
    regular_capacity_per_tricycle = models.PositiveSmallIntegerField(default=4)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.qr_code_token:
            self.qr_code_token = f"TERM-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})"

class DestinationZone(models.Model):
    terminal = models.ForeignKey(Terminal, on_delete=models.CASCADE, related_name='destinations')
    name = models.CharField(max_length=150)
    distance_km = models.DecimalField(max_digits=5, decimal_places=2)
    base_fare_override = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['distance_km', 'name']

    def __str__(self):
        return f"{self.name} ({self.distance_km} km) - {self.terminal.name}"
