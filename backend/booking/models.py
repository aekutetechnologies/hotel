from django.db import models
from django.utils import timezone
from users.models import HsUser
from property.models import Property, Room

class Booking(models.Model):
    BOOKING_TYPE_CHOICES = [
        ('walkin', 'Walkin'),
        ('online', 'Online'),
        ('makemytrip', 'Makemytrip'),
        ('tripadvisor', 'Tripadvisor'),
        ('expedia', 'Expedia'),
        ('agoda', 'Agoda'),
        ('bookingcom', 'Booking.com'),
        ('airbnb', 'Airbnb'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('checked_in', 'Checked In'),
        ('checked_out', 'Checked Out'),
        ('no_show', 'No Show'),
    ]
    PAYMENT_TYPE_CHOICES = [
        ('card', 'Card'),
        ('cash', 'Cash'),
        ('upi', 'UPI'),
    ]
    user = models.ForeignKey(HsUser, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True, blank=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPE_CHOICES, default='walkin')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='upi')
    checkin_date = models.DateField()
    checkout_date = models.DateField()
    documents = models.JSONField(null=True, blank=True)
    room_no = models.CharField(max_length=50, null=True, blank=True)
    number_of_guests = models.IntegerField(default=1)
    number_of_rooms = models.IntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Booking {self.id} by {self.user.mobile}"


class BookingDocument(models.Model):
    id = models.AutoField(primary_key=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    document = models.FileField(upload_to='booking_documents/')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Booking Document {self.id} for Booking {self.booking.id}"