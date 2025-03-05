from rest_framework import serializers
from .models import Offer, OfferImage
from django.conf import settings

class OfferImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = OfferImage
        fields = '__all__'

    def get_image_url(self, obj):
        if obj.image:
            return str(settings.WEBSITE_URL) + obj.image.url
        return None


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = '__all__'


class OfferViewSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = '__all__'

    def get_images(self, obj):
        offer_images = OfferImage.objects.filter(offer=obj)
        serializer = OfferImageSerializer(offer_images, many=True)
        return serializer.data
