from django.contrib import admin

# Register your models here.

from .models import *

admin.site.register(Property)
admin.site.register(Room)
admin.site.register(Amenity)
admin.site.register(Rule)
admin.site.register(Documentation)
admin.site.register(Review)
admin.site.register(Reply)
admin.site.register(PropertyImage)
admin.site.register(City)
admin.site.register(State)
admin.site.register(Country)
admin.site.register(FavoriteProperty)