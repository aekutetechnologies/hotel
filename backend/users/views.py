import random
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.core.cache import cache
from .models import HsUser, UserSession, HsPermission
from .serializers import UserSerializer, UserViewSerializer
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
    return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def verify_otp(request):
    mobile = request.data.get('mobile')
    otp = request.data.get('otp')

    cached_otp = cache.get(mobile)
    if not cached_otp or cached_otp != otp:
        logger.error(f"Invalid OTP for mobile: {mobile}")
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

    cache.delete(mobile)
    user, created = HsUser.objects.get_or_create(mobile=mobile)
    
    if created:
        user_role = 'customer'
    else:
        user_role = user.user_role
    
    UserSession.objects.create(user=user)
    logger.info(f"User {mobile} logged in")
    
    payload = {
        'user_id': user.id,
        'exp': timezone.now() + timedelta(minutes=60)
    }
    access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

    return Response({'access_token': access_token, 'user_role': user_role, "name": user.name, "id": user.id}, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT'])
@custom_authentication_and_permissions()
def profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(user)
        print(serializer.data)
        logger.info(f"Profile viewed for user: {user.mobile}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
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
@custom_authentication_and_permissions(required_permissions=['admin:user'])
def assign_permissions(request, user_id):
    user = get_object_or_404(HsUser, id=user_id)
    permission_names = request.data.get('permissions', [])
    
    if not isinstance(permission_names, list):
        return Response({'error': 'Permissions must be a list'}, status=status.HTTP_400_BAD_REQUEST)
    
    permissions = []
    for name in permission_names:
        try:
            permission = HsPermission.objects.get(name=name)
            permissions.append(permission)
        except HsPermission.DoesNotExist:
            return Response({'error': f'Permission {name} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.hspermission_set.set(permissions)
    logger.info(f"Permissions assigned to user: {user.mobile}")
    return Response({'message': 'Permissions assigned successfully'}, status=status.HTTP_200_OK)


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
def list_user_permissions(request, id):
    if request.method == 'GET':
        permissions = user.hspermission_set.all()
        serializer = HsPermissionSerializer(permissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        permission_names = request.data.get('permissions', [])
        if not isinstance(permission_names, list):
            return Response({'error': 'Permissions must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        permissions = []
        for name in permission_names:
            try:
                permission = HsPermission.objects.get(name=name)
                permissions.append(permission)
            except HsPermission.DoesNotExist:
                return Response({'error': f'Permission {name} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        user.hspermission_set.set(permissions)
        logger.info(f"Permissions assigned to user: {user.mobile}")
        return Response({'message': 'Permissions assigned successfully'}, status=status.HTTP_200_OK)
        

@api_view(['GET'])
@custom_authentication_and_permissions()
def list_users(request):
    users = HsUser.objects.all()
    serializer = UserViewSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

