from rest_framework import serializers
from .models import Property, Amenity, Room, Rule, Documentation, Review, Reply, PropertyImage

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image'] # Include 'id' to return it after creation
        read_only_fields = ['id'] # 'id' is auto-generated, so it's read-only during creation

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = '__all__'

class RuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = '__all__'

class DocumentationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documentation
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)
    class Meta:
        model = Room
        fields = '__all__'

class PropertySerializer(serializers.ModelSerializer):
    amenities = serializers.PrimaryKeyRelatedField(queryset=Amenity.objects.all(), many=True, required=False)
    rules = serializers.PrimaryKeyRelatedField(queryset=Rule.objects.all(), many=True, required=False)
    documentation = serializers.PrimaryKeyRelatedField(queryset=Documentation.objects.all(), many=True, required=False)
    images = serializers.PrimaryKeyRelatedField(queryset=PropertyImage.objects.all(), many=True, required=False) # Expect list of image IDs
    rooms = RoomSerializer(many=True)

    class Meta:
        model = Property
        fields = '__all__'

    def create(self, validated_data):
        rooms_data = validated_data.pop('rooms', [])
        amenities_data = validated_data.pop('amenities', [])
        rules_data = validated_data.pop('rules', [])
        documentation_data = validated_data.pop('documentation', [])
        image_ids = validated_data.pop('images', []) # Get the list of image IDs

        property_instance = Property.objects.create(**validated_data)

        property_instance.amenities.set(amenities_data)
        property_instance.rules.set(rules_data)
        property_instance.documentation.set(documentation_data)
        property_instance.images.set(image_ids) # Attach images using IDs

        for room_data in rooms_data:
            amenities_data = room_data.pop('amenities', [])
            room_instance = Room.objects.create(**room_data)
            room_instance.amenities.set(amenities_data)
            room_instance.save()
            property_instance.rooms.add(room_instance)

        return property_instance

    def update(self, instance, validated_data):
        rooms_data = validated_data.pop('rooms', [])
        amenities_data = validated_data.pop('amenities', [])
        rules_data = validated_data.pop('rules', [])
        documentation_data = validated_data.pop('documentation', [])
        image_ids = validated_data.pop('images', []) # Get the list of image IDs

        instance = super().update(instance, validated_data)

        instance.amenities.set(amenities_data)
        instance.rules.set(rules_data)
        instance.documentation.set(documentation_data)
        instance.images.set(image_ids) # Attach images using IDs

        for room_data in rooms_data:
            room_id = room_data.get('id')
            if room_id:
                room_instance = Room.objects.get(id=room_id)
                for attr, value in room_data.items():
                    if attr == 'amenities':
                        room_instance.amenities.set(value)
                    else:
                        setattr(room_instance, attr, value)
                room_instance.save()
            else:
                amenities_data = room_data.pop('amenities', [])
                new_room = Room.objects.create(**room_data)
                new_room.amenities.set(amenities_data)
                new_room.save()
                instance.rooms.add(new_room)

        return instance

class PropertyViewSerializer(PropertySerializer):
    amenities = AmenitySerializer(many=True, read_only=True)
    rules = RuleSerializer(many=True, read_only=True)
    documentation = DocumentationSerializer(many=True, read_only=True)
    rooms = RoomSerializer(many=True, read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta(PropertySerializer.Meta):
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class ReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Reply
        fields = '__all__'
