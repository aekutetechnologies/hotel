from django.urls import path
from . import views

urlpatterns = [
    path('amenities/', views.amenity_list, name='amenity-list'),
    path('amenities/<int:pk>/', views.amenity_detail, name='amenity-detail'),
    path('rules/', views.rule_list, name='rule-list'),
    path('rules/<int:pk>/', views.rule_detail, name='rule-detail'),
    path('documentations/', views.documentation_list, name='documentation-list'),
    path('documentations/<int:pk>/', views.documentation_detail, name='documentation-detail'),
    path('rooms/', views.room_list, name='room-list'),
    path('rooms/<int:pk>/', views.room_detail, name='room-detail'),
    path('properties/', views.property_list, name='property-list'),
    path('properties/<int:pk>/', views.property_detail, name='property-detail'),
    path('reviews/', views.review_list, name='review-list'),
    path('reviews/<int:pk>/', views.review_detail, name='review-detail'),
    path('replies/', views.reply_list, name='reply-list'),
    path('replies/<int:pk>/', views.reply_detail, name='reply-detail'),
    path('images/upload/', views.image_upload, name='image-upload'),
    path('images/<int:pk>/', views.image_detail, name='image-detail'),
    path('room/images/upload/', views.room_image_upload, name='room-image-upload'),
    path('search/<str:location>/', views.search_properties_by_location, name='search-properties-by-location'),
    path('public/search/', views.public_search_properties, name='public-search-properties'),
    path('city/', views.list_cities, name='list-cities'),
    path('country/', views.list_countries, name='list-countries'),
    path('state/', views.list_states, name='list-states'),
    path('areas/<str:city_name>/', views.unique_areas_by_city, name='unique-areas-by-city'),
    path('toggle-favourite/', views.add_favorite_property, name='add-favorite-property'),
    path('favorite-properties/', views.get_favorite_properties, name='get-favorite-properties'),
]

