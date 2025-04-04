from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/property/', include('property.urls')),
    path('api/booking/', include('booking.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/offers/', include('offer.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

