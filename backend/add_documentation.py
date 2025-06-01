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
    'Police ID',
    
    # Other Valid IDs
    'College/University ID Card',
    'Corporate Employee ID',
    'Press ID Card',
    'Senior Citizen Card',
    'Disabled Person ID',
    
    # International Documents
    'Foreign Passport',
    'Visa',
    'Residence Permit',
    'Work Permit',
    'Student Visa',
    'Tourist Visa',
    'Diplomatic ID',
    'International Driving License',
    
    # Alternative Identity Proofs
    'Birth Certificate',
    'Marriage Certificate',
    'Income Certificate',
    'Domicile Certificate',
    'Caste Certificate',
    'Employment Letter',
    'Bank Statement',
    'Utility Bill (as address proof)',
    'Rental Agreement',
    'Property Documents',
    
    # Digital Documents
    'Digital Aadhar (e-Aadhar)',
    'Digital Driving License',
    'Digital PAN Card',
    'Mobile Wallet KYC',
    'Bank App Screenshot',
    'Digital Voter ID',
    
    # Business Travel Documents
    'Company Authorization Letter',
    'Business Card',
    'GST Certificate',
    'Business License',
    'Corporate Credit Card',
    'Purchase Order',
    'Travel Authorization',
    'Expense Report Form',
    
    # Student Documents
    'Student ID Card',
    'School/College Admission Letter',
    'Scholarship Certificate',
    'Hostel Allotment Letter',
    'Parent/Guardian ID',
    'Fee Payment Receipt',
    'Educational Certificate',
    
    # Medical/Emergency Documents
    'Medical Insurance Card',
    'Emergency Contact Details',
    'Medical Prescription (if required)',
    'Blood Group Certificate',
    'Medical Fitness Certificate',
    'Vaccination Certificate',
    'Health Insurance Policy',
    
    # Special Categories
    'Senior Citizen Proof (for discounts)',
    'Disabled Person Certificate',
    'Freedom Fighter Card',
    'Ex-Serviceman Card',
    'Journalist ID',
    'Lawyer Bar Council ID',
    'Doctor Medical Council ID',
    
    # Address Proofs
    'Electricity Bill',
    'Water Bill',
    'Gas Connection Bill',
    'Internet/Broadband Bill',
    'Mobile Phone Bill',
    'Bank Passbook',
    'Post Office Savings Account',
    'Insurance Policy',
    'Property Tax Receipt',
    'House Rent Receipt',
    
    # Additional Requirements
    'Reference Letter',
    'Character Certificate',
    'Police Verification Certificate',
    'Local Guardian Details',
    'Previous Stay Receipt',
    'Credit Report',
    'Income Tax Return',
    'Salary Slip',
    
    # Group/Event Documentation
    'Group Leader ID',
    'Event Registration Certificate',
    'Conference/Seminar Invitation',
    'Wedding Invitation',
    'Family Photo',
    'Group Authorization Letter',
    
    # Digital Age Documents
    'QR Code Based ID',
    'Blockchain Verified Certificate',
    'Digital Signature Certificate',
    'Online KYC Verification',
    'Biometric Verification',
    'OTP Verification',
    'App-based Check-in',
    
    # Backup Documents
    'Photo ID Xerox Copy',
    'Self-Attested Copies',
    'Notarized Documents',
    'Witnessed Documents',
    'Embassy Verified Documents',
    'Court Verified Documents',
    
    # Regional Specific
    'Ration Card',
    'Job Card (NREGA)',
    'Pension Card',
    'Handicapped Certificate',
    'Widow Certificate',
    'Below Poverty Line (BPL) Card',
    'Above Poverty Line (APL) Card'
]

# Add documentation requirements to database
for doc_name in documents:
    document, created = Documentation.objects.get_or_create(name=doc_name)
    if created:
        print(f"Added documentation: {doc_name}")
    else:
        print(f"Documentation already exists: {doc_name}")

print(f"\nScript completed. Total documentation types processed: {len(documents)}")
