# Generated manually

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0011_alter_booking_offer_id'),
        ('property', '0021_add_room_gender_type'),
           ('users', '0010_userdocument'),
    ]

    operations = [
        migrations.CreateModel(
            name='HostelVisit',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('visit_date', models.DateField()),
                ('visit_time', models.TimeField()),
                ('number_of_guests', models.IntegerField(default=1)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('completed', 'Completed'), ('cancelled', 'Cancelled'), ('converted_to_booking', 'Converted to Booking')], default='pending', max_length=20)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('converted_booking', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='visit', to='booking.booking')),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='property.property')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.hsuser')),
            ],
            options={
                'ordering': ['-visit_date', '-visit_time'],
                'indexes': [
                    models.Index(fields=['-visit_date'], name='booking_hos_visit_d_7b9c3e_idx'),
                    models.Index(fields=['status'], name='booking_hos_status_8f4d2a_idx'),
                ],
            },
        ),
    ]

