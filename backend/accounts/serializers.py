from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from drivers.models import DriverProfile

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'phone_number': self.user.phone_number,
            'full_name': self.user.get_full_name() or self.user.username,
            'role': self.user.role,
            'discount_type': self.user.discount_type,
            'is_discount_verified': self.user.is_discount_verified,
        }
        if self.user.role == 'DRIVER' and hasattr(self.user, 'driver_profile'):
            profile = self.user.driver_profile
            data['user']['driver_profile'] = {
                'id': profile.id,
                'body_number': profile.body_number,
                'plate_number': profile.plate_number,
                'status': profile.status,
                'terminal_id': profile.terminal_id,
                'terminal_name': profile.terminal.name if profile.terminal else None,
            }
        return data

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    # Driver-specific registration fields
    license_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    body_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    plate_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    terminal_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone_number', 'first_name', 'last_name',
            'role', 'discount_type', 'password',
            'license_number', 'body_number', 'plate_number', 'terminal_id'
        ]

    def create(self, validated_data):
        license_number = validated_data.pop('license_number', None)
        body_number = validated_data.pop('body_number', None)
        plate_number = validated_data.pop('plate_number', None)
        terminal_id = validated_data.pop('terminal_id', None)
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == 'DRIVER' and body_number:
            DriverProfile.objects.create(
                user=user,
                license_number=license_number or 'PENDING',
                body_number=body_number,
                plate_number=plate_number or 'PENDING',
                terminal_id=terminal_id
            )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone_number', 'first_name', 'last_name',
            'role', 'discount_type', 'discount_id_image', 'is_discount_verified', 'created_at'
        ]
        read_only_fields = ['id', 'username', 'role', 'is_discount_verified', 'created_at']
