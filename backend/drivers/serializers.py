from rest_framework import serializers
from .models import DriverProfile

class DriverProfileSerializer(serializers.ModelSerializer):
    driver_name = serializers.SerializerMethodField()
    terminal_name = serializers.CharField(source='terminal.name', read_only=True)
    queue_position = serializers.SerializerMethodField()

    class Meta:
        model = DriverProfile
        fields = [
            'id', 'user', 'driver_name', 'terminal', 'terminal_name',
            'license_number', 'body_number', 'plate_number', 'status',
            'queue_entered_at', 'rating', 'queue_position'
        ]
        read_only_fields = ['id', 'user', 'queue_entered_at', 'rating', 'queue_position']

    def get_driver_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_queue_position(self, obj):
        if obj.status == 'QUEUED' and obj.terminal:
            ahead = DriverProfile.objects.filter(
                terminal=obj.terminal,
                status='QUEUED',
                queue_entered_at__lt=obj.queue_entered_at
            ).count()
            return ahead + 1 # 1-based index (e.g. #1 in line)
        return None
