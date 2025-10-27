import os
import django
from django.utils import timezone

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from property.models import City, State

def add_states_and_union_territories():
    """Add states and union territories to the database."""
    
    # List of states
    states = [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal"
    ]
    
    # List of union territories
    union_territories = [
        "Andaman and Nicobar Islands",
        "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi",
        "Jammu and Kashmir",
        "Ladakh",
        "Lakshadweep",
        "Puducherry"
    ]
    
    # Combine states and union territories
    all_states = states + union_territories
    
    added_count = 0
    existing_count = 0
    
    print(f"\nAdding states and union territories...")
    print(f"{'='*60}")
    
    for state_name in all_states:
        state, created = State.objects.get_or_create(name=state_name)
        
        if created:
            state.created_at = timezone.now()
            state.updated_at = timezone.now()
            state.save()
            print(f"✓ Added state: {state_name}")
            added_count += 1
        else:
            print(f"→ Already exists: {state_name}")
            existing_count += 1
    
    print(f"{'='*60}")
    print(f"Total states processed: {len(all_states)}")
    print(f"Added: {added_count}")
    print(f"Already existed: {existing_count}")
    print(f"{'='*60}\n")
    
    return added_count, existing_count

if __name__ == "__main__":
    try:
        add_states_and_union_territories()
        print("✓ States and union territories added successfully!")
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
