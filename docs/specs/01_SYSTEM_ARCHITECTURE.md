# 01 - System Architecture & Data Models

## 1. System Overview
**PilaGo** is a digital tricycle queue management system with automated, transparent fare calculation and digital trip ticketing.

### Architecture Topology
- **Repository Structure:** Monorepo containing:
  - `backend/`: Django 5.x, Django REST Framework, Django Channels (ASGI/Daphne), PostgreSQL / SQLite.
  - `frontend/`: React 18+ (Vite), Tailwind CSS, shadcn/ui, Lucide React, WebSocket client.
  - `docs/`: Design system, architecture specs, and style guide.
- **Protocol Layer:**
  - RESTful JSON API: Authentication, profile management, terminal configuration, fare matrix queries, administrative CRUD, and historical reports.
  - WebSockets (ASGI): Bidirectional live queue tracking, driver dispatch signaling, and public terminal board synchronization.

---

## 2. Database Schema & Data Models

### 2.1 User & Authentication (`accounts` app)
Custom User model extending `AbstractUser` supporting login via Email or Phone Number with JWT authentication (via `djangorestframework-simplejwt`).

```python
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
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.PASSENGER)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices, default=DiscountType.NONE)
    discount_id_image = models.ImageField(upload_to='discount_ids/', null=True, blank=True)
    is_discount_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 2.2 Terminals & Fare Matrix (`terminals` app)

```python
class Terminal(models.Model):
    name = models.CharField(max_length=150) # e.g. "Bayan Central Terminal"
    code = models.SlugField(unique=True)     # e.g. "bayan-central"
    address = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    qr_code_token = models.CharField(max_length=64, unique=True) # Token encoded in terminal's physical QR code
    is_active = models.BooleanField(default=True)
    regular_capacity_per_tricycle = models.PositiveSmallIntegerField(default=4)
    created_at = models.DateTimeField(auto_now_add=True)

class DestinationZone(models.Model):
    terminal = models.ForeignKey(Terminal, on_delete=models.CASCADE, related_name='destinations')
    name = models.CharField(max_length=150) # e.g. "Barangay Poblacion / City Hall"
    distance_km = models.DecimalField(max_digits=5, decimal_places=2) # e.g. 2.50
    base_fare_override = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
```

### 2.3 Driver Roster & Queue (`drivers` app)

```python
class DriverStatus(models.TextChoices):
    OFFLINE = 'OFFLINE', 'Offline'
    QUEUED = 'QUEUED', 'In Terminal Queue'
    ASSIGNED = 'ASSIGNED', 'Assigned / Boarding'
    ON_TRIP = 'ON_TRIP', 'On Trip'
    PAUSED = 'PAUSED', 'On Break / Unavailable'

class DriverProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    terminal = models.ForeignKey(Terminal, on_delete=models.SET_NULL, null=True, blank=True, related_name='drivers')
    license_number = models.CharField(max_length=50)
    body_number = models.CharField(max_length=20) # e.g. "042" (Tricycle body number)
    plate_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=DriverStatus.choices, default=DriverStatus.OFFLINE)
    queue_entered_at = models.DateTimeField(null=True, blank=True) # Used for strict FIFO ordering
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
```

### 2.4 Passenger Queue Entries & Trips (`trips` app)

```python
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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='queue_entries')
    terminal = models.ForeignKey(Terminal, on_delete=models.CASCADE, related_name='passenger_queue')
    destination = models.ForeignKey(DestinationZone, on_delete=models.PROTECT)
    trip_type = models.CharField(max_length=20, choices=TripType.choices, default=TripType.REGULAR)
    party_size = models.PositiveSmallIntegerField(default=1) # Regular: 1-4; Special: 1
    queue_number = models.CharField(max_length=20) # e.g. "R-101", "S-042"
    status = models.CharField(max_length=20, choices=QueueStatus.choices, default=QueueStatus.WAITING)
    
    # Fare breakdown snapshots at booking time
    distance_km = models.DecimalField(max_digits=5, decimal_places=2)
    is_discounted = models.BooleanField(default=False)
    computed_fare = models.DecimalField(max_digits=6, decimal_places=2)
    ticket_qr_token = models.CharField(max_length=64, unique=True)
    
    joined_at = models.DateTimeField(auto_now_add=True)
    called_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

class TripDispatch(models.Model):
    dispatch_number = models.CharField(max_length=30, unique=True)
    driver = models.ForeignKey(DriverProfile, on_delete=models.PROTECT, related_name='dispatches')
    terminal = models.ForeignKey(Terminal, on_delete=models.CASCADE, related_name='dispatches')
    trip_type = models.CharField(max_length=20, choices=TripType.choices)
    passenger_entries = models.ManyToManyField(PassengerQueueEntry, related_name='trip_dispatches')
    total_fare = models.DecimalField(max_digits=8, decimal_places=2)
    dispatched_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
```

---

## 3. REST API Specification

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/register/` | POST | Public | Register passenger or driver account |
| `/api/auth/login/` | POST | Public | JWT login with phone/email and password |
| `/api/auth/refresh/` | POST | Public | Refresh JWT access token |
| `/api/users/profile/` | GET/PATCH | Auth | Read/update profile; upload discount ID |
| `/api/terminals/` | GET | Public | List active terminals with queue counts |
| `/api/terminals/{slug}/` | GET | Public | Terminal details and destination zones |
| `/api/fare/calculate/` | POST | Public | Calculate fare preview for destination & trip type |
| `/api/queue/join/` | POST | Passenger | Join queue (remote or by scanning terminal QR) |
| `/api/queue/my-status/` | GET | Passenger | Active queue entry, number, people ahead |
| `/api/queue/cancel/` | POST | Passenger | Cancel waiting queue entry |
| `/api/driver/check-in/` | POST | Driver | Enter terminal FIFO queue |
| `/api/driver/status/` | PATCH | Driver | Toggle status (PAUSED / QUEUED / OFFLINE) |
| `/api/driver/dispatch-override/`| POST | Driver | Driver manual dispatch when ready |
| `/api/admin/terminals/` | CRUD | Admin | Manage terminals & destination fare matrix |
| `/api/admin/drivers/` | GET/PATCH | Admin | Manage driver approvals & roster |
| `/api/admin/discounts/pending/`| GET/PATCH | Admin | Review & approve passenger discount IDs |
| `/api/public/board/{slug}/` | GET | Public | Snapshot for Public Terminal Queue Board |

---

## 4. WebSocket (Django Channels) Architecture

### Channel Groups:
1. `terminal_{terminal_id}_board`: Broadcasts live updates for the public waiting shed TV display.
2. `terminal_{terminal_id}_drivers`: Broadcasts queue order and dispatch calls to all queued drivers.
3. `passenger_{user_id}`: Dedicated direct push for a passenger's position updates, "Next in line" alerts, and driver arrival notifications.

### WebSocket Events:
- `queue.passenger_joined`: Triggered when a new passenger queues up.
- `queue.driver_queued`: Triggered when a driver checks into the FIFO queue.
- `queue.trip_assigned`: Triggered when Driver #1 is assigned passengers and summoned to the boarding bay.
- `queue.dispatched`: Triggered when the tricycle departs terminal.
- `queue.status_update`: Periodic/delta broadcast of position (`people_ahead`).
