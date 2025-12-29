import jwt
import re
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from users.models import HsUser, UserHsPermission
from django.conf import settings
from jwt.exceptions import InvalidSignatureError, ExpiredSignatureError, DecodeError, InvalidTokenError

def custom_authentication_and_permissions(required_permissions=None, exempt_get_views=None):
    if exempt_get_views is None:
        exempt_get_views = []

    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Check if the current view is in the exempt list for GET requests
            if request.method == 'GET':
                for pattern in exempt_get_views:
                    if re.fullmatch(pattern, request.path):
                        return view_func(request, *args, **kwargs)

            auth = request.headers.get('Authorization')
            if not auth or not auth.startswith('Bearer '):
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth[7:]
            try:
                # Decode token with options to verify expiration
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'], options={"verify_exp": True})
                user_id = payload.get('user_id')
                if not user_id:
                    return Response({'error': 'Invalid token', 'detail': 'Token missing user_id'}, status=status.HTTP_401_UNAUTHORIZED)
                
                try:
                    user = HsUser.objects.get(id=user_id)
                    request.user = user
                except HsUser.DoesNotExist:
                    return Response({'error': 'Invalid user'}, status=status.HTTP_401_UNAUTHORIZED)
            except (InvalidSignatureError, ExpiredSignatureError, DecodeError, InvalidTokenError) as e:
                # Catch all JWT exceptions to prevent Simple JWT from being invoked
                return Response({'error': 'Invalid token', 'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
            except Exception as e:
                # Catch any other unexpected exceptions during token validation
                return Response({'error': 'Token validation failed', 'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check for required permissions
            if required_permissions:
                user_permissions = UserHsPermission.objects.filter(user=user).values_list('permission_group__permissions__name', flat=True)
                user_permissions_set = set(user_permissions)  # Convert to set for faster lookup
                
                for perm in required_permissions:
                    if perm not in user_permissions_set:
                        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
