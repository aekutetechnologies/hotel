import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from property.models import Documentation

documents = [
    # Government Issued Photo IDs
    'Aadhar Card',
    'PAN Card',
    'Driving License',
    'Voter ID Card',
    'Passport',
    'Government Employee ID',
    'Military ID',
    'Police ID'
]

# Add documentation requirements to database
for doc_name in documents:
    document, created = Documentation.objects.get_or_create(name=doc_name)
    if created:
        print(f"Added documentation: {doc_name}")
    else:
        print(f"Documentation already exists: {doc_name}")

print(f"\nScript completed. Total documentation types processed: {len(documents)}")
