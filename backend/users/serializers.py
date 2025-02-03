from rest_framework import serializers
from .models import HsUser
from booking.models import Booking

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = HsUser
        fields = ['id', 'name', 'email', 'mobile', 'created_at', 'is_active', 'user_role']

class BookingViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'property', 'room', 'price', 'discount', 'booking_type', 'status', 'payment_type', 'checkin_date', 'checkout_date', 'created_at', 'updated_at']

class UserViewSerializer(serializers.ModelSerializer):
    bookings = serializers.SerializerMethodField()

    class Meta:
        model = HsUser
        fields = ['id', 'name', 'email', 'mobile', 'created_at', 'is_active', 'user_role', 'bookings']

    def get_bookings(self, obj):
        bookings = Booking.objects.filter(user=obj)
        return BookingViewSerializer(bookings, many=True).data


class HsPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HsPermission
        fields = ['id', 'name', 'description']

class HsPermissionGroupSerializer(serializers.ModelSerializer):
    permissions = HsPermissionSerializer(many=True)
    class Meta:
        model = HsPermissionGroup
        fields = ['id', 'name', 'permissions']

class UserHsPermissionSerializer(serializers.ModelSerializer):
    permission_group = HsPermissionGroupSerializer()
    class Meta:
        model = UserHsPermission
        fields = ['id', 'user', 'permission_group']