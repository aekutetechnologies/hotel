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
    'Minimum check-in age: 18 years'
]

# Add rules to database
for rule_name in rules:
    rule, created = Rule.objects.get_or_create(name=rule_name)
    if created:
        print(f"Added rule: {rule_name}")
    else:
        print(f"Rule already exists: {rule_name}")

print(f"\nScript completed. Total rules processed: {len(rules)}")
