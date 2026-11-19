from rest_framework import serializers
from .models import Terminal, DestinationZone

class DestinationZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DestinationZone
        fields = ['id', 'terminal', 'name', 'distance_km', 'base_fare_override', 'is_active']

class TerminalSerializer(serializers.ModelSerializer):
    destinations = DestinationZoneSerializer(many=True, read_only=True)
    waiting_passengers_count = serializers.SerializerMethodField()
    available_drivers_count = serializers.SerializerMethodField()

    class Meta:
        model = Terminal
        fields = [
            'id', 'name', 'code', 'address', 'latitude', 'longitude',
            'qr_code_token', 'is_active', 'regular_capacity_per_tricycle',
            'destinations', 'waiting_passengers_count', 'available_drivers_count'
        ]

    def get_waiting_passengers_count(self, obj):
        return obj.passenger_queue.filter(status='WAITING').count()

    def get_available_drivers_count(self, obj):
        return obj.drivers.filter(status='QUEUED').count()
