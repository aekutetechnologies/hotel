# Generated by Django 5.1.5 on 2025-02-04 15:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='OfferImage',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('image', models.ImageField(blank=True, null=True, upload_to='offer_images/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Offer',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('offer_type', models.CharField(max_length=255)),
                ('offer_amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('offer_status', models.CharField(max_length=255)),
                ('offer_start_date', models.DateTimeField()),
                ('offer_end_date', models.DateTimeField()),
                ('offer_date', models.DateTimeField(auto_now_add=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('offer_image', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='offer.offerimage')),
            ],
        ),
    ]
