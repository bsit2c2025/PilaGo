# 02 - Fare Matrix & Calculation Specification

## 1. Problem Statement & Objectives
Commuters frequently experience unpredictable, arbitrary, or inflated fares at tricycle terminals. Drivers and passengers frequently disagree on rates for long distances, luggage, or "special" solo trips.

**PilaGo eliminates fare disputes by:**
1. Enforcing an immutable, municipality-compliant Fare Matrix.
2. Generating a transparent digital breakdown ticket before the passenger boards.
3. Automatically applying the legal 20% statutory discount for Students, Senior Citizens, and PWDs upon verified ID status.
4. Providing a digital QR-coded receipt for cash payment verification upon arrival.

---

## 2. Fare Computation Rules & Formulas

### 2.1 Pricing Table Reference
| Trip Type | Base Fare (First 2.0 km / City Proper) | Succeeding Rate per km ($d > 2.0$) | Discounted Base (20% Off) | Discounted Succeeding (20% Off) |
|---|---|---|---|---|
| **Regular Trip (Shared)** | **₱20.00** per passenger | **+₱5.00** per km | **₱16.00** per passenger | **+₱4.00** per km |
| **Special Trip ("Extra" / Solo)** | **₱60.00** total | **+₱15.00** per km (or matrix override) | **₱48.00** total | **+₱12.00** per km |

---

### 2.2 Mathematical Formulas

Let:
- $d = \text{Distance in kilometers (from terminal to destination zone)}$
- $d_{\text{extra}} = \max(0, d - 2.0)$
- $\text{is\_discounted} \in \{\text{True}, \text{False}\}$ (Requires approved Student, Senior Citizen, or PWD status)

#### Regular Trip (Shared, Per Passenger):
$$\text{Base} = \begin{cases} 16.00 & \text{if is\_discounted} \\ 20.00 & \text{otherwise} \end{cases}$$

$$\text{Rate}_{\text{km}} = \begin{cases} 4.00 & \text{if is\_discounted} \\ 5.00 & \text{otherwise} \end{cases}$$

$$\text{Fare}_{\text{passenger}} = \text{Base} + (d_{\text{extra}} \times \text{Rate}_{\text{km}})$$

For party booking ($n$ passengers sharing the same ticket):
$$\text{Total Fare} = \sum_{i=1}^{n} \text{Fare}_{\text{passenger}, i}$$

#### Special Trip ("Extra" / Solo, Whole Tricycle):
$$\text{Base}_{\text{special}} = \begin{cases} 48.00 & \text{if is\_discounted} \\ 60.00 & \text{otherwise} \end{cases}$$

$$\text{Rate}_{\text{km, special}} = \begin{cases} 12.00 & \text{if is\_discounted} \\ 15.00 & \text{otherwise} \end{cases}$$

$$\text{Fare}_{\text{special}} = \text{Base}_{\text{special}} + (d_{\text{extra}} \times \text{Rate}_{\text{km, special}})$$

*(Note: If a specific DestinationZone specifies a `base_fare_override`, that override replaces the formula base before applying distance math).*

---

### 2.3 Concrete Calculation Examples

| Destination | Distance ($d$) | Trip Type | Discount Status | Calculation Breakdown | Final Fare |
|---|---|---|---|---|---|
| City Plaza / Poblacion | 1.4 km | Regular | Regular | Base ≤ 2 km: ₱20.00 | **₱20.00** |
| High School | 1.8 km | Regular | Student (20% off) | Base ≤ 2 km: ₱16.00 | **₱16.00** |
| Brgy. San Isidro | 4.5 km | Regular | Regular | ₱20.00 + (2.5 km × ₱5.00) = ₱20 + ₱12.50 | **₱32.50** |
| Brgy. San Isidro | 4.5 km | Regular | Senior (20% off) | ₱16.00 + (2.5 km × ₱4.00) = ₱16 + ₱10.00 | **₱26.00** |
| Provincial Hospital | 3.0 km | Special (Solo) | Regular | ₱60.00 + (1.0 km × ₱15.00) = ₱60 + ₱15.00 | **₱75.00** |
| Provincial Hospital | 3.0 km | Special (Solo) | PWD (20% off) | ₱48.00 + (1.0 km × ₱12.00) = ₱48 + ₱12.00 | **₱60.00** |

---

## 3. Python Service Implementation (`fare_calculator.py`)

```python
from decimal import Decimal, ROUND_HALF_UP

REGULAR_BASE_FARE = Decimal('20.00')
REGULAR_KM_RATE = Decimal('5.00')
REGULAR_DISCOUNTED_BASE = Decimal('16.00')
REGULAR_DISCOUNTED_KM_RATE = Decimal('4.00')

SPECIAL_BASE_FARE = Decimal('60.00')
SPECIAL_KM_RATE = Decimal('15.00')
SPECIAL_DISCOUNTED_BASE = Decimal('48.00')
SPECIAL_DISCOUNTED_KM_RATE = Decimal('12.00')

BASE_DISTANCE_KM = Decimal('2.00')

def calculate_trip_fare(distance_km: Decimal, trip_type: str, is_discounted: bool = False) -> dict:
    distance = Decimal(str(distance_km))
    extra_km = max(Decimal('0.00'), distance - BASE_DISTANCE_KM)
    
    if trip_type == 'REGULAR':
        base = REGULAR_DISCOUNTED_BASE if is_discounted else REGULAR_BASE_FARE
        rate = REGULAR_DISCOUNTED_KM_RATE if is_discounted else REGULAR_KM_RATE
    elif trip_type == 'SPECIAL':
        base = SPECIAL_DISCOUNTED_BASE if is_discounted else SPECIAL_BASE_FARE
        rate = SPECIAL_DISCOUNTED_KM_RATE if is_discounted else SPECIAL_KM_RATE
    else:
        raise ValueError(f"Unknown trip type: {trip_type}")

    distance_charge = (extra_km * rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    total_fare = (base + distance_charge).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    return {
        'trip_type': trip_type,
        'distance_km': float(distance),
        'is_discounted': is_discounted,
        'base_fare': float(base),
        'extra_km': float(extra_km),
        'km_rate': float(rate),
        'distance_charge': float(distance_charge),
        'total_fare': float(total_fare),
    }
```

---

## 4. Digital Trip Ticket & Cash Receipt Schema

When a passenger queues, a signed ticket token is generated. When boarding or paying cash upon drop-off, the driver verifies the trip ticket:

```json
{
  "ticket_token": "TKT-2026-R101-7F9A",
  "queue_number": "R-101",
  "terminal_name": "Bayan Central Terminal",
  "destination": "Barangay San Isidro",
  "distance_km": 4.5,
  "trip_type": "REGULAR",
  "passenger_name": "Juan Dela Cruz",
  "discount_applied": "Senior Citizen (20% Off)",
  "fare_breakdown": {
    "base_fare": 16.00,
    "extra_km": 2.50,
    "rate_per_km": 4.00,
    "distance_fare": 10.00,
    "total_fare": 26.00
  },
  "payment_method": "Cash on Drop-off",
  "assigned_tricycle": {
    "body_number": "042",
    "plate_number": "ABC-1234",
    "driver_name": "Mang Pedro"
  },
  "timestamp": "2026-11-19T07:30:00Z"
}
```
