from django.db import models
from django.utils import timezone
from users.models import HsUser
from property.models import Property, Room
from decimal import Decimal
from django.core.exceptions import ValidationError
from datetime import datetime
from property.models import Review, ReviewImage


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

    BOOKING_TIME_CHOICES = [
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
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
    checkin_date = models.DateField(null=True, blank=True)
    checkout_date = models.DateField(null=True, blank=True)
    checkin_time = models.TimeField(null=True, blank=True)
    checkout_time = models.TimeField(null=True, blank=True)
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPE_CHOICES, default='walkin')
    booking_time = models.CharField(max_length=20, choices=BOOKING_TIME_CHOICES, default='daily')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='upi')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    offer_id = models.IntegerField(null=True, blank=True, default=0)
    documents = models.JSONField(null=True, blank=True)
    room_no = models.CharField(max_length=50, null=True, blank=True)
    number_of_guests = models.IntegerField(default=1)
    number_of_rooms = models.IntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    booking_room_types = models.JSONField(null=True, blank=True)
    is_review_created = models.BooleanField(default=False)
    review_id = models.CharField(max_length=255, null=True, blank=True)

    def clean(self):
        if self.booking_type == 'hourly' and not self.room.hourly_rate:
            raise ValidationError("This room does not support hourly bookings.")
        if self.booking_type == 'daily' and not self.room.daily_rate:
            raise ValidationError("This room does not support daily bookings.")

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
        

class BookingReview(models.Model):
    id = models.AutoField(primary_key=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)


class HostelVisit(models.Model):
    """Model for hostel visit bookings (pre-visit before actual booking)"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('converted_to_booking', 'Converted to Booking'),
    ]
    
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(HsUser, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=255, blank=True)  # Name of the visitor
    phone = models.CharField(max_length=20, blank=True)  # Phone number of the visitor
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    visit_date = models.DateField()
    visit_time = models.TimeField()
    number_of_guests = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(null=True, blank=True)
    converted_booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='visit')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-visit_date', '-visit_time']
        indexes = [
            models.Index(fields=['-visit_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Visit {self.id} - {self.property.name} on {self.visit_date}"