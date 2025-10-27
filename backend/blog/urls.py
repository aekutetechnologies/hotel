from django.urls import path
from . import views

urlpatterns = [
    # Blog endpoints
    path('blogs/', views.blog_list, name='blog-list'),
    path('blogs/highlighted/', views.highlighted_blogs, name='highlighted-blogs'),
    path('blogs/<slug:slug>/', views.blog_detail, name='blog-detail'),
    path('blogs/<slug:slug>/related/', views.related_blogs, name='related-blogs'),
    
    # Category endpoints
    path('categories/', views.category_list, name='category-list'),
    path('categories/<int:pk>/', views.category_detail, name='category-detail'),
    
    # Tag endpoints
    path('tags/', views.tag_list, name='tag-list'),
    path('tags/<int:pk>/', views.tag_detail, name='tag-detail'),
    
    # Image endpoints
    path('images/upload/', views.image_upload, name='image-upload'),
    path('images/<int:pk>/', views.image_detail, name='image-detail'),
]

