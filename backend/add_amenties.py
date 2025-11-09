import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from property.models import Amenity

amenities = [
    # Specified amenities
    'Free Wi-Fi',
    'Swimming Pool',
    'Gym',
    'Spa',
    'Restaurant',
    'Bar',
    'Room Service',
    'Parking',
]

# Add amenities to database
for amenity_name in amenities:
    amenity, created = Amenity.objects.get_or_create(name=amenity_name)
    if created:
        print(f"Added amenity: {amenity_name}")
    else:
        print(f"Amenity already exists: {amenity_name}")

print(f"\nScript completed. Total amenities processed: {len(amenities)}")
