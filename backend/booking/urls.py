from django.urls import path
from . import views

urlpatterns = [
    path('bookings/', views.booking_list, name='booking-list'),
    path('bookings/<int:pk>/', views.booking_detail, name='booking-detail'),
    path('bookings/user/', views.booking_list_by_user, name='booking-list-by-user'),
    path('bookings/user/<int:user_id>/', views.booking_list_by_user_id, name='booking-list-by-user-id'),
    path('bookings/<int:pk>/status/', views.update_booking_status, name='update-booking-status'),
    path('bookings/<int:pk>/documents/', views.upload_booking_document, name='upload-booking-document'),
    path('bookings/documents/<int:pk>/', views.booking_document_view, name='booking-document-view'),
]
