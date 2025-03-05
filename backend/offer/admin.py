from django.contrib import admin

# Register your models here.

from .models import Offer, OfferImage, PropertyOffer

admin.site.register(Offer)
admin.site.register(OfferImage)
admin.site.register(PropertyOffer)
