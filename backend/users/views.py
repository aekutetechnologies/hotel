import random
import secrets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.core.cache import cache
from .models import HsUser, UserSession, HsPermission, HsPermissionGroup, UserHsPermission, UserDocument, RefreshToken
from .serializers import UserSerializer, UserViewSerializer, HsPermissionSerializer, HsPermissionGroupSerializer, UserDocumentSerializer, UserDocumentViewSerializer
from django.shortcuts import get_object_or_404
import logging
from .decorators import custom_authentication_and_permissions
import jwt
from datetime import timedelta
from django.utils import timezone
import requests

logger = logging.getLogger(__name__)

# Static login numbers and their middle 6 digits
STATIC_LOGIN_NUMBERS = {
    '8342091661': '420916',
    '9938252725': '382527',
    '9820769934': '207699',
}

def is_static_login_number(mobile):
    """Check if the mobile number is in the static login list"""
    return mobile in STATIC_LOGIN_NUMBERS

def get_static_login_otp(mobile):
    """Get the static OTP (middle 6 digits) for a static login number"""
    return STATIC_LOGIN_NUMBERS.get(mobile)

@api_view(['POST'])
def send_otp(request):
    mobile = request.data.get('mobile')
    if not mobile:
        logger.error("Mobile number is required", extra={"request_method": request.method})
        return Response({'error': 'Mobile number is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if this is a static login number
    if is_static_login_number(mobile):
        # For static numbers, don't send OTP but return success
        # The user will use the middle 6 digits as OTP
        logger.info(f"Static login number detected: {mobile}, skipping OTP send", extra={"request_method": request.method})
        return Response({'message': 'OTP sent successfully', 'is_static': True}, status=status.HTTP_200_OK)

    otp = str(random.randint(100000, 999999))
    cache.set(mobile, otp, timeout=300)  # OTP valid for 5 minutes
    # In real app, send OTP via SMS
    print(otp)
    otp_string = f"https://sms.staticking.com/index.php/smsapi/httpapi/?secret=psbJQL0U6jliRlaB4Syj&sender=HSQUPL&tempid=1707170989463685583&receiver={mobile}&route=TA&msgtype=1&sms=%22Welcome%20to%20Hsquareliving!%20Your%20One-Time%20Password%20(OTP)%20for%20registration/sign-in%20is:%20{otp}.%20Keep%20it%20safe%20and%20happy%20exploring!%22"
    requests.get(otp_string)
    return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def verify_otp(request):
    mobile = request.data.get('mobile')
    otp = request.data.get('otp')

    # Check if this is a static login number
    if is_static_login_number(mobile):
        static_otp = get_static_login_otp(mobile)
        logger.info(f"Static login verification for mobile: {mobile}, Expected OTP: {static_otp}, Provided OTP: {otp}", extra={"request_method": request.method})
        if otp != static_otp:
            logger.error(f"Invalid static OTP for mobile: {mobile}", extra={"request_method": request.method})
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_401_UNAUTHORIZED)
        # Static login successful, proceed with user creation/login
        logger.info(f"Static login successful for mobile: {mobile}", extra={"request_method": request.method})
    else:
        # Regular OTP verification
        cached_otp = cache.get(mobile)
        logger.info(f"Cached OTP: {cached_otp}, OTP: {otp}", extra={"request_method": request.method})
        if not cached_otp or cached_otp != otp:
            logger.error(f"Invalid OTP for mobile: {mobile}", extra={"request_method": request.method})
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_401_UNAUTHORIZED)
        cache.delete(mobile)
    user, created = HsUser.objects.get_or_create(mobile=mobile)
    
    if created:
        user_role = 'customer'
        UserHsPermission.objects.create(user=user, permission_group=HsPermissionGroup.objects.get(name='customer'))
    else:
        user_role = user.user_role
    
    UserSession.objects.create(user=user)
    logger.info(f"User {mobile} logged in", extra={"request_method": request.method})
    
    # Generate access token (short-lived: 15 minutes)
    if user.user_role == 'admin':
        access_token_lifetime = 525600
    else:
        access_token_lifetime = 15
    access_payload = {
        'user_id': user.id,
        'exp': timezone.now() + timedelta(minutes=access_token_lifetime),
        'type': 'access'
    }
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    
    # Generate refresh token (long-lived: 7 days)
    refresh_token_string = secrets.token_urlsafe(64)
    refresh_expires_at = timezone.now() + timedelta(days=7)
    
    # Invalidate old refresh tokens for this user
    RefreshToken.objects.filter(user=user, is_active=True).update(is_active=False)
    
    # Store refresh token in database
    refresh_token_obj = RefreshToken.objects.create(
        user=user,
        token=refresh_token_string,
        expires_at=refresh_expires_at
    )
    
    # Also encode refresh token as JWT for consistency
    refresh_payload = {
        'user_id': user.id,
        'token_id': refresh_token_obj.id,
        'exp': refresh_expires_at,
        'type': 'refresh'
    }
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')

    user_permissions = UserHsPermission.objects.filter(user=user).values_list('permission_group__permissions__name', flat=True)
    print(user_permissions)
    user_permissions_set = set(user_permissions)  # Convert to set for faster lookup

    return Response({
        'access_token': access_token, 
        'refresh_token': refresh_token,
        'user_role': user_role, 
        "name": user.name, 
        "id": user.id, 
        "permissions": user_permissions_set
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT'])
@custom_authentication_and_permissions()
def profile(request):
    if request.method == 'GET':
        user = request.user
        serializer = UserSerializer(user)
        logger.info(f"Profile viewed for user: {user.mobile}", extra={"request_method": request.method})
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':

        if 'user_id' in request.data:
            user = HsUser.objects.get(id=request.data.get('user_id'))
        else:
            user = request.user

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Profile updated for user: {user.mobile}", extra={"request_method": request.method})
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Invalid profile update for user: {user.mobile}", extra={"request_method": request.method})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@custom_authentication_and_permissions(required_permissions=['admin:user'])
def admin_profile(request, user_id):
    user = get_object_or_404(HsUser, id=user_id)
    if request.method == 'GET':
        serializer = UserSerializer(user)
        logger.info(f"Viewed profile for user: {user.mobile}", extra={"request_method": request.method})
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Profile updated for user: {user.mobile}", extra={"request_method": request.method})
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Invalid profile update for user: {user.mobile}", extra={"request_method": request.method})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@custom_authentication_and_permissions()
def assign_group_permission_to_user(request):
    user_id = request.data.get('user_id')
    group_id = request.data.get('group_id')
    if not user_id or not group_id:
        return Response({'error': 'User ID and Group ID are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = get_object_or_404(HsUser, id=user_id)
        permission_group = get_object_or_404(HsPermissionGroup, id=group_id)
    except Exception as e:
        logger.error(f"Error retrieving user or permission group: {e}", extra={"request_method": request.method})
        return Response({'error': 'Invalid User ID or Group ID'}, status=status.HTTP_400_BAD_REQUEST)

    UserHsPermission.objects.update_or_create(
        user=user,
        defaults={'permission_group': permission_group, 'is_active': True}
    )
    logger.info(f"Permission group '{permission_group.name}' assigned to user: {user.mobile}", extra={"request_method": request.method})
    return Response({'message': 'Permission group assigned successfully'}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def list_permissions(request):
    logger.info(f"list_permissions called with method {request.method}", extra={"request_method": request.method})
    if request.method == 'GET':
        permissions = HsPermission.objects.all()
        serializer = HsPermissionSerializer(permissions, many=True)
        logger.info(f"Retrieved {len(serializer.data)} permissions", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = HsPermissionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Permission created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "permission_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create permission: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def list_group_permissions(request):
    logger.info(f"list_group_permissions called with method {request.method}", extra={"request_method": request.method})
    if request.method == 'GET':
        groups = HsPermissionGroup.objects.all()
        serializer = HsPermissionGroupSerializer(groups, many=True)
        logger.info(f"Retrieved {len(serializer.data)} permission groups", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        permission_ids = request.data.get('permissions', [])
        if not isinstance(permission_ids, list):
            return Response({'error': 'Permissions must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        permissions = []
        for id in permission_ids:
            try:
                permission = HsPermission.objects.get(id=int(id))
                permissions.append(permission)
            except HsPermission.DoesNotExist:
                return Response({'error': f'Permission {id} does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        group = HsPermissionGroup.objects.create(name=request.data.get('name'))
        group.permissions.set(permissions)
        logger.info(f"Permissions assigned to group: {group.name}", extra={"request_method": request.method})
        return Response({'message': 'Permissions assigned successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def refresh_token(request):
    """Refresh access token using refresh token"""
    refresh_token_value = request.data.get('refresh_token')
    if not refresh_token_value:
        logger.error("Refresh token is required", extra={"request_method": request.method})
        return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Decode the refresh token with options to verify expiration
        payload = jwt.decode(refresh_token_value, settings.SECRET_KEY, algorithms=['HS256'], options={"verify_exp": True})
        
        # Verify it's a refresh token
        if payload.get('type') != 'refresh':
            logger.error("Invalid token type", extra={"request_method": request.method})
            return Response({'error': 'Invalid token type'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user_id = payload.get('user_id')
        token_id = payload.get('token_id')
        
        if not user_id or not token_id:
            logger.error("Invalid token payload", extra={"request_method": request.method})
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Verify refresh token exists and is valid in database
        try:
            refresh_token_obj = RefreshToken.objects.get(id=token_id, user_id=user_id, is_active=True)
        except RefreshToken.DoesNotExist:
            logger.error(f"Refresh token not found or inactive: token_id={token_id}", extra={"request_method": request.method})
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if refresh token is expired
        if refresh_token_obj.is_expired():
            logger.error(f"Refresh token expired: token_id={token_id}", extra={"request_method": request.method})
            refresh_token_obj.is_active = False
            refresh_token_obj.save()
            return Response({'error': 'Refresh token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get user
        try:
            user = HsUser.objects.get(id=user_id)
        except HsUser.DoesNotExist:
            logger.error(f"User not found: user_id={user_id}", extra={"request_method": request.method})
            return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate new access token
        access_payload = {
            'user_id': user.id,
            'exp': timezone.now() + timedelta(minutes=15),
            'type': 'access'
        }
        access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
        
        # Get user permissions
        user_permissions = UserHsPermission.objects.filter(user=user).values_list('permission_group__permissions__name', flat=True)
        user_permissions_set = set(user_permissions)
        
        logger.info(f"Token refreshed for user: {user.mobile}", extra={"request_method": request.method})
        
        return Response({
            'access_token': access_token,
            'user_role': user.user_role,
            'name': user.name,
            'id': user.id,
            'permissions': user_permissions_set
        }, status=status.HTTP_200_OK)
        
    except jwt.ExpiredSignatureError:
        logger.error("Refresh token expired (JWT)", extra={"request_method": request.method})
        return Response({'error': 'Refresh token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid refresh token: {e}", extra={"request_method": request.method})
        return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        logger.error(f"Error refreshing token: {e}", extra={"request_method": request.method})
        return Response({'error': 'Failed to refresh token'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions()
def view_group_permissions(request, id):
    logger.info(f"view_group_permissions called with method {request.method} for id {id}", extra={"request_method": request.method, "group_id": id})
    group = HsPermissionGroup.objects.get(id=id)
    if request.method == 'GET':
        permissions = group.permissions.all()
        serializer = HsPermissionSerializer(permissions, many=True)
        logger.info(f"Retrieved {len(serializer.data)} permissions for group {id}", extra={"request_method": request.method, "group_id": id, "count": len(serializer.data)})
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        group.is_active = request.data.get('is_active', group.is_active)
        permission_ids = request.data.get('permissions', [])
        if not isinstance(permission_ids, list):
            return Response({'error': 'Permissions must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        permissions = []
        for id in permission_ids:
            try:
                permission = HsPermission.objects.get(id=int(id))
                permissions.append(permission)
            except HsPermission.DoesNotExist:
                return Response({'error': f'Permission {id} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        group.permissions.set(permissions)
        group.save()
        logger.info(f"Group permissions updated: {group.name}", extra={"request_method": request.method})
        return Response({'message': 'Permissions updated successfully'}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        group.delete()
        logger.info(f"Group permissions deleted: {group.name}", extra={"request_method": request.method})
        return Response({'message': 'Group permissions deleted successfully'}, status=status.HTTP_200_OK)
        
        

@api_view(['GET'])
@custom_authentication_and_permissions()
def list_users(request):
    logger.info("list_users called", extra={"request_method": request.method})
    users = HsUser.objects.all()
    serializer = UserViewSerializer(users, many=True)
    logger.info(f"Retrieved {len(serializer.data)} users", extra={"request_method": request.method, "count": len(serializer.data)})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST', 'DELETE'])
@custom_authentication_and_permissions()
def user_document(request, pk):
    logger.info(f"user_document called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    user = get_object_or_404(HsUser, id=pk)
    if request.method == 'GET':
        documents = UserDocument.objects.filter(user=user)
        serializer = UserDocumentViewSerializer(documents, many=True)
        logger.info(f"Retrieved {len(serializer.data)} documents for user {pk}", extra={"request_method": request.method, "user_id": pk, "count": len(serializer.data)})
        return Response(serializer.data, status=status.HTTP_200_OK) 
    elif request.method == 'POST':
        serializer = UserDocumentSerializer(data={'user': user.id, 'document': request.FILES['document']})
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Document uploaded successfully for user {pk} with id {serializer.data.get('id')}", extra={"request_method": request.method, "user_id": pk, "document_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to upload document for user {pk}: {serializer.errors}", extra={"request_method": request.method, "user_id": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        document = get_object_or_404(UserDocument, id=pk)
        document.delete()
        logger.info(f"Document {pk} deleted successfully", extra={"request_method": request.method, "document_id": pk})
        return Response({'message': 'Document deleted successfully'}, status=status.HTTP_200_OK)
