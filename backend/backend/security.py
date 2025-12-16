"""
Custom security middleware and utilities for DDoS and malware protection.
"""
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import time
import hashlib
import re


class IPRateLimitMiddleware(MiddlewareMixin):
    """
    Middleware to rate limit requests per IP address to prevent DDoS attacks.
    """
    def process_request(self, request):
        # Skip rate limiting for certain paths
        exempt_paths = ['/api/admin/', '/static/', '/media/']
        if any(request.path.startswith(path) for path in exempt_paths):
            return None

        # Get client IP
        ip = self.get_client_ip(request)
        
        # Check rate limit
        cache_key = f'ratelimit:{ip}'
        request_count = cache.get(cache_key, 0)
        
        # Get rate limit from settings
        max_requests = getattr(settings, 'RATE_LIMIT_REQUESTS_PER_MINUTE', 60)
        
        if request_count >= max_requests:
            return JsonResponse(
                {'error': 'Rate limit exceeded. Please try again later.'},
                status=429
            )
        
        # Increment counter
        cache.set(cache_key, request_count + 1, 60)  # 60 seconds TTL
        
        return None

    def get_client_ip(self, request):
        """Get the real client IP address, handling proxies."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class RequestSizeMiddleware(MiddlewareMixin):
    """
    Middleware to limit request body size to prevent memory exhaustion attacks.
    """
    def process_request(self, request):
        if request.method in ['POST', 'PUT', 'PATCH']:
            content_length = request.META.get('CONTENT_LENGTH')
            if content_length:
                try:
                    content_length = int(content_length)
                    max_size = getattr(settings, 'DATA_UPLOAD_MAX_MEMORY_SIZE', 10485760)  # 10MB
                    if content_length > max_size:
                        return JsonResponse(
                            {'error': f'Request body too large. Maximum size is {max_size / 1024 / 1024}MB.'},
                            status=413
                        )
                except (ValueError, TypeError):
                    pass
        return None


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers to all responses.
    """
    def process_response(self, request, response):
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = getattr(settings, 'X_FRAME_OPTIONS', 'DENY')
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = getattr(settings, 'SECURE_REFERRER_POLICY', 'strict-origin-when-cross-origin')
        
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = f'max-age={getattr(settings, "SECURE_HSTS_SECONDS", 31536000)}; includeSubDomains; preload'
            response['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        
        return response


class MalwareDetectionMiddleware(MiddlewareMixin):
    """
    Middleware to detect and block potentially malicious requests.
    """
    # Common SQL injection patterns
    SQL_INJECTION_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)",
        r"(--|#|/\*|\*/|;|\||&)",
        r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
        r"(\b(OR|AND)\s+['\"]\w+['\"]\s*=\s*['\"]\w+['\"])",
    ]
    
    # Common XSS patterns
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe[^>]*>",
        r"<object[^>]*>",
        r"<embed[^>]*>",
    ]
    
    # Path traversal patterns
    PATH_TRAVERSAL_PATTERNS = [
        r"\.\./",
        r"\.\.\\",
        r"%2e%2e%2f",
        r"%2e%2e%5c",
    ]

    def process_request(self, request):
        # Check GET parameters
        for key, value in request.GET.items():
            if self.is_malicious(str(value)):
                return JsonResponse(
                    {'error': 'Potentially malicious request detected.'},
                    status=400
                )
        
        # Check POST data
        if request.method in ['POST', 'PUT', 'PATCH']:
            if hasattr(request, 'body'):
                body_str = request.body.decode('utf-8', errors='ignore')
                if self.is_malicious(body_str):
                    return JsonResponse(
                        {'error': 'Potentially malicious request detected.'},
                        status=400
                    )
        
        # Check URL path
        if self.is_malicious(request.path):
            return JsonResponse(
                {'error': 'Potentially malicious request detected.'},
                status=400
            )
        
        return None

    def is_malicious(self, value):
        """Check if a value contains malicious patterns."""
        if not value:
            return False
        
        value_lower = value.lower()
        
        # Check SQL injection patterns
        for pattern in self.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE):
                return True
        
        # Check XSS patterns
        for pattern in self.XSS_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE):
                return True
        
        # Check path traversal patterns
        for pattern in self.PATH_TRAVERSAL_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE):
                return True
        
        return False
