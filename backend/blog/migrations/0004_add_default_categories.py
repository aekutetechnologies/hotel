# Generated migration to add default blog categories

from django.db import migrations


def add_default_categories(apps, schema_editor):
    """Add default 'hotels' and 'hostels' categories."""
    BlogCategory = apps.get_model('blog', 'BlogCategory')
    
    default_categories = [
        {
            'name': 'Hotels',
            'slug': 'hotels',
            'description': 'Blog posts related to hotels and hotel stays'
        },
        {
            'name': 'Hostels',
            'slug': 'hostels',
            'description': 'Blog posts related to hostels and hostel stays'
        }
    ]
    
    for category_data in default_categories:
        category, created = BlogCategory.objects.get_or_create(
            slug=category_data['slug'],
            defaults={
                'name': category_data['name'],
                'description': category_data['description'],
                'is_active': True
            }
        )
        if created:
            print(f"Created default category: {category_data['name']}")
        else:
            print(f"Category already exists: {category_data['name']}")


def remove_default_categories(apps, schema_editor):
    """Remove default categories (reverse migration)."""
    BlogCategory = apps.get_model('blog', 'BlogCategory')
    
    BlogCategory.objects.filter(slug__in=['hotels', 'hostels']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0003_remove_blog_excerpt_remove_blog_meta_description'),
    ]

    operations = [
        migrations.RunPython(add_default_categories, remove_default_categories),
    ]

