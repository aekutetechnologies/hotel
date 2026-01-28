"""
Custom middleware for rate limiting and security
"""
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import time


class RateLimitMiddleware(MiddlewareMixin):
    """
    Rate limiting middleware to prevent DDoS attacks
    """
    def process_request(self, request):
        # Skip rate limiting for certain paths
        skip_paths = ['/admin/', '/static/', '/media/']
        if any(request.path.startswith(path) for path in skip_paths):
            return None

        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        # Rate limit configuration based on environment
        # Optimized for 5000+ DAU: allows normal usage while preventing abuse
        if settings.APP_ENV == 'PROD':
            max_requests = 500  # requests per minute (allows rapid interactions, form submissions, etc.)
            window = 60  # seconds
        else:
            max_requests = 2000  # requests per minute (more lenient in development)
            window = 60  # seconds

        # Create cache key
        cache_key = f'ratelimit:{ip}:{int(time.time() / window)}'
        
        # Get current request count
        current_requests = cache.get(cache_key, 0)
        
        if current_requests >= max_requests:
            return JsonResponse(
                {
                    'error': 'Rate limit exceeded. Please try again later.',
                    'detail': f'Maximum {max_requests} requests per {window} seconds allowed.'
                },
                status=429
            )
        
        # Increment counter
        cache.set(cache_key, current_requests + 1, window)
        
        return None


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Add additional security headers
    """
    def process_response(self, request, response):
        # Content Security Policy
        if settings.APP_ENV == 'PROD':
            csp = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self'; "
                "frame-ancestors 'none';"
            )
            response['Content-Security-Policy'] = csp
        
        # Additional security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = settings.SECURE_REFERRER_POLICY
        
        # Remove server header (security through obscurity)
        if 'Server' in response:
            del response['Server']
        
        return response
