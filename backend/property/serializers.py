from rest_framework import serializers
from .models import (
    Property,
    Amenity,
    Room,
    Rule,
    Documentation,
    Review,
    Reply,
    PropertyImage,
    RoomImage,
    City,
    State,
    Country,
)

from offer.models import PropertyOffer
from offer.serializers import OfferSerializer
from django.conf import settings
from users.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(required=False)
    class Meta:
        model = Review
        fields = "__all__"

class ReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Reply
        fields = "__all__"

class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = "__all__"

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = "__all__"


class RoomImageViewSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = RoomImage
        fields = "__all__"

    def get_image(self, obj):
        return f"{settings.WEBSITE_URL}{settings.MEDIA_URL}{obj.image}"
    
class PropertyImageViewSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = PropertyImage
        fields = "__all__"

    def get_image(self, obj):
        return f"{settings.WEBSITE_URL}{settings.MEDIA_URL}{obj.image}"

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = "__all__"

class RuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = "__all__"

class DocumentationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documentation
        fields = "__all__"

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = "__all__"

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = "__all__"

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = "__all__"

class RoomSerializer(serializers.ModelSerializer):
    amenities = serializers.PrimaryKeyRelatedField(queryset=Amenity.objects.all(), many=True, required=False)
    images = serializers.PrimaryKeyRelatedField(queryset=RoomImage.objects.all(), many=True, required=False)

    class Meta:
        model = Room
        fields = "__all__"

    def create(self, validated_data):
        amenities = validated_data.pop('amenities', [])
        images = validated_data.pop('images', [])

        # Create the room instance
        room = Room.objects.create(**validated_data)

        # Set many-to-many relationships
        room.amenities.set(amenities)
        room.images.set(images)

        return room

    def update(self, instance, validated_data):
        amenities = validated_data.pop('amenities', [])
        images = validated_data.pop('images', [])

        # Update the room instance
        instance = super().update(instance, validated_data)

        # Set many-to-many relationships
        instance.amenities.set(amenities)
        instance.images.set(images)

        return instance
    
class RoomViewSerializer(serializers.ModelSerializer):
    images = RoomImageViewSerializer(many=True, required=False)
    amenities = AmenitySerializer(many=True, required=False)
    class Meta:
        model = Room
        fields = "__all__"

class PropertySerializer(serializers.ModelSerializer):
    amenities = serializers.PrimaryKeyRelatedField(queryset=Amenity.objects.all(), many=True, required=False)
    rules = serializers.PrimaryKeyRelatedField(queryset=Rule.objects.all(), many=True, required=False)
    documentation = serializers.PrimaryKeyRelatedField(queryset=Documentation.objects.all(), many=True, required=False)
    images = serializers.PrimaryKeyRelatedField(queryset=PropertyImage.objects.all(), many=True, required=False)
    rooms = RoomSerializer(many=True, required=False)
    city = serializers.CharField(required=False)
    state = serializers.CharField(required=False)
    country = serializers.CharField(required=False)

    class Meta:
        model = Property
        fields = "__all__"

    def create(self, validated_data):
        city_name = validated_data.pop('city', '').strip()
        state_name = validated_data.pop('state', '').strip()
        country_name = validated_data.pop('country', '').strip()

        amenities = validated_data.pop('amenities', [])
        rules = validated_data.pop('rules', [])
        documentation = validated_data.pop('documentation', [])
        images = validated_data.pop('images', [])
        rooms_data = validated_data.pop('rooms', [])

        city = City.objects.get_or_create(name__iexact=city_name, defaults={'name': city_name})[0] if city_name else None
        state = State.objects.get_or_create(name__iexact=state_name, defaults={'name': state_name})[0] if state_name else None
        country = Country.objects.get_or_create(name__iexact=country_name, defaults={'name': country_name})[0] if country_name else None

        property = Property.objects.create(
            city=city,
            state=state,
            country=country,
            **validated_data
        )

        property.amenities.set(amenities)
        property.rules.set(rules)
        property.documentation.set(documentation)
        property.images.set(images)

        for room_data in rooms_data:
            self.create_room(property, room_data)

        return property

    def update(self, instance, validated_data):
        city_name = validated_data.pop('city', '').strip()
        state_name = validated_data.pop('state', '').strip()
        country_name = validated_data.pop('country', '').strip()

        amenities = validated_data.pop('amenities', [])
        rules = validated_data.pop('rules', [])
        documentation = validated_data.pop('documentation', [])
        images = validated_data.pop('images', [])
        rooms_data = validated_data.pop('rooms', [])

        if city_name:
            instance.city = City.objects.get_or_create(name__iexact=city_name, defaults={'name': city_name})[0]
        if state_name:
            instance.state = State.objects.get_or_create(name__iexact=state_name, defaults={'name': state_name})[0]
        if country_name:
            instance.country = Country.objects.get_or_create(name__iexact=country_name, defaults={'name': country_name})[0]

        instance = super().update(instance, validated_data)
        instance.amenities.set(amenities)
        instance.rules.set(rules)
        instance.documentation.set(documentation)
        instance.images.set(images)

        existing_rooms = {room.id: room for room in instance.rooms.all()}
        for room_data in rooms_data:
            room_id = room_data.get('id')
            if room_id:
                room = existing_rooms.get(room_id)
                if room:
                    instance = self.update_room(room, room_data)
                    del existing_rooms[room_id]
            else:
                self.create_room(instance, room_data)

        for room in existing_rooms.values():
            room.delete()

        return instance

    def create_room(self, property_instance, room_data):
        images_data = room_data.pop('images', [])

        amenities = room_data.pop('amenities', [])
        room = Room.objects.create(**room_data)
        room.amenities.set(amenities)
        room.images.set(images_data)
        property_instance.rooms.add(room)
        return room

    def update_room(self, room_instance, room_data):
        amenities = room_data.pop('amenities', [])
        images_data = room_data.pop('images', [])

        for attr, value in room_data.items():
            setattr(room_instance, attr, value)
        room_instance.amenities.set(amenities)
        room_instance.images.set(images_data)
        room_instance.save()
        return room_instance
    
class PropertyOfferSerializer(serializers.ModelSerializer):
    offer = OfferSerializer(required=False)
    class Meta:
        model = PropertyOffer
        fields = "__all__"

    
class PropertyViewSerializer(serializers.ModelSerializer):
    images = PropertyImageViewSerializer(many=True, required=False)
    reviews = ReviewSerializer(many=True, required=False)
    city = CitySerializer(required=False)
    state = StateSerializer(required=False)
    country = CountrySerializer(required=False)
    amenities = AmenitySerializer(many=True, required=False)
    rules = RuleSerializer(many=True, required=False)
    documentation = DocumentationSerializer(many=True, required=False)
    offers = PropertyOfferSerializer(many=True, required=False)
    rooms = RoomViewSerializer(many=True, required=False)

    class Meta:
        model = Property
        fields = [
            'id', 'name', 'property_type', 'description', 'location', 
            'city', 'country', 'state', 'area', 'longitude', 'latitude',
            'images', 'discount', 'amenities', 'rooms', 'rules',
            'documentation', 'created_at', 'updated_at', 'is_active',
            'reviews', 'offers'  # Include the reviews field
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['offers'] = PropertyOfferSerializer(instance.propertyoffer_set.all(), many=True).data
        data['reviews'] = ReviewSerializer(instance.reviews.all(), many=True).data
        return data