from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
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
    Country,
    State,
    FavoriteProperty
)
from .serializers import (
    PropertySerializer,
    AmenitySerializer,
    RoomSerializer,
    RuleSerializer,
    DocumentationSerializer,
    ReviewSerializer,
    ReplySerializer,
    PropertyViewSerializer,
    PropertyImageSerializer,
    RoomImageSerializer,
    CountrySerializer,
    StateSerializer,
    ReviewSerializer,
    ReplySerializer,
    CitySerializer,
    FavoritePropertySerializer,
    ReviewCreateSerializer
)

from users.decorators import custom_authentication_and_permissions
from django.shortcuts import get_object_or_404
from backend.settings import WEBSITE_URL
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from booking.models import Booking


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/amenities/$"])
def amenity_list(request):
    if request.method == "GET":
        amenities = Amenity.objects.all()
        serializer = AmenitySerializer(amenities, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = AmenitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"response.data": serializer.data}, status=status.HTTP_201_CREATED
            )
        return Response(
            {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/amenities/\d+/?$"]
)
def amenity_detail(request, pk):
    amenity = get_object_or_404(Amenity, pk=pk)
    if request.method == "GET":
        serializer = AmenitySerializer(amenity)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = AmenitySerializer(amenity, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        amenity.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/rules/$"])
def rule_list(request):
    if request.method == "GET":
        rules = Rule.objects.all()
        serializer = RuleSerializer(rules, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = RuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/rules/\d+/?$"])
def rule_detail(request, pk):
    rule = get_object_or_404(Rule, pk=pk)
    if request.method == "GET":
        serializer = RuleSerializer(rule)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = RuleSerializer(rule, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        rule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/documentations/$"]
)
def documentation_list(request):
    if request.method == "GET":
        documentations = Documentation.objects.all()
        serializer = DocumentationSerializer(documentations, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = DocumentationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/documentations/\d+/?$"]
)
def documentation_detail(request, pk):
    documentation = get_object_or_404(Documentation, pk=pk)
    if request.method == "GET":
        serializer = DocumentationSerializer(documentation)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = DocumentationSerializer(documentation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        documentation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/rooms/$"])
def room_list(request):
    if request.method == "GET":
        rooms = Room.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/rooms/\d+/?$"])
def room_detail(request, pk):
    room = get_object_or_404(Room, pk=pk)
    if request.method == "GET":
        serializer = RoomSerializer(room)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = RoomSerializer(room, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/properties/$"])
def property_list(request):
    if request.method == "GET":
        properties = Property.objects.all().distinct()
        query_params = request.GET

        # Extract filters
        property_type = query_params.get("propertyType")
        rooms = query_params.get("rooms")
        guests = query_params.get("guests")
        location = query_params.get("location")
        area = query_params.get("area")
        price = query_params.get("price")

        # Apply filters
        if property_type:
            properties = properties.filter(
                property_type__iexact=property_type
            )

        if rooms:
            try:
                rooms = int(rooms)
                # Filter properties with rooms that have enough available rooms
                properties = properties.filter(
                    rooms__left_number_of_rooms__gte=rooms
                )
            except ValueError:
                pass

        if guests:
            try:
                guests = int(guests)
                # Filter properties with rooms that can accommodate guests
                properties = properties.filter(
                    rooms__maxoccupancy__gte=guests
                )
            except ValueError:
                pass

        if location:
            # Search across city, state, and country names
            properties = properties.filter(
                Q(city__name__icontains=location) |
                Q(state__name__icontains=location) |
                Q(country__name__icontains=location)
            )

        if area:
            properties = properties.filter(
                area__icontains=area
            )

        if price:
            try:
                price = float(price)
                # Filter properties with rooms under price limit
                properties = properties.filter(
                    rooms__price__lte=price
                )
            except ValueError:
                pass

        serializer = PropertyViewSerializer(
            properties, 
            many=True, 
            context={"request": request}
        )
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = PropertySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/properties/\d+/?$"]
)
def property_detail(request, pk):
    property = get_object_or_404(Property, pk=pk)
    if request.method == "GET":
        serializer = PropertyViewSerializer(property, context={"request": request})
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = PropertySerializer(property, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        property.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/reviews/$"])
def review_list(request):
    if request.method == "GET":
        reviews = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        print(f"Request data: {request.data}")
        print(f"Request user: {request.user}")
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/reviews/\d+/?$"])
def review_detail(request, pk):
    review = get_object_or_404(Review, pk=pk)
    if request.method == "GET":
        serializer = ReviewSerializer(review)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = ReviewSerializer(review, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/replies/$"])
def reply_list(request):
    if request.method == "GET":
        replies = Reply.objects.all()
        serializer = ReplySerializer(replies, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = ReplySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/replies/\d+/?$"])
def reply_detail(request, pk):
    reply = get_object_or_404(Reply, pk=pk)
    if request.method == "GET":
        serializer = ReplySerializer(reply)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = ReplySerializer(reply, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        reply.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions()
@parser_classes([MultiPartParser, FormParser])
def image_upload(request):
    """
    Upload a property image and return its ID.
    """
    serializer = PropertyImageSerializer(data=request.data)
    if serializer.is_valid():
        image_instance = serializer.save()
        return Response(
            {
                "id": image_instance.id,
                "image_url": WEBSITE_URL + image_instance.image.url,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "DELETE"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/images/\d+/?$"])
def image_detail(request, pk):
    """
    Retrieve or delete a specific property image.
    """
    image = get_object_or_404(PropertyImage, pk=pk)
    if request.method == "GET":
        serializer = PropertyImageSerializer(image)
        return Response(serializer.data)
    elif request.method == "DELETE":
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions()
@parser_classes([MultiPartParser, FormParser])
def room_image_upload(request):
    """
    Upload a room image and return its ID.
    """
    serializer = RoomImageSerializer(data=request.data)
    if serializer.is_valid():
        image_instance = serializer.save()
        return Response(
            {
                "id": image_instance.id,
                "image_url": WEBSITE_URL + image_instance.image.url,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/search/[a-zA-Z0-9_-]+/?$"]
)
def search_properties_by_location(request, location):
    """
    Search for properties based on the location provided in the payload.
    Expects a JSON payload with a 'location' key.
    Returns a maximum of 5 properties matching the location.
    """

    # Filter properties by location, limit to 5 results
    if not location:
        cities = City.objects.all().order_by('name')[:4]
    else:
        cities = City.objects.filter(name__icontains=location).order_by('name')[:4]

    # Serialize the results
    serializer = CitySerializer(cities, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/cities/$"])
def list_cities(request):
    """
    Search for cities.
    Expects a JSON payload with a 'location' key.
    Returns a maximum of 5 properties matching the location.
    """
    cities = City.objects.all().order_by('name')
    # Serialize the results
    serializer = CitySerializer(cities, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/countries/$"])
def list_countries(request):
    countries = Country.objects.all().order_by('name')
    serializer = CountrySerializer(countries, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/states/$"])
def list_states(request):
    states = State.objects.all().order_by('name')
    serializer = StateSerializer(states, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/areas/[a-zA-Z0-9_-]+/?$"])
def unique_areas_by_city(request, city_name):
    # Get the city object or return a 404 if it doesn't exist
    city = get_object_or_404(City, name__iexact=city_name)

    # Query for unique areas associated with properties in the specified city
    unique_areas = Property.objects.filter(city=city).values_list('area', flat=True).distinct()

    # Return the unique areas as a JSON response
    return Response({"unique_areas": list(unique_areas)}, status=status.HTTP_200_OK)


@api_view(["GET"])
def public_search_properties(request):
    """
    Public API endpoint for searching properties - does not require authentication.
    Accepts query parameters: propertyType, rooms, guests, location, area, price, etc.
    Also add is_favorite parameter to add or remove a property from the user's favorite list.
    """
    try:
        properties = Property.objects.all().distinct()
        query_params = request.GET

        # Extract filters
        property_type = query_params.get("propertyType")
        rooms = query_params.get("rooms")
        guests = query_params.get("guests")
        location = query_params.get("location")
        area = query_params.get("area")
        price = query_params.get("price")
        id = query_params.get("id")
        
        print(f"Public search params: {query_params}")

        # Apply filters
        if property_type and property_type != 'all':
            properties = properties.filter(
                property_type__iexact=property_type
            )

        if rooms:
            try:
                rooms = int(rooms)
                # Filter properties with rooms that have enough available rooms
                properties = properties.filter(
                    rooms__number_of_rooms__gte=rooms
                )
            except ValueError:
                pass

        if guests:
            try:
                guests = int(guests)
                # Filter properties with rooms that can accommodate guests
                # guests should be guests divided by number of rooms
                guests = guests / rooms
                properties = properties.filter(
                    rooms__maxoccupancy__gte=guests
                )
            except ValueError:
                pass

        if location:
            # Search across city, state, and country names
            properties = properties.filter(
                Q(city__name__icontains=location) |
                Q(state__name__icontains=location) |
                Q(country__name__icontains=location) |
                Q(location__icontains=location) # Also search directly in location field
            )

        if area:
            properties = properties.filter(
                area__icontains=area
            )

        if price:
            try:
                price = float(price)
                # Filter properties with rooms under price limit
                properties = properties.filter(
                    rooms__price__lte=price
                )
            except ValueError:
                pass

        print(f"Found {properties.count()} properties for public search")
        
        # Add context with user favorites information if the user is authenticated
        context = {"request": request}
        if id:
            # Get the user's favorite properties
            print(f"Request user: {request.user}")
            user_favorites = FavoriteProperty.objects.filter(
                user=id, 
                is_active=True
            ).values_list('property_id', flat=True)

            context['user_favorites'] = user_favorites
            
        serializer = PropertyViewSerializer(
            properties, 
            many=True, 
            context=context
        )
        return Response(serializer.data)
    except Exception as e:
        print(f"Error in public property search: {str(e)}")
        return Response(
            {"error": "Failed to retrieve properties"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

@api_view(["POST"])
@custom_authentication_and_permissions()
def add_favorite_property(request):
    """
    Add or remove a property from the user's favorite list.
    """

    user = request.user
    property_id = request.data.get("property_id")
    property = get_object_or_404(Property, id=property_id)

    is_favorite = request.data.get("is_favourite")   

    if is_favorite:
        favorite_property, created = FavoriteProperty.objects.get_or_create(user=user, property=property)
        return Response({"message": "Property added to favorites"}, status=status.HTTP_200_OK)
    else:
        favorite_property = FavoriteProperty.objects.filter(user=user, property=property).first()
        favorite_property.delete()
        return Response({"message": "Property removed from favorites"}, status=status.HTTP_200_OK)
    

@api_view(["GET"])
@custom_authentication_and_permissions()
def get_favorite_properties(request):
    """
    Get the user's favorite properties.
    """
    user = request.user
    favorite_properties = FavoriteProperty.objects.filter(user=user, is_active=True)
    serializer = FavoritePropertySerializer(favorite_properties, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(['POST'])
@custom_authentication_and_permissions()
def create_review(request):
    """
    Create a review for a property.
    """
    try:
        serializer = ReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Get the booking object
            booking_id = serializer.validated_data.get('booking_id')
            try:
                booking = Booking.objects.get(id=booking_id)
            except Booking.DoesNotExist:
                return Response(
                    {"error": "Booking not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if the booking belongs to the current user
            if booking.user != request.user:
                return Response(
                    {"error": "You can only review your own bookings"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Check if the booking is completed
            if booking.status != 'completed':
                return Response(
                    {"error": "You can only review completed bookings"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create the review
            review = serializer.save(
                user=request.user,
                property=booking.property
            )

            if review:
                booking.is_review_created = True
                booking.review_id = review.id
                booking.save()

            return Response(
                {"message": "Review created successfully", "review_id": review.id},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
