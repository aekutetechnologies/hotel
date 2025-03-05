from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('property/', include('property.urls')),
    path('booking/', include('booking.urls')),
    path('expenses/', include('expenses.urls')),
    path('offers/', include('offer.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

