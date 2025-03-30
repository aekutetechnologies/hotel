from django.db import models
from django.utils import timezone
from users.models import HsUser

BED_TYPE_CHOICES = [
    ('single', 'Single'),
    ('double', 'Double'),
    ('queen', 'Queen'),
    ('king', 'King'),
    ('twin', 'Twin'),
    ('double_twin', 'Double Twin'),
    ('bunk', 'Bunk'),
    ('sofa', 'Sofa'),
    ('sofa_bed', 'Sofa Bed'),
]

class City(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Country(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class State(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Amenity(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Rule(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Documentation(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class PropertyImage(models.Model):
    image = models.ImageField(upload_to='property_images/')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Image ID: {self.id}"

class RoomImage(models.Model):
    image = models.ImageField(upload_to='room_images/')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Room Image ID: {self.id}"

class Room(models.Model):
    name = models.CharField(max_length=255)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monthly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    bed_type = models.CharField(max_length=255, null=True, blank=True, choices=BED_TYPE_CHOICES)
    private_bathroom = models.BooleanField(default=False)
    smoking = models.BooleanField(default=False)
    security_deposit = models.BooleanField(default=False)
    size = models.CharField(max_length=50, null=True, blank=True)
    maxoccupancy = models.IntegerField(default=2)
    number_of_rooms = models.IntegerField(default=1)
    used_number_of_rooms = models.IntegerField(default=0)
    left_number_of_rooms = models.IntegerField(default=1)
    amenities = models.ManyToManyField(Amenity, blank=True)
    images = models.ManyToManyField(RoomImage, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Property(models.Model):
    PROPERTY_TYPE_CHOICES = [
        ('hotel', 'Hotel'),
        ('hostel', 'Hostel'),
    ]
    name = models.CharField(max_length=255)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES, default='hotel')
    description = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=255)
    city = models.ForeignKey(City, on_delete=models.CASCADE, null=True, blank=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, null=True, blank=True)
    state = models.ForeignKey(State, on_delete=models.CASCADE, null=True, blank=True)
    area = models.CharField(max_length=255, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    images = models.ManyToManyField(PropertyImage, blank=True, related_name='properties')
    discount = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    amenities = models.ManyToManyField(Amenity, blank=True)
    rooms = models.ManyToManyField(Room, blank=True)
    rules = models.ManyToManyField(Rule, blank=True)
    documentation = models.ManyToManyField(Documentation, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Review(models.Model):
    user = models.ForeignKey(HsUser, on_delete=models.CASCADE)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=0)
    detail = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Review by {self.user.mobile} on {self.property.name}"

class Reply(models.Model):
    user = models.ForeignKey(HsUser, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE)
    detail = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Reply by {self.user.mobile} on {self.review}"


class FavoriteProperty(models.Model):
    user = models.ForeignKey(HsUser, on_delete=models.CASCADE)
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.mobile} - {self.property.name}"
