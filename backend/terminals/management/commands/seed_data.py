from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from terminals.models import Terminal, DestinationZone
from drivers.models import DriverProfile, DriverStatus
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial terminals, destination fare matrix, and test users.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding PilaGo initial data...')

        # 1. Admin
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@pilago.ph',
                'first_name': 'Terminal',
                'last_name': 'Admin',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created admin user (admin / admin123)'))

        # 2. Terminals
        term1, _ = Terminal.objects.get_or_create(
            code='bayan-central',
            defaults={
                'name': 'Bayan Central Terminal',
                'address': 'Rizal Avenue cor. Bonifacio St., City Proper',
                'latitude': 14.5995,
                'longitude': 120.9842,
                'regular_capacity_per_tricycle': 4,
            }
        )

        term2, _ = Terminal.objects.get_or_create(
            code='north-junction',
            defaults={
                'name': 'North Highway Junction Terminal',
                'address': 'MacArthur Highway cor. Diversion Rd.',
                'latitude': 14.6500,
                'longitude': 120.9900,
                'regular_capacity_per_tricycle': 4,
            }
        )

        # 3. Destinations for Bayan Central
        destinations_data = [
            ("City Hall & Public Market", 1.50, None),
            ("Provincial High School", 2.00, None),
            ("Fisherman's Wharf / Baywalk", 3.20, None),
            ("Barangay San Isidro", 4.50, None),
            ("Regional Hospital & Medical Center", 6.00, None),
            ("San Roque Chapel & Plaza", 2.80, None),
        ]

        for name, dist, override in destinations_data:
            DestinationZone.objects.get_or_create(
                terminal=term1,
                name=name,
                defaults={'distance_km': dist, 'base_fare_override': override}
            )

        # Destinations for North Junction
        DestinationZone.objects.get_or_create(
            terminal=term2,
            name="Central Terminal Transfer",
            defaults={'distance_km': 2.50}
        )
        DestinationZone.objects.get_or_create(
            terminal=term2,
            name="Agri-Industrial Park",
            defaults={'distance_km': 5.00}
        )

        # 4. Drivers
        d1_user, _ = User.objects.get_or_create(
            username='driver_pedro',
            defaults={
                'email': 'pedro@driver.pilago.ph',
                'first_name': 'Pedro',
                'last_name': 'Penduko',
                'phone_number': '09171234567',
                'role': 'DRIVER',
            }
        )
        d1_user.set_password('driver123')
        d1_user.save()

        DriverProfile.objects.get_or_create(
            user=d1_user,
            defaults={
                'terminal': term1,
                'license_number': 'N01-12-987654',
                'body_number': '042',
                'plate_number': 'ABC-1234',
                'status': DriverStatus.QUEUED,
                'queue_entered_at': timezone.now(),
            }
        )

        d2_user, _ = User.objects.get_or_create(
            username='driver_juan',
            defaults={
                'email': 'juan@driver.pilago.ph',
                'first_name': 'Juan',
                'last_name': 'Tamad',
                'phone_number': '09187654321',
                'role': 'DRIVER',
            }
        )
        d2_user.set_password('driver123')
        d2_user.save()

        DriverProfile.objects.get_or_create(
            user=d2_user,
            defaults={
                'terminal': term1,
                'license_number': 'N01-14-112233',
                'body_number': '019',
                'plate_number': 'XYZ-5678',
                'status': DriverStatus.QUEUED,
                'queue_entered_at': timezone.now() + timezone.timedelta(minutes=5),
            }
        )

        # 5. Passengers
        # Regular
        p1, _ = User.objects.get_or_create(
            username='passenger_maria',
            defaults={
                'email': 'maria@passenger.pilago.ph',
                'first_name': 'Maria',
                'last_name': 'Clara',
                'phone_number': '09201112233',
                'role': 'PASSENGER',
                'discount_type': 'NONE',
            }
        )
        p1.set_password('pass123')
        p1.save()

        # Student Discounted
        p2, _ = User.objects.get_or_create(
            username='student_carlos',
            defaults={
                'email': 'carlos@student.pilago.ph',
                'first_name': 'Carlos',
                'last_name': 'Perez',
                'phone_number': '09203334455',
                'role': 'PASSENGER',
                'discount_type': 'STUDENT',
                'is_discount_verified': True,
            }
        )
        p2.set_password('pass123')
        p2.save()

        # Senior Discounted
        p3, _ = User.objects.get_or_create(
            username='senior_lola',
            defaults={
                'email': 'lola@senior.pilago.ph',
                'first_name': 'Lourdes',
                'last_name': 'Reyes',
                'phone_number': '09205556677',
                'role': 'PASSENGER',
                'discount_type': 'SENIOR',
                'is_discount_verified': True,
            }
        )
        p3.set_password('pass123')
        p3.save()

        self.stdout.write(self.style.SUCCESS('Successfully seeded PilaGo data!'))
