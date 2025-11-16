from django.urls import path
from . import views

urlpatterns = [
    path('offers/', views.offer_list, name='offer_list'),
    path('offers/<int:pk>/', views.offer_detail, name='offer_detail'),
    path('offer-images/<int:pk>/', views.offer_image_list, name='offer_image_list'),
    path('assign/', views.assign_offers, name='assign_offers'),
]