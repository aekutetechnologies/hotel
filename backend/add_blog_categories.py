import os
import django
from django.utils import timezone

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from blog.models import BlogCategory

def add_default_blog_categories():
    """Add default blog categories (Hotels and Hostels) to the database."""
    
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
    
    added_count = 0
    existing_count = 0
    
    print(f"\nAdding default blog categories...")
    print(f"{'='*60}")
    
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
            category.created_at = timezone.now()
            category.updated_at = timezone.now()
            category.save()
            print(f"✓ Added category: {category_data['name']}")
            added_count += 1
        else:
            print(f"→ Already exists: {category_data['name']}")
            existing_count += 1
    
    print(f"{'='*60}")
    print(f"Total categories processed: {len(default_categories)}")
    print(f"Added: {added_count}")
    print(f"Already existed: {existing_count}")
    
    return added_count > 0


if __name__ == "__main__":
    success = add_default_blog_categories()
    if success:
        print("\n✓ Blog categories initialization completed successfully!")
    else:
        print("\n→ All blog categories already exist in the database.")

