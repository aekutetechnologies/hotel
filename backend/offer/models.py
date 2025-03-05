from django.db import models

# Create your models here.

from property.models import Property

class Offer(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(default="")
    discount_percentage = models.DecimalField(max_digits=10, decimal_places=2)
    offer_start_date = models.DateTimeField()
    offer_end_date = models.DateTimeField()
    code = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title}"



class OfferImage(models.Model):
    id = models.AutoField(primary_key=True)
    offer = models.ForeignKey('Offer', on_delete=models.CASCADE, blank=True, null=True)
    image = models.ImageField(upload_to='offer_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.offer.title} - {self.image}"
    

class PropertyOffer(models.Model):
    id = models.AutoField(primary_key=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, blank=True, null=True)
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.property.name} - {self.offer.title}"
