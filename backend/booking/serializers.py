from rest_framework import serializers
from .models import Booking, BookingDocument, HostelVisit
from property.serializers import PropertyViewSerializer
from users.serializers import UserSerializer
from django.conf import settings

class BookingSerializer(serializers.ModelSerializer):
    booking_id = serializers.CharField(read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'


class BookingUserViewSerializer(serializers.ModelSerializer):
    property = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)
    class Meta:
        model = Booking
        fields = '__all__'

    def get_property(self, obj):
        property_data = PropertyViewSerializer(obj.property, context=self.context).data
        # if 'images' in property_data:
        #     updated_images = []
        #     for image_data in property_data['images']:
        #         if 'image' in image_data and image_data['image']:
        #             image_data['image'] = settings.WEBSITE_URL + image_data['image']
        #         updated_images.append(image_data)
        #     property_data['images'] = updated_images
        return property_data


class BookingViewSerializer(serializers.ModelSerializer):
    property = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)
    class Meta:
        model = Booking
        fields = '__all__'
    
    def get_property(self, obj):
        property_data = PropertyViewSerializer(obj.property, context=self.context).data
        if 'images' in property_data:
            updated_images = []
            for image_data in property_data['images']:
                if 'image' in image_data and image_data['image']:
                    image_data['image'] = settings.WEBSITE_URL + image_data['image']
                updated_images.append(image_data)
            property_data['images'] = updated_images
        return property_data


class BookingDocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = BookingDocument
        fields = '__all__'

    def create(self, validated_data):
        booking_document = BookingDocument.objects.create(**validated_data)
        booking_document.save()
        return booking_document


class BookingDocumentViewSerializer(serializers.ModelSerializer):
    document = serializers.SerializerMethodField()
    class Meta:
        model = BookingDocument
        fields = '__all__'

    def get_document(self, obj):
        return settings.WEBSITE_URL + obj.document.url


class HostelVisitSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating hostel visits"""
    class Meta:
        model = HostelVisit
        fields = '__all__'
        read_only_fields = ['converted_booking']
    
    def create(self, validated_data):
        # If no user is provided, set user to None
        if 'user' not in validated_data or validated_data['user'] is None:
            validated_data['user'] = None
        return super().create(validated_data)


class HostelVisitViewSerializer(serializers.ModelSerializer):
    """Serializer for viewing hostel visits with detailed property and user info"""
    property = PropertyViewSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = HostelVisit
        fields = '__all__'
