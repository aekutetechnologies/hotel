# Generated by Django 5.1.5 on 2025-01-15 15:01

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('property', '0001_initial'),
        ('users', '0003_hspermission'),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('discount', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('booking_type', models.CharField(choices=[('hotel', 'Hotel'), ('room', 'Room')], default='hotel', max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled'), ('completed', 'Completed')], default='pending', max_length=20)),
                ('payment_type', models.CharField(choices=[('card', 'Card'), ('cash', 'Cash'), ('upi', 'UPI')], default='upi', max_length=20)),
                ('checkin_date', models.DateField()),
                ('checkout_date', models.DateField()),
                ('documents', models.JSONField(blank=True, null=True)),
                ('room_no', models.CharField(blank=True, max_length=50, null=True)),
                ('number_of_guests', models.IntegerField(default=1)),
                ('number_of_rooms', models.IntegerField(default=1)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('property', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='property.property')),
                ('room', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='property.room')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.hsuser')),
            ],
        ),
    ]
