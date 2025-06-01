import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from property.models import Rule

rules = [
    # Check-in/Check-out Rules
    'Check-in time: 2:00 PM - 11:00 PM',
    'Check-out time: 11:00 AM',
    'Early check-in subject to availability (additional charges may apply)',
    'Late check-out subject to availability (additional charges may apply)',
    'Express check-in/check-out available',
    
    # Identification & Registration
    'Valid government-issued photo ID required at check-in',
    'All guests must be registered at the front desk',
    'Guests under 18 must be accompanied by an adult',
    'Minimum check-in age: 18 years',
    
    # Payment Rules
    'Payment must be made at the time of check-in',
    'Credit card required for incidental charges',
    'Security deposit required (refundable)',
    'Cash payments accepted',
    'Foreign currency not accepted',
    
    # Smoking Policy
    'Strictly no smoking in rooms',
    'Smoking allowed only in designated areas',
    'Smoking fine: ₹5000 for room smoking',
    'Completely smoke-free property',
    
    # Pet Policy
    'Pets are not allowed',
    'Pet-friendly rooms available (additional charges apply)',
    'Guide dogs and service animals welcome',
    'Pet deposit required: ₹2000',
    'Maximum 2 pets per room',
    
    # Noise & Conduct Rules
    'Quiet hours: 10:00 PM - 7:00 AM',
    'No loud music or noise in rooms',
    'Respectful behavior expected at all times',
    'No parties or events in rooms',
    'Common areas close at midnight',
    
    # Guest & Visitor Policy
    'Visitors must be registered at front desk',
    'Visitors not allowed after 10:00 PM',
    'Maximum occupancy as per room type',
    'Additional guests subject to extra charges',
    'Day visitors allowed until 6:00 PM only',
    
    # Safety & Security
    'Room keys must be returned at check-out',
    'Lost key charges: ₹500',
    'CCTV surveillance in common areas',
    'Valuables should be kept in room safe',
    'Emergency contact information required',
    
    # Food & Beverage
    'Outside food and beverages not allowed in restaurant areas',
    'Room service available 24/7',
    'Cooking not allowed in rooms (except designated kitchenette rooms)',
    'Alcohol consumption only in designated areas',
    'Complimentary breakfast timing: 7:00 AM - 10:00 AM',
    
    # Parking Rules
    'Parking available on first-come, first-served basis',
    'Valet parking available (additional charges)',
    'Vehicle registration required',
    'Property not responsible for vehicle damage/theft',
    'Electric vehicle charging available',
    
    # Cancellation Policy
    'Free cancellation up to 24 hours before check-in',
    'No-show charges: 100% of first night',
    'Group bookings: 72 hours cancellation notice required',
    'Peak season: 7 days cancellation notice required',
    'Refunds processed within 7-10 business days',
    
    # Property Amenities Usage
    'Pool hours: 6:00 AM - 10:00 PM',
    'Gym access: 5:00 AM - 11:00 PM',
    'Spa services by appointment only',
    'Wi-Fi password available at front desk',
    'Laundry service available (charges apply)',
    
    # Damage & Liability
    'Guests liable for any damage to property',
    'Damage assessment charges as applicable',
    'Property not liable for personal belongings',
    'Insurance recommended for valuable items',
    'Report any damages immediately to front desk',
    
    # Special Policies
    'Children under 5 stay free (existing bedding)',
    'Extra bed charges: ₹1000 per night',
    'Honeymoon packages available',
    'Corporate rates available for business travelers',
    'Group discounts for 10+ rooms',
    
    # Housekeeping
    'Daily housekeeping service provided',
    'Do not disturb sign will be respected',
    'Housekeeping hours: 8:00 AM - 6:00 PM',
    'Extra towels and amenities available on request',
    'Eco-friendly option: Skip housekeeping for rewards',
    
    # Technology & Connectivity
    'Free Wi-Fi in all areas',
    'Device charging stations available',
    'Technical support available 24/7',
    'Smart TV with streaming services',
    'Business center access included',
    
    # Health & Hygiene
    'Face masks required in common areas',
    'Hand sanitizing stations available',
    'Regular sanitization of common areas',
    'Health declaration may be required',
    'Contactless services available',
    
    # Hostel-Specific Rules
    'Shared dormitory quiet hours strictly enforced',
    'Personal belongings must be secured in lockers',
    'Common kitchen hours: 6:00 AM - 11:00 PM',
    'Bathroom sharing etiquette must be followed',
    'Social areas available for interaction',
    'Bed linens changed every 3 days',
    'Maximum stay in dormitory: 30 days',
    'Backpacker discounts available',
    'Youth hostel membership benefits applicable',
    'Common room activities scheduled daily'
]

# Add rules to database
for rule_name in rules:
    rule, created = Rule.objects.get_or_create(name=rule_name)
    if created:
        print(f"Added rule: {rule_name}")
    else:
        print(f"Rule already exists: {rule_name}")

print(f"\nScript completed. Total rules processed: {len(rules)}")
