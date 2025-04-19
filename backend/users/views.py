import random
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.core.cache import cache
from .models import HsUser, UserSession, HsPermission, HsPermissionGroup, UserHsPermission, UserDocument
from .serializers import UserSerializer, UserViewSerializer, HsPermissionSerializer, HsPermissionGroupSerializer, UserDocumentSerializer, UserDocumentViewSerializer
from django.shortcuts import get_object_or_404
import logging
from .decorators import custom_authentication_and_permissions
import jwt
from datetime import timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)

@api_view(['POST'])
def send_otp(request):
    mobile = request.data.get('mobile')
    if not mobile:
        logger.error("Mobile number is required")
        return Response({'error': 'Mobile number is required'}, status=status.HTTP_400_BAD_REQUEST)

    otp = str(random.randint(100000, 999999))
    cache.set(mobile, otp, timeout=300)  # OTP valid for 5 minutes
    # In real app, send OTP via SMS
    logger.info(f"OTP for {mobile}: {otp}")
    return Response({'message': 'OTP sent successfully', 'otp': otp}, status=status.HTTP_200_OK)


@api_view(['POST'])
def verify_otp(request):
    mobile = request.data.get('mobile')
    otp = request.data.get('otp')

    cached_otp = cache.get(mobile)
    logger.info(f"Cached OTP: {cached_otp}, OTP: {otp}")
    if not cached_otp or cached_otp != otp:
        logger.error(f"Invalid OTP for mobile: {mobile}")
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

    cache.delete(mobile)
    user, created = HsUser.objects.get_or_create(mobile=mobile)
    
    if created:
        user_role = 'admin'
    else:
        user_role = user.user_role
    
    UserSession.objects.create(user=user)
    logger.info(f"User {mobile} logged in")
    
    payload = {
        'user_id': user.id,
        'exp': timezone.now() + timedelta(minutes=60)
    }
    access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

    print(user)

    user_permissions = UserHsPermission.objects.filter(user=user).values_list('permission_group__permissions__name', flat=True)
    print(user_permissions)
    user_permissions_set = set(user_permissions)  # Convert to set for faster lookup

    return Response({'access_token': access_token, 'user_role': user_role, "name": user.name, "id": user.id, "permissions": user_permissions_set}, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT'])
@custom_authentication_and_permissions()
def profile(request):
    if request.method == 'GET':
        user = request.user
        serializer = UserSerializer(user)
        logger.info(f"Profile viewed for user: {user.mobile}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Profile updated for user: {user.mobile}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Invalid profile update for user: {user.mobile}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@custom_authentication_and_permissions(required_permissions=['admin:user'])
def admin_profile(request, user_id):
    user = get_object_or_404(HsUser, id=user_id)
    if request.method == 'GET':
        serializer = UserSerializer(user)
        logger.info(f"Admin viewed profile for user: {user.mobile}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Admin updated profile for user: {user.mobile}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Admin invalid profile update for user: {user.mobile}")
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
        logger.error(f"Error retrieving user or permission group: {e}")
        return Response({'error': 'Invalid User ID or Group ID'}, status=status.HTTP_400_BAD_REQUEST)

    UserHsPermission.objects.update_or_create(
        user=user,
        defaults={'permission_group': permission_group, 'is_active': True}
    )
    logger.info(f"Permission group '{permission_group.name}' assigned to user: {user.mobile}")
    return Response({'message': 'Permission group assigned successfully'}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def list_permissions(request):
    if request.method == 'GET':
        permissions = HsPermission.objects.all()
        serializer = HsPermissionSerializer(permissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = HsPermissionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def list_group_permissions(request):
    if request.method == 'GET':
        groups = HsPermissionGroup.objects.all()
        serializer = HsPermissionGroupSerializer(groups, many=True)
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
        logger.info(f"Permissions assigned to group: {group.name}")
        return Response({'message': 'Permissions assigned successfully'}, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions()
def view_group_permissions(request, id):
    group = HsPermissionGroup.objects.get(id=id)
    if request.method == 'GET':
        permissions = group.permissions.all()
        serializer = HsPermissionSerializer(permissions, many=True)
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
        logger.info(f"Group permissions updated: {group.name}")
        return Response({'message': 'Permissions updated successfully'}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        group.delete()
        logger.info(f"Group permissions deleted: {group.name}")
        return Response({'message': 'Group permissions deleted successfully'}, status=status.HTTP_200_OK)
        
        

@api_view(['GET'])
@custom_authentication_and_permissions()
def list_users(request):
    users = HsUser.objects.all()
    serializer = UserViewSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST', 'DELETE'])
@custom_authentication_and_permissions()
def user_document(request, pk):
    user = get_object_or_404(HsUser, id=pk)
    if request.method == 'GET':
        documents = UserDocument.objects.filter(user=user)
        serializer = UserDocumentViewSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK) 
    elif request.method == 'POST':
        serializer = UserDocumentSerializer(data={'user': user.id, 'document': request.FILES['document']})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        document = get_object_or_404(UserDocument, id=pk)
        document.delete()
        return Response({'message': 'Document deleted successfully'}, status=status.HTTP_200_OK)
