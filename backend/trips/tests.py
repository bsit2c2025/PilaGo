from decimal import Decimal
from django.test import TestCase
from trips.fare_calculator import calculate_trip_fare

class FareCalculatorTests(TestCase):
    def test_regular_short_distance_under_2km(self):
        # Within base 2.0 km
        res = calculate_trip_fare(distance_km='1.5', trip_type='REGULAR', is_discounted=False)
        self.assertEqual(res['base_fare'], 20.00)
        self.assertEqual(res['distance_charge'], 0.00)
        self.assertEqual(res['total_fare'], 20.00)

    def test_regular_discounted_short_distance(self):
        # Student / Senior / PWD within 2.0 km -> 20% off base (₱16.00)
        res = calculate_trip_fare(distance_km='1.8', trip_type='REGULAR', is_discounted=True)
        self.assertEqual(res['base_fare'], 16.00)
        self.assertEqual(res['distance_charge'], 0.00)
        self.assertEqual(res['total_fare'], 16.00)

    def test_regular_succeeding_distance(self):
        # 4.5 km -> Base (2 km) = ₱20, Extra (2.5 km * ₱5.00) = ₱12.50 -> Total ₱32.50
        res = calculate_trip_fare(distance_km='4.5', trip_type='REGULAR', is_discounted=False)
        self.assertEqual(res['base_fare'], 20.00)
        self.assertEqual(res['extra_km'], 2.50)
        self.assertEqual(res['distance_charge'], 12.50)
        self.assertEqual(res['total_fare'], 32.50)

    def test_regular_succeeding_distance_discounted(self):
        # 4.5 km discounted -> Base = ₱16, Extra (2.5 km * ₱4.00) = ₱10.00 -> Total ₱26.00
        res = calculate_trip_fare(distance_km='4.5', trip_type='REGULAR', is_discounted=True)
        self.assertEqual(res['base_fare'], 16.00)
        self.assertEqual(res['extra_km'], 2.50)
        self.assertEqual(res['distance_charge'], 10.00)
        self.assertEqual(res['total_fare'], 26.00)

    def test_special_short_distance(self):
        # Special trip within 2.0 km -> ₱60.00
        res = calculate_trip_fare(distance_km='2.0', trip_type='SPECIAL', is_discounted=False)
        self.assertEqual(res['base_fare'], 60.00)
        self.assertEqual(res['total_fare'], 60.00)

    def test_special_discounted_short_distance(self):
        # Special trip within 2.0 km discounted -> ₱48.00
        res = calculate_trip_fare(distance_km='1.2', trip_type='SPECIAL', is_discounted=True)
        self.assertEqual(res['base_fare'], 48.00)
        self.assertEqual(res['total_fare'], 48.00)

    def test_special_succeeding_distance(self):
        # 3.0 km special -> Base = ₱60, Extra (1.0 km * ₱15.00) = ₱15.00 -> Total ₱75.00
        res = calculate_trip_fare(distance_km='3.0', trip_type='SPECIAL', is_discounted=False)
        self.assertEqual(res['base_fare'], 60.00)
        self.assertEqual(res['extra_km'], 1.00)
        self.assertEqual(res['distance_charge'], 15.00)
        self.assertEqual(res['total_fare'], 75.00)

    def test_special_succeeding_distance_discounted(self):
        # 3.0 km special discounted -> Base = ₱48, Extra (1.0 km * ₱12.00) = ₱12.00 -> Total ₱60.00
        res = calculate_trip_fare(distance_km='3.0', trip_type='SPECIAL', is_discounted=True)
        self.assertEqual(res['base_fare'], 48.00)
        self.assertEqual(res['extra_km'], 1.00)
        self.assertEqual(res['distance_charge'], 12.00)
        self.assertEqual(res['total_fare'], 60.00)
