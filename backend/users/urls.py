from django.urls import path
from . import views

urlpatterns = [
    path('send-otp/', views.send_otp, name='send-otp'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('profile/', views.profile, name='profile'),
    path('profile/<int:user_id>/', views.admin_profile, name='admin-profile'),
    path('profile/<int:user_id>/assign-permissions/', views.assign_permissions, name='assign-permissions'),
    path('users/', views.list_users, name='list-users'),
    path('permissions/', views.manage_permissions, name='manage-permissions'),
    path('permissions/<int:pk>/', views.permission_detail, name='permission-detail'),
    path('permission-groups/', views.manage_permission_groups, name='manage-permission-groups'),
    path('permission-groups/<int:pk>/', views.permission_group_detail, name='permission-group-detail'),
    path('user-hs-permissions/', views.manage_user_hs_permissions, name='manage-user-hs-permissions'),
    path('user-hs-permissions/<int:pk>/', views.user_hs_permission_detail, name='user-hs-permission-detail'),
]
