from django.contrib import admin

# Register your models here.

from .models import *

admin.site.register(HsUser)
admin.site.register(UserSession)
admin.site.register(HsPermission)
admin.site.register(UserHsPermission)
admin.site.register(HsPermissionGroup)
