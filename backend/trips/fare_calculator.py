from decimal import Decimal, ROUND_HALF_UP

# Statutory Rates & Base Fares
REGULAR_BASE_FARE = Decimal('20.00')
REGULAR_KM_RATE = Decimal('5.00')
REGULAR_DISCOUNTED_BASE = Decimal('16.00')       # 20% off 20.00
REGULAR_DISCOUNTED_KM_RATE = Decimal('4.00')     # 20% off 5.00

SPECIAL_BASE_FARE = Decimal('60.00')
SPECIAL_KM_RATE = Decimal('15.00')
SPECIAL_DISCOUNTED_BASE = Decimal('48.00')       # 20% off 60.00
SPECIAL_DISCOUNTED_KM_RATE = Decimal('12.00')    # 20% off 15.00

BASE_DISTANCE_KM = Decimal('2.00')

def calculate_trip_fare(distance_km: Decimal | float | str, trip_type: str, is_discounted: bool = False, base_override: Decimal | float | str | None = None) -> dict:
    """
    Computes transparent fare based on official municipal pricing matrix.
    Regular Trip: ₱20.00 first 2km (+₱5.00/km succeeding). 20% off: ₱16.00 (+₱4.00/km).
    Special Trip: ₱60.00 first 2km (+₱15.00/km succeeding). 20% off: ₱48.00 (+₱12.00/km).
    """
    distance = Decimal(str(distance_km))
    extra_km = max(Decimal('0.00'), distance - BASE_DISTANCE_KM)
    
    trip_type_upper = trip_type.upper()
    
    if trip_type_upper == 'REGULAR':
        base = REGULAR_DISCOUNTED_BASE if is_discounted else REGULAR_BASE_FARE
        rate = REGULAR_DISCOUNTED_KM_RATE if is_discounted else REGULAR_KM_RATE
    elif trip_type_upper == 'SPECIAL':
        base = SPECIAL_DISCOUNTED_BASE if is_discounted else SPECIAL_BASE_FARE
        rate = SPECIAL_DISCOUNTED_KM_RATE if is_discounted else SPECIAL_KM_RATE
    else:
        raise ValueError(f"Unknown trip type: {trip_type}")

    # If terminal has a specific fixed base fare override for a landmark
    if base_override is not None:
        override_dec = Decimal(str(base_override))
        if is_discounted:
            base = (override_dec * Decimal('0.80')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        else:
            base = override_dec

    distance_charge = (extra_km * rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    total_fare = (base + distance_charge).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    return {
        'trip_type': trip_type_upper,
        'distance_km': float(distance),
        'is_discounted': bool(is_discounted),
        'base_fare': float(base),
        'extra_km': float(extra_km),
        'km_rate': float(rate),
        'distance_charge': float(distance_charge),
        'total_fare': float(total_fare),
    }
