# Generated by Django 5.1.5 on 2025-04-10 11:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('property', '0016_reviewimage_alter_amenity_id_alter_city_id_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='review',
            old_name='detail',
            new_name='review',
        ),
        migrations.AddField(
            model_name='review',
            name='booking_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
