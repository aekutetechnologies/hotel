# Generated by Django 5.1.5 on 2025-04-10 07:13

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0007_booking_checkin_time_booking_checkout_time'),
        ('property', '0016_reviewimage_alter_amenity_id_alter_city_id_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='BookingReview',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('booking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='booking.booking')),
                ('review', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='property.review')),
            ],
        ),
    ]
