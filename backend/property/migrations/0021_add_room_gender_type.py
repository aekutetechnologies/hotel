# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('property', '0020_propertyimage_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='gender_type',
            field=models.CharField(blank=True, choices=[('unisex', 'Unisex'), ('male', 'Male'), ('female', 'Female')], max_length=10, null=True),
        ),
    ]

