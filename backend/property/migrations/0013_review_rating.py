# Generated by Django 5.1.5 on 2025-02-06 13:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('property', '0012_room_discount'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='rating',
            field=models.IntegerField(default=0),
        ),
    ]
