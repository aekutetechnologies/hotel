# Generated by Django 5.1.5 on 2025-04-15 06:13

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('property', '0017_rename_detail_review_review_review_booking_id'),
        ('users', '0009_alter_hsuser_user_role'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProperty',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='property.property')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.hsuser')),
            ],
        ),
    ]
