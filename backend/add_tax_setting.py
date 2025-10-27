import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from property.models import Setting

def add_tax_setting():
    """Add default tax rate setting"""
    
    tax_setting, created = Setting.objects.get_or_create(
        key='tax_rate',
        defaults={
            'value': '0.18',
            'description': 'Tax rate for bookings (decimal format, e.g., 0.18 for 18%)',
            'is_active': True
        }
    )
    
    if created:
        print(f"✓ Added tax rate setting: {tax_setting.key} = {tax_setting.value}")
    else:
        print(f"→ Tax rate setting already exists: {tax_setting.key} = {tax_setting.value}")
    
    return tax_setting

if __name__ == "__main__":
    try:
        add_tax_setting()
        print("✓ Tax setting added successfully!")
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
