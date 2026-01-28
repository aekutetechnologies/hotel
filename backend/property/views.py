from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
import logging
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
    FavoriteProperty,
    UserProperty,
    Setting,
    ImageCategory,
    SitePage,
    SitePageImage,
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
    ReviewCreateSerializer,
    ImageCategorySerializer,
    SitePageSerializer,
    SitePageImageSerializer,
)

from users.models import HsUser
from users.decorators import custom_authentication_and_permissions
from django.shortcuts import get_object_or_404
from backend.settings import WEBSITE_URL
from django.db.models import Q
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from booking.models import Booking

logger = logging.getLogger("property")


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/amenities/$"])
def amenity_list(request):
    logger.info(f"amenity_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == "GET":
        amenities = Amenity.objects.all()
        serializer = AmenitySerializer(amenities, many=True)
        logger.info(f"Retrieved {len(serializer.data)} amenities", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = AmenitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Amenity created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "amenity_id": serializer.data.get('id')})
            return Response(
                {"response.data": serializer.data}, status=status.HTTP_201_CREATED
            )
        logger.warning(f"Failed to create amenity: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(
            {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/amenities/\d+/?$"]
)
def amenity_detail(request, pk):
    logger.info(f"amenity_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    amenity = get_object_or_404(Amenity, pk=pk)
    if request.method == "GET":
        serializer = AmenitySerializer(amenity)
        logger.info(f"Retrieved amenity {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = AmenitySerializer(amenity, data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Amenity {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update amenity {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        amenity.delete()
        logger.info(f"Amenity {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/rules/$"])
def rule_list(request):
    logger.info(f"rule_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == "GET":
        rules = Rule.objects.all()
        serializer = RuleSerializer(rules, many=True)
        logger.info(f"Retrieved {len(serializer.data)} rules", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = RuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Rule created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "rule_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create rule: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/rules/\d+/?$"])
def rule_detail(request, pk):
    logger.info(f"rule_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    rule = get_object_or_404(Rule, pk=pk)
    if request.method == "GET":
        serializer = RuleSerializer(rule)
        logger.info(f"Retrieved rule {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = RuleSerializer(rule, data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Rule {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update rule {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        rule.delete()
        logger.info(f"Rule {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/documentations/$"]
)
def documentation_list(request):
    logger.info(f"documentation_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == "GET":
        documentations = Documentation.objects.all()
        serializer = DocumentationSerializer(documentations, many=True)
        logger.info(f"Retrieved {len(serializer.data)} documentations", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = DocumentationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Documentation created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "doc_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create documentation: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/documentations/\d+/?$"]
)
def documentation_detail(request, pk):
    logger.info(f"documentation_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    documentation = get_object_or_404(Documentation, pk=pk)
    if request.method == "GET":
        serializer = DocumentationSerializer(documentation)
        logger.info(f"Retrieved documentation {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = DocumentationSerializer(documentation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Documentation {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update documentation {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        documentation.delete()
        logger.info(f"Documentation {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/image-categories/$"]
)
def image_category_list(request):
    logger.info(f"image_category_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == "GET":
        categories = ImageCategory.objects.all()
        serializer = ImageCategorySerializer(categories, many=True)
        logger.info(f"Retrieved {len(serializer.data)} image categories", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = ImageCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Image category created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "category_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create image category: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/image-categories/\d+/?$"]
)
def image_category_detail(request, pk):
    logger.info(f"image_category_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    category = get_object_or_404(ImageCategory, pk=pk)
    if request.method == "GET":
        serializer = ImageCategorySerializer(category)
        logger.info(f"Retrieved image category {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = ImageCategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Image category {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update image category {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        category.delete()
        logger.info(f"Image category {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/rooms/$"])
def room_list(request):
    logger.info(f"room_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == "GET":
        rooms = Room.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        logger.info(f"Retrieved {len(serializer.data)} rooms", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Room created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "room_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create room: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/rooms/\d+/?$"])
def room_detail(request, pk):
    logger.info(f"room_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    room = get_object_or_404(Room, pk=pk)
    if request.method == "GET":
        serializer = RoomSerializer(room)
        logger.info(f"Retrieved room {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = RoomSerializer(room, data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Room {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update room {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        room.delete()
        logger.info(f"Room {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/properties/$"])
def property_list(request):
    logger.info(f"property_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == "GET":
        
        if "user" in request.query_params:
            user = request.query_params.get("user")
            user = get_object_or_404(HsUser, id=user)
        else:
            user = request.user

        user_properties = UserProperty.objects.filter(user=user, is_active=True)
        print(user_properties)
        if user_properties.exists():
            user_property_ids = user_properties.values_list('property_id', flat=True)
            properties = Property.objects.filter(id__in=user_property_ids)
        else:
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
        logger.info(f"Retrieved {len(serializer.data)} properties", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = PropertySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Property created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "property_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create property: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/all-properties/$"])
def get_all_properties(request):
    """
    Get all properties.
    """
    logger.info("get_all_properties called", extra={"request_method": request.method})
    try:
        properties = Property.objects.all().distinct()
        serializer = PropertyViewSerializer(properties, many=True, context={"request": request})
        logger.info(f"Retrieved {len(serializer.data)} properties", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    except Exception as e:
        logger.exception(f"Error in get_all_properties: {str(e)}", extra={"request_method": request.method})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["GET"])
@custom_authentication_and_permissions()
def get_user_properties(request):
    """
    Get the user's properties.
    """
    logger.info("get_user_properties called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
    try:
        user = request.user
        user_properties = UserProperty.objects.filter(user=user, is_active=True).values_list('property_id', flat=True)
        properties = Property.objects.filter(id__in=user_properties)
        serializer = PropertyViewSerializer(properties, many=True)
        logger.info(f"Retrieved {len(serializer.data)} properties for user {user.id}", extra={"request_method": request.method, "user_id": user.id, "count": len(serializer.data)})
        return Response(serializer.data)
    except Exception as e:
        logger.exception(f"Error in get_user_properties: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["POST"])
@custom_authentication_and_permissions()
def add_properties_to_user(request):
    """
    Update user's properties to match the provided list of property IDs.
    Properties in the list will be added, properties not in the list will be removed.
    Expects a JSON payload with:
    - property_ids: List of property IDs that should be associated with the user
    """
    logger.info("add_properties_to_user called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
    try:
        property_ids = request.data.get("property_ids", [])
        user_id = request.query_params.get("user_id")
        if user_id:
            try:    
                user = get_object_or_404(HsUser, id=user_id)
            except:
                return Response(
                    {"error": "User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            user = request.user

        if not isinstance(property_ids, list):
            return Response(
                {"error": "property_ids must be a list"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Convert property_ids to a set for faster lookup
        property_ids_set = set(property_ids)
        
        # Get the user's current active properties
        current_user_properties = UserProperty.objects.filter(
            user=user,
            is_active=True
        )
        current_property_ids = {up.property_id for up in current_user_properties}
        
        # Calculate properties to add and remove
        property_ids_to_add = property_ids_set - current_property_ids
        property_ids_to_remove = current_property_ids - property_ids_set
        
        # Add new properties
        properties_added = 0
        for property_id in property_ids_to_add:
            try:
                property_obj = Property.objects.get(id=property_id)
                # Check if there's an inactive record to reactivate
                user_property = UserProperty.objects.filter(
                    user=user, 
                    property=property_obj,
                    is_active=False
                ).first()
                
                if user_property:
                    # Reactivate existing record
                    user_property.is_active = True
                    user_property.save()
                else:
                    # Create new record
                    UserProperty.objects.create(
                        user=user, 
                        property=property_obj,
                        is_active=True
                    )
                properties_added += 1
            except Property.DoesNotExist:
                # Skip non-existent properties
                pass
        
        # Remove properties not in the list
        properties_removed = 0
        for property_id in property_ids_to_remove:
            user_properties = UserProperty.objects.filter(
                user=user, 
                property_id=property_id,
                is_active=True
            )
            for user_property in user_properties:
                user_property.is_active = False
                user_property.save()
                properties_removed += 1
                
        logger.info(f"User properties updated: added {properties_added}, removed {properties_removed}", extra={"request_method": request.method, "user_id": user.id, "properties_added": properties_added, "properties_removed": properties_removed})
        return Response({
            "message": "User properties updated successfully",
            "properties_added": properties_added,
            "properties_removed": properties_removed,
            "total_active_properties": len(property_ids_set) - (properties_added - properties_removed)
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        logger.exception(f"Error in add_properties_to_user: {str(e)}", extra={"request_method": request.method})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/properties/\d+/?$"]
)
def property_detail(request, pk):
    logger.info(f"property_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    property = get_object_or_404(Property, pk=pk)
    if request.method == "GET":
        serializer = PropertyViewSerializer(property, context={"request": request})
        logger.info(f"Retrieved property {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = PropertySerializer(property, data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Property {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update property {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        property.delete()
        logger.info(f"Property {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/reviews/$"])
def review_list(request):
    logger.info(f"review_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == "GET":
        reviews = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        logger.info(f"Retrieved {len(serializer.data)} reviews", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Review created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "review_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create review: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@custom_authentication_and_permissions(
    exempt_get_views=[r"^/api/property/reviews/top/?$"]
)
def top_reviews_by_property_type(request):
    """
    Return the top reviews filtered by property type (hotel/hostel).
    Orders by rating (desc) then created_at (desc) and limits to Top N (default 10).
    """
    property_type = (request.GET.get("property_type") or "").lower() or "hotel"
    if property_type not in ["hotel", "hostel", "hotels", "hostels"]:
        return Response(
            {"error": "property_type must be 'hotel' or 'hostel'"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    normalized_type = "hostel" if "hostel" in property_type else "hotel"

    try:
        limit_param = int(request.GET.get("limit", 10))
    except ValueError:
        limit_param = 10

    limit_param = max(1, min(limit_param, 20))

    logger.info(
        "Fetching top reviews",
        extra={"property_type": normalized_type, "limit": limit_param, "request_method": request.method},
    )

    reviews = (
        Review.objects.filter(
            property__property_type__iexact=normalized_type, is_active=True
        )
        .select_related("property", "user")
        .order_by("-rating", "-created_at")[:limit_param]
    )

    serializer = ReviewSerializer(reviews, many=True)
    logger.info(f"Retrieved {len(serializer.data)} top reviews for property_type {normalized_type}", extra={"request_method": request.method, "property_type": normalized_type, "count": len(serializer.data)})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/reviews/\d+/?$"])
def review_detail(request, pk):
    logger.info(f"review_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    review = get_object_or_404(Review, pk=pk)
    if request.method == "GET":
        serializer = ReviewSerializer(review)
        logger.info(f"Retrieved review {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = ReviewSerializer(review, data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Review {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update review {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        review.delete()
        logger.info(f"Review {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/replies/$"])
def reply_list(request):
    logger.info(f"reply_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == "GET":
        replies = Reply.objects.all()
        serializer = ReplySerializer(replies, many=True)
        logger.info(f"Retrieved {len(serializer.data)} replies", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = ReplySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Reply created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "reply_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create reply: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/replies/\d+/?$"])
def reply_detail(request, pk):
    logger.info(f"reply_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    reply = get_object_or_404(Reply, pk=pk)
    if request.method == "GET":
        serializer = ReplySerializer(reply)
        logger.info(f"Retrieved reply {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = ReplySerializer(reply, data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Reply {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update reply {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        reply.delete()
        logger.info(f"Reply {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions()
@parser_classes([MultiPartParser, FormParser])
def image_upload(request):
    """
    Upload a property image and return its ID.
    """
    logger.info("image_upload called", extra={"request_method": request.method})
    serializer = PropertyImageSerializer(data=request.data)
    if serializer.is_valid():
        image_instance = serializer.save()
        logger.info(f"Property image uploaded successfully with id {image_instance.id}", extra={"request_method": request.method, "image_id": image_instance.id, "category_id": image_instance.category.id if image_instance.category else None})
        # Construct URL consistently with PropertyImageViewSerializer
        image_url = f"{settings.WEBSITE_URL}{settings.MEDIA_URL}{image_instance.image}"
        return Response(
            {
                "id": image_instance.id,
                "image_url": image_url,
                "category": ImageCategorySerializer(image_instance.category).data if image_instance.category else None,
                "category_id": image_instance.category.id if image_instance.category else None,
            },
            status=status.HTTP_201_CREATED,
        )
    logger.warning(f"Failed to upload property image: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/images/\d+/?$"])
def image_detail(request, pk):
    """
    Retrieve or delete a specific property image.
    """
    logger.info(f"image_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    image = get_object_or_404(PropertyImage, pk=pk)
    if request.method == "GET":
        serializer = PropertyImageSerializer(image)
        logger.info(f"Retrieved property image {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = PropertyImageSerializer(image, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Property image {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update property image {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        image.delete()
        logger.info(f"Property image {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@custom_authentication_and_permissions()
@parser_classes([MultiPartParser, FormParser])
def room_image_upload(request):
    """
    Upload a room image and return its ID.
    """
    logger.info("room_image_upload called", extra={"request_method": request.method})
    serializer = RoomImageSerializer(data=request.data)
    if serializer.is_valid():
        image_instance = serializer.save()
        logger.info(f"Room image uploaded successfully with id {image_instance.id}", extra={"request_method": request.method, "image_id": image_instance.id})
        # Construct URL consistently with RoomImageViewSerializer
        image_url = f"{settings.WEBSITE_URL}{settings.MEDIA_URL}{image_instance.image}"
        return Response(
            {
                "id": image_instance.id,
                "image_url": image_url,
            },
            status=status.HTTP_201_CREATED,
        )
    logger.warning(f"Failed to upload room image: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
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
    logger.info(f"search_properties_by_location called with location: {location}", extra={"request_method": request.method, "location": location})
    # Filter properties by location, limit to 5 results
    if not location:
        cities = City.objects.all().order_by('name')[:4]
    else:
        cities = City.objects.filter(name__icontains=location).order_by('name')[:4]

    # Serialize the results
    serializer = CitySerializer(cities, many=True)
    logger.info(f"Found {len(serializer.data)} cities for location: {location}", extra={"request_method": request.method, "location": location, "count": len(serializer.data)})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/cities/$"])
def list_cities(request):
    """
    Search for cities.
    Expects a JSON payload with a 'location' key.
    Returns a maximum of 5 properties matching the location.
    """
    logger.info("list_cities called", extra={"request_method": request.method})
    cities = City.objects.all().order_by('name')
    # Serialize the results
    serializer = CitySerializer(cities, many=True)
    logger.info(f"Retrieved {len(serializer.data)} cities", extra={"request_method": request.method, "count": len(serializer.data)})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/countries/$"])
def list_countries(request):
    logger.info("list_countries called", extra={"request_method": request.method})
    countries = Country.objects.all().order_by('name')
    serializer = CountrySerializer(countries, many=True)
    logger.info(f"Retrieved {len(serializer.data)} countries", extra={"request_method": request.method, "count": len(serializer.data)})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/states/$"])
def list_states(request):
    logger.info("list_states called", extra={"request_method": request.method})
    states = State.objects.all().order_by('name')
    serializer = StateSerializer(states, many=True)
    logger.info(f"Retrieved {len(serializer.data)} states", extra={"request_method": request.method, "count": len(serializer.data)})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/property/areas/[a-zA-Z0-9_-]+/?$"])
def unique_areas_by_city(request, city_name):
    logger.info(f"unique_areas_by_city called for city: {city_name}", extra={"request_method": request.method, "city_name": city_name})
    # Get the city object or return a 404 if it doesn't exist
    city = get_object_or_404(City, name__iexact=city_name)

    # Query for unique areas associated with properties in the specified city
    unique_areas = Property.objects.filter(city=city).values_list('area', flat=True).distinct()
    areas_list = list(unique_areas)
    logger.info(f"Found {len(areas_list)} unique areas for city: {city_name}", extra={"request_method": request.method, "city_name": city_name, "count": len(areas_list)})
    # Return the unique areas as a JSON response
    return Response({"unique_areas": areas_list}, status=status.HTTP_200_OK)


@api_view(["GET"])
def public_search_properties(request):
    """
    Public API endpoint for searching properties - does not require authentication.
    Accepts query parameters: propertyType, rooms, guests, location, area, price, etc.
    Also add is_favorite parameter to add or remove a property from the user's favorite list.
    """
    query_snapshot = request.GET.dict()
    logger.info("Public property search requested", extra={"query_params": query_snapshot, "request_method": request.method})
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
        booking_type = query_params.get("bookingType")

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

        if booking_type:
            if booking_type == 'monthly':
                properties = properties.filter(
                    rooms__monthly_rate__gt=0
                )
            elif booking_type == 'yearly':
                properties = properties.filter(
                    rooms__yearly_rate__gt=0
                )
            else:
                properties = properties.filter(
                    Q(rooms__daily_rate__gt=0) |
                    Q(rooms__monthly_rate__gt=0)
                )

        results_count = properties.count()

        # Add context with user favorites information if the user is authenticated
        context = {"request": request}
        if id:
            user_favorites = FavoriteProperty.objects.filter(
                user_id=id,
                is_active=True
            ).values_list('property_id', flat=True)

            context['user_favorites'] = user_favorites
            
        serializer = PropertyViewSerializer(
            properties, 
            many=True, 
            context=context
        )
        logger.info(
            "Public property search completed",
            extra={"query_params": query_snapshot, "results": results_count, "request_method": request.method}
        )
        return Response(serializer.data)
    except Exception as e:
        logger.exception(
            "Error in public property search",
            extra={"query_params": query_snapshot, "request_method": request.method}
        )
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
    logger.info(f"add_favorite_property called for property {property_id} by user {user.id}", extra={"request_method": request.method, "property_id": property_id, "user_id": user.id})
    property = get_object_or_404(Property, id=property_id)

    is_favorite = request.data.get("is_favourite")   

    if is_favorite:
        favorite_property, created = FavoriteProperty.objects.get_or_create(user=user, property=property)
        logger.info(f"Property {property_id} added to favorites for user {user.id}", extra={"request_method": request.method, "property_id": property_id, "user_id": user.id, "created": created})
        return Response({"message": "Property added to favorites"}, status=status.HTTP_200_OK)
    else:
        favorite_property = FavoriteProperty.objects.filter(user=user, property=property).first()
        if favorite_property:
            favorite_property.delete()
            logger.info(f"Property {property_id} removed from favorites for user {user.id}", extra={"request_method": request.method, "property_id": property_id, "user_id": user.id})
        return Response({"message": "Property removed from favorites"}, status=status.HTTP_200_OK)
    

@api_view(["GET"])
@custom_authentication_and_permissions()
def get_favorite_properties(request):
    """
    Get the user's favorite properties.
    """
    user = request.user
    logger.info(f"get_favorite_properties called for user {user.id}", extra={"request_method": request.method, "user_id": user.id})
    favorite_properties = FavoriteProperty.objects.filter(user=user, is_active=True)
    serializer = FavoritePropertySerializer(favorite_properties, many=True, context={"request": request})
    logger.info(f"Retrieved {len(serializer.data)} favorite properties for user {user.id}", extra={"request_method": request.method, "user_id": user.id, "count": len(serializer.data)})
    return Response(serializer.data)


@api_view(['POST'])
@custom_authentication_and_permissions()
def create_review(request):
    """
    Create a review for a property.
    """
    logger.info("create_review called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
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
            if booking.status not in ['completed', 'checked_out']:
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

            logger.info(f"Review created successfully with id {review.id} for booking {booking_id}", extra={"request_method": request.method, "review_id": review.id, "booking_id": booking_id, "user_id": request.user.id})
            return Response(
                {"message": "Review created successfully", "review_id": review.id},
                status=status.HTTP_201_CREATED
            )
        logger.warning(f"Failed to create review: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception(f"Error in create_review: {str(e)}", extra={"request_method": request.method})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET", "POST"])
@custom_authentication_and_permissions(required_permissions=['admin:pages:manage'])
def site_page_list(request):
    logger.info(f"site_page_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == "GET":
        pages = SitePage.objects.all().order_by('slug')
        serializer = SitePageSerializer(pages, many=True)
        logger.info(f"Retrieved {len(serializer.data)} site pages", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = SitePageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Site page created successfully with slug {serializer.data.get('slug')}", extra={"request_method": request.method, "slug": serializer.data.get('slug')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create site page: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@custom_authentication_and_permissions(
    required_permissions=['admin:pages:manage'],
    exempt_get_views=[r"^/api/property/site-pages/[a-zA-Z0-9\-]+/?$"]
)
def site_page_detail(request, slug):
    logger.info(f"site_page_detail called with method {request.method} for slug {slug}", extra={"request_method": request.method, "slug": slug})
    page = get_object_or_404(SitePage, slug=slug)

    if request.method == "GET":
        serializer = SitePageSerializer(page)
        logger.info(f"Retrieved site page {slug}", extra={"request_method": request.method, "slug": slug})
        return Response(serializer.data)
    elif request.method in ["PUT", "PATCH"]:
        serializer = SitePageSerializer(
            page,
            data=request.data,
            partial=(request.method == "PATCH")
        )
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Site page {slug} updated successfully", extra={"request_method": request.method, "slug": slug})
            return Response(serializer.data)
        logger.warning(f"Failed to update site page {slug}: {serializer.errors}", extra={"request_method": request.method, "slug": slug, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        page.delete()
        logger.info(f"Site page {slug} deleted successfully", extra={"request_method": request.method, "slug": slug})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
@custom_authentication_and_permissions(required_permissions=['admin:pages:manage'])
def site_page_upload_image(request):
    logger.info("site_page_upload_image called", extra={"request_method": request.method})
    file = request.FILES.get('image')
    if not file:
        logger.warning("No image file provided for site page upload", extra={"request_method": request.method})
        return Response({"error": "No image file provided"}, status=status.HTTP_400_BAD_REQUEST)

    slug = request.data.get('slug')
    page = None
    if slug:
        page = SitePage.objects.filter(slug=slug).first()

    image_instance = SitePageImage.objects.create(page=page, image=file)
    serializer = SitePageImageSerializer(image_instance, context={'request': request})

    image_url = request.build_absolute_uri(image_instance.image.url)
    data = serializer.data
    data['image_url'] = image_url
    logger.info(f"Site page image uploaded successfully with id {image_instance.id} for slug {slug}", extra={"request_method": request.method, "image_id": image_instance.id, "slug": slug})
    return Response(data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def settings_list(request):
    """
    Get all settings (no authentication required for reading)
    """
    logger.info("settings_list called", extra={"request_method": request.method})
    settings = Setting.objects.filter(is_active=True)
    settings_dict = {setting.key: setting.value for setting in settings}
    logger.info(f"Retrieved {len(settings_dict)} settings", extra={"request_method": request.method, "count": len(settings_dict)})
    return Response(settings_dict)


@api_view(["GET", "PUT"])
@custom_authentication_and_permissions(required_permissions=['admin:settings:manage'])
def settings_detail(request, key):
    """
    Get or update a specific setting (requires authentication for updates)
    """
    logger.info(f"settings_detail called with method {request.method} for key {key}", extra={"request_method": request.method, "key": key})
    try:
        setting = Setting.objects.get(key=key)
        
        if request.method == "GET":
            logger.info(f"Retrieved setting {key}", extra={"request_method": request.method, "key": key})
            return Response({"key": setting.key, "value": setting.value, "description": setting.description})
        
        elif request.method == "PUT":
            setting.value = request.data.get('value', setting.value)
            setting.description = request.data.get('description', setting.description)
            setting.save()
            logger.info(f"Setting {key} updated successfully", extra={"request_method": request.method, "key": key})
            return Response({
                "message": "Setting updated successfully",
                "key": setting.key,
                "value": setting.value
            })
    except Setting.DoesNotExist:
        logger.warning(f"Setting {key} not found", extra={"request_method": request.method, "key": key})
        return Response(
            {"error": "Setting not found"},
            status=status.HTTP_404_NOT_FOUND
        )
