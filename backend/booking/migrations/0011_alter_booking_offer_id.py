# Generated by Django 5.1.5 on 2025-04-12 18:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0010_booking_offer_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='offer_id',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
    ]
