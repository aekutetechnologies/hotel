from django.urls import path
from . import views

urlpatterns = [
    path('send-otp/', views.send_otp, name='send-otp'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('profile/', views.profile, name='profile'),
    path('profile/<int:user_id>/', views.admin_profile, name='admin-profile'),
    path('profile/assign-permissions/', views.assign_group_permission_to_user, name='assign-group-permission-to-user'),
    path('users/', views.list_users, name='list-users'),
    path('permissions/', views.list_permissions, name='list-permissions'),
    path('permissions/group/<int:id>/', views.view_group_permissions, name='view-group-permissions'),
    path('permissions/group/', views.list_group_permissions, name='list-group-permissions'),

]
