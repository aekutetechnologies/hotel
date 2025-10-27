from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Booking, BookingDocument, HostelVisit
from .serializers import BookingSerializer, BookingUserViewSerializer, BookingViewSerializer, BookingDocumentSerializer, BookingDocumentViewSerializer, HostelVisitSerializer, HostelVisitViewSerializer
from users.decorators import custom_authentication_and_permissions
from django.shortcuts import get_object_or_404
from property.serializers import PropertyViewSerializer
from users.models import HsUser, UserHsPermission
from property.models import UserProperty
import requests
from urllib.parse import quote as urlquote
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
    print(user_id)
    if user_id:
        user = get_object_or_404(HsUser, id=user_id)
    else:
        user = request.user

    is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
    is_customer = UserHsPermission.objects.filter(user=user, permission_group__name="customer").exists()

    if is_admin:
        bookings = Booking.objects.all().order_by('-created_at')
    elif is_customer:
        bookings = Booking.objects.filter(user=user).order_by('-created_at')
    else:
        user_properties = UserProperty.objects.filter(user=user, is_active=True).values_list('property_id', flat=True)
        print(user_properties)
        bookings = Booking.objects.filter(property__in=user_properties).order_by('-created_at')
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
        print(file)
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
        return Response({'message': 'Booking document deleted successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@custom_authentication_and_permissions()
def booking_list_by_user_id(request, user_id):
    bookings = Booking.objects.filter(user_id=user_id).order_by('-created_at')
    serializer = BookingUserViewSerializer(bookings, many=True)
    return Response(serializer.data)


# Hostel Visit Views

@api_view(['GET', 'POST'])
def hostel_visit_list(request):
    """
    GET: List all hostel visits (admin view - requires auth)
    POST: Create a new hostel visit (no authentication required)
    """
    if request.method == 'GET':
        # Check if user is authenticated
        auth = request.headers.get('Authorization')
        if not auth or not auth.startswith('Bearer '):
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Decorate with auth for GET
        decorated_view = custom_authentication_and_permissions()(
            lambda req: hostel_visit_list_get(req)
        )
        return decorated_view(request)
    
    elif request.method == 'POST':
        # POST doesn't require authentication
        # If user is authenticated, use their user_id
        data = request.data.copy()
        
        # Check if user is authenticated (optional)
        auth = request.headers.get('Authorization')
        if auth and auth.startswith('Bearer '):
            try:
                import jwt
                from django.conf import settings
                from users.models import HsUser
                token = auth[7:]
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
                if user_id:
                    data['user'] = user_id
            except:
                pass  # If auth fails, continue without user
        
        serializer = HostelVisitSerializer(data=data)
        if serializer.is_valid():
            visit = serializer.save()
            
            # Send WhatsApp notification programmatically
            try:
                from property.models import Property
                property_obj = Property.objects.get(id=visit.property.id)
                
                # Format visit date and time
                visit_date_formatted = visit.visit_date.strftime('%B %d, %Y')
                visit_time_formatted = visit.visit_time.strftime('%I:%M %p')
                
                # Create notification message
                visitor_name = visit.name or (visit.user.name if visit.user else 'Guest')
                visitor_phone = visit.phone or (visit.user.mobile if visit.user else 'Not provided')
                
                message = f"""🏠 New Visit Request

Property: {property_obj.name}
Location: {property_obj.location}

Visitor Details:
👤 Name: {visitor_name}
📱 Phone: {visitor_phone}
👥 Guests: {visit.number_of_guests}

📅 Visit Date: {visit_date_formatted}
⏰ Visit Time: {visit_time_formatted}

{('📝 Notes: ' + visit.notes) if visit.notes else ''}

Please confirm this visit booking."""
                
                # WhatsApp number (same as chat)
                whatsapp_number = '918342091661'
                whatsapp_url = f"https://wa.me/{whatsapp_number}?text={urlquote(message)}"
                print(whatsapp_url)
                
                # Trigger WhatsApp URL programmatically (opens WhatsApp Web/App)
                try:
                    requests.get(whatsapp_url, timeout=5)
                    print(f"✓ WhatsApp notification sent successfully")
                except requests.RequestException as e:
                    print(f"⚠ Could not send WhatsApp notification: {str(e)}")
                
            except Exception as e:
                print(f"Error sending WhatsApp notification: {str(e)}")
            
            # Return the detailed view
            return_serializer = HostelVisitViewSerializer(visit)
            return Response(return_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def hostel_visit_list_get(request):
    """Helper function for GET request that requires authentication"""
    visits = HostelVisit.objects.all().order_by('-visit_date', '-visit_time')
    serializer = HostelVisitViewSerializer(visits, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(required_permissions=['booking:view', 'booking:update', 'booking:delete'])
def hostel_visit_detail(request, pk):
    """
    GET: Retrieve a hostel visit
    PUT: Update a hostel visit
    DELETE: Delete a hostel visit
    """
    visit = get_object_or_404(HostelVisit, pk=pk)
    
    if request.method == 'GET':
        serializer = HostelVisitViewSerializer(visit)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = HostelVisitSerializer(visit, data=request.data, partial=True)
        if serializer.is_valid():
            visit = serializer.save()
            return_serializer = HostelVisitViewSerializer(visit)
            return Response(return_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        visit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@custom_authentication_and_permissions()
def hostel_visit_list_by_user(request):
    """Get all visits for the logged-in user"""
    visits = HostelVisit.objects.filter(user=request.user).order_by('-visit_date', '-visit_time')
    serializer = HostelVisitViewSerializer(visits, many=True)
    return Response(serializer.data)
