from rest_framework import serializers
from .models import HsUser, HsPermission, HsPermissionGroup, UserHsPermission, UserDocument
from booking.models import Booking
from django.conf import settings
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
        fields = ['id', 'name', 'created_at', 'description', 'is_active']

class HsPermissionGroupSerializer(serializers.ModelSerializer):
    permissions = HsPermissionSerializer(many=True)
    class Meta:
        model = HsPermissionGroup
        fields = ['id', 'name', 'permissions', 'created_at', 'is_active']

class UserHsPermissionSerializer(serializers.ModelSerializer):
    permission_group = HsPermissionGroupSerializer()
    class Meta:
        model = UserHsPermission
        fields = ['id', 'user', 'permission_group', 'created_at', 'is_active']

class UserDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDocument
        fields = '__all__'

    def create(self, validated_data):
        user_document = UserDocument.objects.create(**validated_data)
        user_document.save()
        return user_document
        
class UserDocumentViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDocument
        fields = '__all__'

    def get_document(self, obj):
        return settings.WEBSITE_URL + obj.document.url