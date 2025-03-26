from django.db import models
from django.utils import timezone
from users.models import HsUser
from property.models import Property, Room
from decimal import Decimal
from django.core.exceptions import ValidationError
from datetime import datetime
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
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPE_CHOICES, default='walkin')
    booking_time = models.CharField(max_length=20, choices=BOOKING_TIME_CHOICES, default='daily')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='upi')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    documents = models.JSONField(null=True, blank=True)
    room_no = models.CharField(max_length=50, null=True, blank=True)
    number_of_guests = models.IntegerField(default=1)
    number_of_rooms = models.IntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        calculated_price = Decimal('0.00')

        if self.room:
            if self.booking_type == 'hourly':
                if not self.room.hourly_rate:
                    raise ValueError("Hourly rate not available for this room.")
                delta = self.checkout_date - self.checkin_date
                total_hours = delta.total_seconds() / 3600
                calculated_price = Decimal(total_hours) * self.room.hourly_rate
            else:
                # if self.checking_date and self.checkout_date are string, convert them to date
                if isinstance(self.checkin_date, str):
                    self.checkin_date = datetime.strptime(self.checkin_date, '%Y-%m-%d').date()
                if isinstance(self.checkout_date, str):
                    self.checkout_date = datetime.strptime(self.checkout_date, '%Y-%m-%d').date()
                delta_days = (self.checkout_date - self.checkin_date).days
                if delta_days < 0:
                    raise ValueError("Checkout date cannot be before check-in date.")
                calculated_price = Decimal(delta_days) * self.room.daily_rate

            if self.discount is not None:
                calculated_price -= calculated_price * (self.discount / Decimal('100.00'))
        else:
            # Handle property-level bookings if needed
            pass

        self.price = calculated_price.quantize(Decimal('0.00'))
        super().save(*args, **kwargs)

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