from django.contrib.auth.models import AbstractUser
from django.db import models

class UserRole(models.TextChoices):
    PASSENGER = 'PASSENGER', 'Passenger'
    DRIVER = 'DRIVER', 'Driver'
    ADMIN = 'ADMIN', 'Terminal Administrator'

class DiscountType(models.TextChoices):
    NONE = 'NONE', 'Regular (No Discount)'
    STUDENT = 'STUDENT', 'Student'
    SENIOR = 'SENIOR', 'Senior Citizen'
    PWD = 'PWD', 'Person with Disability'

class User(AbstractUser):
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.PASSENGER)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices, default=DiscountType.NONE)
    discount_id_image = models.ImageField(upload_to='discount_ids/', null=True, blank=True)
    is_discount_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        name = self.get_full_name() or self.username
        return f"{name} ({self.role})"
