from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Property, Amenity, Room, Rule, Documentation, Review, Reply, PropertyImage
from .serializers import PropertySerializer, AmenitySerializer, RoomSerializer, RuleSerializer, DocumentationSerializer, ReviewSerializer, ReplySerializer, PropertyViewSerializer, PropertyImageSerializer
from users.decorators import custom_authentication_and_permissions
from django.shortcuts import get_object_or_404
from backend.settings import WEBSITE_URL

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/amenities/$'])
def amenity_list(request):
    if request.method == 'GET':
        amenities = Amenity.objects.all()
        print(amenities)
        serializer = AmenitySerializer(amenities, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = AmenitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'response.data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/amenities/\d+/?$'])
def amenity_detail(request, pk):
    amenity = get_object_or_404(Amenity, pk=pk)
    if request.method == 'GET':
        serializer = AmenitySerializer(amenity)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = AmenitySerializer(amenity, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        amenity.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/rules/$'])
def rule_list(request):
    if request.method == 'GET':
        rules = Rule.objects.all()
        serializer = RuleSerializer(rules, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = RuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/rules/\d+/?$'])
def rule_detail(request, pk):
    rule = get_object_or_404(Rule, pk=pk)
    if request.method == 'GET':
        serializer = RuleSerializer(rule)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = RuleSerializer(rule, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        rule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/documentations/$'])
def documentation_list(request):
    if request.method == 'GET':
        documentations = Documentation.objects.all()
        serializer = DocumentationSerializer(documentations, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = DocumentationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/documentations/\d+/?$'])
def documentation_detail(request, pk):
    documentation = get_object_or_404(Documentation, pk=pk)
    if request.method == 'GET':
        serializer = DocumentationSerializer(documentation)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = DocumentationSerializer(documentation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        documentation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/rooms/$'])
def room_list(request):
    if request.method == 'GET':
        rooms = Room.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/rooms/\d+/?$'])
def room_detail(request, pk):
    room = get_object_or_404(Room, pk=pk)
    if request.method == 'GET':
        serializer = RoomSerializer(room)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = RoomSerializer(room, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/properties/$'])
def property_list(request):
    if request.method == 'GET':
        properties = Property.objects.all()
        serializer = PropertyViewSerializer(properties, many=True, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'POST':
        print(request.data)
        serializer = PropertySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/properties/\d+/?$'])
def property_detail(request, pk):
    property = get_object_or_404(Property, pk=pk)
    if request.method == 'GET':
        serializer = PropertyViewSerializer(property, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = PropertySerializer(property, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        property.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/reviews/$'])
def review_list(request):
    if request.method == 'GET':
        reviews = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/reviews/\d+/?$'])
def review_detail(request, pk):
    review = get_object_or_404(Review, pk=pk)
    if request.method == 'GET':
        serializer = ReviewSerializer(review)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ReviewSerializer(review, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/replies/$'])
def reply_list(request):
    if request.method == 'GET':
        replies = Reply.objects.all()
        serializer = ReplySerializer(replies, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ReplySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/replies/\d+/?$'])
def reply_detail(request, pk):
    reply = get_object_or_404(Reply, pk=pk)
    if request.method == 'GET':
        serializer = ReplySerializer(reply)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ReplySerializer(reply, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        reply.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
@parser_classes([MultiPartParser, FormParser])
def image_upload(request):
    """
    Upload a property image and return its ID.
    """
    serializer = PropertyImageSerializer(data=request.data)
    if serializer.is_valid():
        image_instance = serializer.save()
        return Response({'id': image_instance.id, 'image_url': WEBSITE_URL + image_instance.image.url}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'DELETE'])
@custom_authentication_and_permissions(exempt_get_views=[r'^/property/images/\d+/?$'])
def image_detail(request, pk):
    """
    Retrieve or delete a specific property image.
    """
    image = get_object_or_404(PropertyImage, pk=pk)
    if request.method == 'GET':
        serializer = PropertyImageSerializer(image)
        return Response(serializer.data)
    elif request.method == 'DELETE':
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)