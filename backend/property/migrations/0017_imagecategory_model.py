from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


def seed_image_categories(apps, schema_editor):
    ImageCategory = apps.get_model('property', 'ImageCategory')
    PropertyImage = apps.get_model('property', 'PropertyImage')

    default_categories = [
        ('room', 'Room'),
        ('bathroom', 'Bathroom'),
        ('waiting-room', 'Waiting Room'),
        ('facade', 'Facade'),
        ('parking', 'Parking'),
        ('lobby', 'Lobby'),
        ('dining', 'Dining'),
        ('exterior', 'Exterior'),
        ('other', 'Other'),
    ]

    created_categories = {}
    for code, name in default_categories:
        category, _ = ImageCategory.objects.get_or_create(
            code=code,
            defaults={'name': name}
        )
        created_categories[code] = category

    fallback_category = created_categories.get('other')
    if fallback_category:
        PropertyImage.objects.filter(category__isnull=True).update(category=fallback_category)


def unseed_image_categories(apps, schema_editor):
    ImageCategory = apps.get_model('property', 'ImageCategory')
    ImageCategory.objects.filter(code__in=[
        'room',
        'bathroom',
        'waiting-room',
        'facade',
        'parking',
        'lobby',
        'dining',
        'exterior',
        'other',
    ]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('property', '0016_reviewimage_alter_amenity_id_alter_city_id_and_more'),
    ]

    operations = [
        # migrations.CreateModel(
        #     name='ImageCategory',
        #     fields=[
        #         ('id', models.AutoField(primary_key=True, serialize=False)),
        #         ('name', models.CharField(max_length=255, unique=True)),
        #         ('code', models.SlugField(max_length=50, unique=True)),
        #         ('description', models.TextField(blank=True, null=True)),
        #         ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
        #         ('updated_at', models.DateTimeField(auto_now=True)),
        #         ('is_active', models.BooleanField(default=True)),
        #     ],
        #     options={
        #         'ordering': ['name'],
        #     },
        # ),
        migrations.RemoveField(
            model_name='propertyimage',
            name='category',
        ),
        migrations.AddField(
            model_name='propertyimage',
            name='category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='property_images', to='property.imagecategory'),
        ),
        migrations.RunPython(seed_image_categories, reverse_code=unseed_image_categories),
    ]

