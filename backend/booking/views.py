from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Booking, BookingDocument
from .serializers import BookingSerializer, BookingUserViewSerializer, BookingViewSerializer, BookingDocumentSerializer, BookingDocumentViewSerializer
from users.decorators import custom_authentication_and_permissions
from django.shortcuts import get_object_or_404
from property.serializers import PropertyViewSerializer
from users.models import HsUser

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def booking_list(request):
    if request.method == 'GET':
        bookings = Booking.objects.all().order_by('-created_at')
        serializer = BookingViewSerializer(bookings, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        print(request.data)
        serializer = BookingSerializer(data=request.data)
        print(serializer.is_valid())
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions()
def booking_detail(request, pk):
    booking = get_object_or_404(Booking, pk=pk)
    if request.method == 'GET':
        serializer = BookingSerializer(booking)
        return Response(serializer.data)
    elif request.method == 'PUT':
        booking = get_object_or_404(Booking, pk=pk)
        data = request.data

        if 'property' in data:
            booking.property_id = data['property'] # Assuming request sends property id
        if 'room' in data:
            booking.room_id = data['room'] # Assuming request sends room id
        if 'user' in data:
            booking.user_id = data['user'] # Assuming request sends user id
        if 'checkin_date' in data:
            booking.checkin_date = data['checkin_date']
        if 'checkout_date' in data:
            booking.checkout_date = data['checkout_date']
        if 'status' in data:
            valid_statuses = [choice[0] for choice in Booking.STATUS_CHOICES]
            if data['status'] in valid_statuses:
                booking.status = data['status']
            else:
                return Response({'error': 'Invalid status value.'}, status=status.HTTP_400_BAD_REQUEST)
        if 'discount' in data:
            booking.discount = data['discount']
        if 'price' in data:
            booking.price = data['price']
        if 'booking_type' in data:
            valid_booking_types = [choice[0] for choice in Booking.BOOKING_TYPE_CHOICES]
            if data['booking_type'] in valid_booking_types:
                booking.booking_type = data['booking_type']
            else:
                return Response({'error': 'Invalid booking_type value.'}, status=status.HTTP_400_BAD_REQUEST)
        if 'payment_type' in data:
            valid_payment_types = [choice[0] for choice in Booking.PAYMENT_TYPE_CHOICES]
            if data['payment_type'] in valid_payment_types:
                booking.payment_type = data['payment_type']
            else:
                return Response({'error': 'Invalid payment_type value.'}, status=status.HTTP_400_BAD_REQUEST)
        if 'number_of_guests' in data:
            booking.number_of_guests = data['number_of_guests']
        if 'number_of_rooms' in data:
            booking.number_of_rooms = data['number_of_rooms']

        booking.save()
        serializer = BookingSerializer(booking) # Reserialize to return updated data
        return Response(serializer.data)
    elif request.method == 'DELETE':
        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@custom_authentication_and_permissions()
def booking_list_by_user(request):
    """
    Retrieve a list of bookings for the authenticated user, including detailed property information.

    Returns:
        Response: A list of booking objects with serialized property details.
    """
    user_id = request.query_params.get("user_id")
    if user_id:
        user = get_object_or_404(HsUser, id=user_id)
    else:
        user = request.user
    bookings = Booking.objects.filter(user=user).order_by('-created_at')
    serializer = BookingUserViewSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@custom_authentication_and_permissions()
def update_booking_status(request, pk):
    booking = get_object_or_404(Booking, pk=pk)
    booking.status = request.data['status']
    booking.save()
    return Response({'message': 'Booking status updated successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def upload_booking_document(request, pk):
    booking = get_object_or_404(Booking, id=pk)
    if request.method == 'GET':
        print(booking)
        documents = BookingDocument.objects.filter(booking=booking)
        print(documents)
        serializer = BookingDocumentViewSerializer(documents, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        file = request.FILES['file']
        serializer = BookingDocumentSerializer(data={'booking': booking.id, 'document': file})
        if serializer.is_valid():
            serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'DELETE'])
@custom_authentication_and_permissions()
def booking_document_view(request, pk):
    if request.method == 'GET':
        booking_documents = BookingDocument.objects.filter(id=pk)
        serializer = BookingDocumentViewSerializer(booking_documents, many=True)
        return Response(serializer.data)
    
    elif request.method == 'DELETE':
        booking_document = BookingDocument.objects.get(id=pk)
        booking_document.delete()
        return Response({'message': 'Booking document deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@custom_authentication_and_permissions()
def booking_list_by_user_id(request, user_id):
    bookings = Booking.objects.filter(user_id=user_id).order_by('-created_at')
    serializer = BookingUserViewSerializer(bookings, many=True)
    return Response(serializer.data)
