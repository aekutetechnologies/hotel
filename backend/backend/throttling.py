"""
Custom throttling classes for Django REST Framework
"""
import re
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class ReadOnlyExemptThrottle(UserRateThrottle):
    """
    Throttle class that exempts GET requests to read-only endpoints from throttling.
    This allows form initialization to make multiple GET requests without hitting rate limits.
    """
    
    # Paths that should be exempt from throttling for GET requests
    EXEMPT_GET_PATHS = [
        r'^/api/property/amenities/?$',
        r'^/api/property/rules/?$',
        r'^/api/property/documentations/?$',
        r'^/api/property/image-categories/?$',
        r'^/api/property/state/?$',
        r'^/api/property/city/?$',
        r'^/api/property/country/?$',
        r'^/api/property/properties/?$',
        r'^/api/property/properties/\d+/?$',
        r'^/api/property/all-properties/?$',
        r'^/api/stats/dashboard/?$',
        r'^/api/stats/property-occupancy/?$',
        r'^/api/stats/sales/?$',
        r'^/api/stats/expenses/?$',
        r'^/api/stats/users/?$',
    ]
    
    def allow_request(self, request, view):
        # If it's a GET request to an exempt path, allow it without throttling
        if request.method == 'GET':
            for pattern in self.EXEMPT_GET_PATHS:
                if re.match(pattern, request.path):
                    return True
        
        # Otherwise, use the default throttling behavior
        return super().allow_request(request, view)


class ReadOnlyExemptAnonThrottle(AnonRateThrottle):
    """
    Throttle class for anonymous users that exempts GET requests to read-only endpoints.
    """
    
    # Paths that should be exempt from throttling for GET requests
    EXEMPT_GET_PATHS = [
        r'^/api/property/amenities/?$',
        r'^/api/property/rules/?$',
        r'^/api/property/documentations/?$',
        r'^/api/property/image-categories/?$',
        r'^/api/property/state/?$',
        r'^/api/property/city/?$',
        r'^/api/property/country/?$',
        r'^/api/property/properties/?$',
        r'^/api/property/properties/\d+/?$',
        r'^/api/property/all-properties/?$',
        r'^/api/stats/dashboard/?$',
        r'^/api/stats/property-occupancy/?$',
        r'^/api/stats/sales/?$',
        r'^/api/stats/expenses/?$',
        r'^/api/stats/users/?$',
    ]
    
    def allow_request(self, request, view):
        # If it's a GET request to an exempt path, allow it without throttling
        if request.method == 'GET':
            for pattern in self.EXEMPT_GET_PATHS:
                if re.match(pattern, request.path):
                    return True
        
        # Otherwise, use the default throttling behavior
        return super().allow_request(request, view)
