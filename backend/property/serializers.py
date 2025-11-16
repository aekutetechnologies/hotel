from rest_framework import serializers
from django.utils.text import slugify
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
    FavoriteProperty,
    ReviewImage,
    Setting,
    ImageCategory,
    NearbyPlace,
    SitePage,
    SitePageImage,
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

class ImageCategorySerializer(serializers.ModelSerializer):
    code = serializers.SlugField(required=False, allow_blank=True, max_length=50)
    
    class Meta:
        model = ImageCategory
        fields = "__all__"
    
    def create(self, validated_data):
        # Auto-generate code from name if not provided
        if not validated_data.get('code'):
            base_code = slugify(validated_data.get('name', ''))
            code = base_code
            counter = 1
            # Ensure uniqueness by appending a number if needed
            while ImageCategory.objects.filter(code=code).exists():
                code = f"{base_code}-{counter}"
                counter += 1
            validated_data['code'] = code
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Auto-generate code from name if not provided and name is being updated
        if 'name' in validated_data and not validated_data.get('code'):
            base_code = slugify(validated_data['name'])
            code = base_code
            counter = 1
            # Ensure uniqueness by appending a number if needed (excluding current instance)
            while ImageCategory.objects.filter(code=code).exclude(pk=instance.pk).exists():
                code = f"{base_code}-{counter}"
                counter += 1
            validated_data['code'] = code
        return super().update(instance, validated_data)


class PropertyImageSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=ImageCategory.objects.all(),
        required=False,
        allow_null=True
    )
    category_detail = ImageCategorySerializer(source='category', read_only=True)

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'category', 'category_detail', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['created_at', 'updated_at']


class NearbyPlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NearbyPlace
        fields = ['id', 'name', 'category', 'distance', 'sort_order']
        read_only_fields = ['id']


class SitePageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SitePage
        fields = [
            'id',
            'slug',
            'title',
            'hero_title',
            'hero_description',
            'sections',
            'extra',
            'created_at',
            'updated_at',
            'is_active',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SitePageImageSerializer(serializers.ModelSerializer):
    page_slug = serializers.SlugRelatedField(
        source='page',
        slug_field='slug',
        queryset=SitePage.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = SitePageImage
        fields = ['id', 'image', 'page_slug', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoomImageViewSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = RoomImage
        fields = "__all__"

    def get_image(self, obj):
        return f"{settings.WEBSITE_URL}{settings.MEDIA_URL}{obj.image}"
    
class PropertyImageViewSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    category = ImageCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(source='category.id', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_code = serializers.CharField(source='category.code', read_only=True)

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'category', 'category_id', 'category_name', 'category_code', 'created_at', 'updated_at', 'is_active']

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
    images = serializers.PrimaryKeyRelatedField(queryset=PropertyImage.objects.all(), many=True, required=False, read_only=False)
    rooms = RoomSerializer(many=True, required=False)
    nearby_places = NearbyPlaceSerializer(many=True, required=False)
    city = serializers.CharField(required=False)
    state = serializers.CharField(required=False)
    country = serializers.CharField(required=False)

    class Meta:
        model = Property
        fields = "__all__"
        
    def to_internal_value(self, data):
        """Custom validation to handle image dictionaries"""
        # Handle images specially if they're dictionaries
        images_data = data.get('images', [])
        
        if images_data and isinstance(images_data, list) and len(images_data) > 0 and isinstance(images_data[0], dict):
            # Update image categories first
            for img in images_data:
                if isinstance(img, dict) and 'id' in img:
                    image_id = img.get('id')
                    category_value = img.get('category') or img.get('category_id')
                    if image_id is None:
                        continue
                    try:
                        img_obj = PropertyImage.objects.get(id=image_id)
                        category_obj = None
                        if category_value:
                            try:
                                category_obj = ImageCategory.objects.get(id=category_value)
                            except ImageCategory.DoesNotExist:
                                category_obj = None
                        img_obj.category = category_obj
                        img_obj.save(update_fields=['category', 'updated_at'])
                    except PropertyImage.DoesNotExist:
                        continue

            # Convert dictionaries to IDs for the field validation
            data['images'] = [img['id'] for img in images_data if 'id' in img]
        
        # Get the original validated data
        return super().to_internal_value(data)

    def create(self, validated_data):
        city_name = validated_data.pop('city', '').strip()
        state_name = validated_data.pop('state', '').strip()
        country_name = validated_data.pop('country', '').strip()

        amenities = validated_data.pop('amenities', [])
        rules = validated_data.pop('rules', [])
        documentation = validated_data.pop('documentation', [])
        images = validated_data.pop('images', [])
        rooms_data = validated_data.pop('rooms', [])
        nearby_places = validated_data.pop('nearby_places', [])

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

        self.update_nearby_places(property, nearby_places)

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
        nearby_places = validated_data.pop('nearby_places', None)

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

        if nearby_places is not None:
            self.update_nearby_places(instance, nearby_places)

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

    def update_nearby_places(self, property_instance, nearby_places_data):
        existing_places = {place.id: place for place in property_instance.nearby_places.all()}
        processed_ids = set()

        for index, place_data in enumerate(nearby_places_data):
            name = place_data.get('name', '').strip()
            category = place_data.get('category', '').strip()
            distance = place_data.get('distance', '').strip()

            if not name or not category or not distance:
                continue

            place_id = place_data.get('id')
            sort_order = place_data.get('sort_order', index)
            defaults = {
                'name': name,
                'category': category,
                'distance': distance,
                'sort_order': sort_order,
            }

            if place_id and place_id in existing_places:
                place = existing_places[place_id]
                for attr, value in defaults.items():
                    setattr(place, attr, value)
                place.save()
                processed_ids.add(place_id)
            else:
                new_place = NearbyPlace.objects.create(
                    property=property_instance,
                    **defaults
                )
                processed_ids.add(new_place.id)

        # Remove places not in the updated list
        for place_id, place in existing_places.items():
            if place_id not in processed_ids:
                place.delete()
    
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
    is_favorite = serializers.SerializerMethodField()
    nearby_places = NearbyPlaceSerializer(many=True, required=False)

    class Meta:
        model = Property
        fields = [
            'id', 'name', 'property_type', 'description', 'location', 
            'city', 'country', 'state', 'area', 'longitude', 'latitude',
            'images', 'discount', 'amenities', 'rooms', 'rules',
            'documentation', 'created_at', 'updated_at', 'is_active',
            'reviews', 'offers', 'is_favorite', 'gender_type',
            'nearby_places'
        ]

    def get_is_favorite(self, obj):
        # Check if user is authenticated and property is in user favorites
        if 'user_favorites' in self.context:
            return obj.id in self.context['user_favorites']
        else:
            request = self.context.get('request')
            if request and hasattr(request, 'user'):
                user_favorites = FavoriteProperty.objects.filter(user=request.user.id, property=obj, is_active=True).values_list('property_id', flat=True)
                return obj.id in user_favorites
            return False

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['offers'] = PropertyOfferSerializer(instance.propertyoffer_set.all(), many=True).data
        data['reviews'] = ReviewSerializer(instance.reviews.all(), many=True).data
        return data

class FavoritePropertySerializer(serializers.ModelSerializer):
    property = PropertyViewSerializer(required=False)

    class Meta:
        model = FavoriteProperty
        fields = "__all__"

class ReviewCreateSerializer(serializers.ModelSerializer):
    photos = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Review
        fields = ['booking_id', 'rating', 'review', 'photos']
        extra_kwargs = {
            'review': {'required': True},
            'rating': {'required': True}
        }

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

    def create(self, validated_data):
        photos = validated_data.pop('photos', [])
        review = Review.objects.create(**validated_data)
        
        # Create ReviewImage objects for each photo
        for photo in photos:
            ReviewImage.objects.create(
                image=photo,
                review=review
            )
        
        return review

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = '__all__'