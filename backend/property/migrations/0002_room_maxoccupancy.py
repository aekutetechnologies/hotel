# Generated by Django 5.1.5 on 2025-01-16 10:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('property', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='maxoccupancy',
            field=models.IntegerField(default=2),
        ),
    ]
