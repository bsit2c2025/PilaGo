from rest_framework import serializers
from .models import PassengerQueueEntry, TripDispatch
from terminals.models import DestinationZone, Terminal
from drivers.models import DriverProfile

class FareCalculationRequestSerializer(serializers.Serializer):
    destination_id = serializers.IntegerField()
    trip_type = serializers.ChoiceField(choices=['REGULAR', 'SPECIAL'])

class JoinQueueSerializer(serializers.Serializer):
    terminal_id = serializers.IntegerField(required=False)
    terminal_code = serializers.CharField(required=False)
    destination_id = serializers.IntegerField()
    trip_type = serializers.ChoiceField(choices=['REGULAR', 'SPECIAL'], default='REGULAR')
    party_size = serializers.IntegerField(default=1, min_value=1, max_value=4)

class PassengerQueueEntrySerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    terminal_name = serializers.CharField(source='terminal.name', read_only=True)
    people_ahead = serializers.SerializerMethodField()
    assigned_tricycle = serializers.SerializerMethodField()

    class Meta:
        model = PassengerQueueEntry
        fields = [
            'id', 'queue_number', 'terminal', 'terminal_name', 'destination', 'destination_name',
            'trip_type', 'party_size', 'status', 'distance_km', 'is_discounted',
            'computed_fare', 'ticket_qr_token', 'is_boarded', 'boarded_at', 'people_ahead', 'assigned_tricycle',
            'joined_at', 'called_at'
        ]
        read_only_fields = ['id', 'queue_number', 'status', 'distance_km', 'is_discounted', 'computed_fare', 'ticket_qr_token', 'is_boarded', 'boarded_at', 'joined_at', 'called_at']

    def get_people_ahead(self, obj):
        if obj.status == 'WAITING':
            return PassengerQueueEntry.objects.filter(
                terminal=obj.terminal,
                trip_type=obj.trip_type,
                status='WAITING',
                joined_at__lt=obj.joined_at
            ).count()
        return 0

    def get_assigned_tricycle(self, obj):
        dispatch = obj.trip_dispatches.first()
        if dispatch:
            driver = dispatch.driver
            return {
                'body_number': driver.body_number,
                'plate_number': driver.plate_number,
                'driver_name': driver.user.get_full_name() or driver.user.username,
                'rating': float(driver.rating),
            }
        return None
