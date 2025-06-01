import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import HsPermission

permissions = [
    {
        'name': 'admin:user',
        'description': 'Full access to user profiles (view, create, update, delete).'
    },
    {
        'name': 'admin:user:view',
        'description': 'View user profiles.'
    },
    {
        'name': 'admin:user:create',
        'description': 'Create new user profiles.'
    },
    {
        'name': 'admin:user:update',
        'description': 'Update existing user profiles.'
    },
    {
        'name': 'admin:user:delete',
        'description': 'Delete user profiles.'
    },
    {
        'name': 'admin:user:assign-permissions',
        'description': 'Assign permissions to users.'
    },
    {
        'name': 'admin:user:assign-role',
        'description': 'Assign roles to users.'
    },
    {
        'name': 'admin:settings:manage',
        'description': 'Manage system settings and configurations.'
    },
    {
        'name': 'admin:content:manage',
        'description': 'Manage system content and data.'
    },
    {
        'name': 'admin:reports:view',
        'description': 'View system reports and analytics.'
    },
    {
        'name': 'admin:reports:export',
        'description': 'Export reports and data.'
    },
    {
        'name': 'admin:dashboard:view',
        'description': 'View admin dashboard and statistics.'
    },
    {
        'name': 'admin:role:view',
        'description': 'View roles and role permissions.'
    },
    {
        'name': 'admin:role:create',
        'description': 'Create new roles.'
    },
    {
        'name': 'admin:role:update',
        'description': 'Update existing roles.'
    },
    {
        'name': 'admin:role:delete',
        'description': 'Delete roles.'
    },
    {
        'name': 'admin:offer:view',
        'description': 'View offers and promotions.'
    },
    {
        'name': 'admin:offer:create',
        'description': 'Create new offers and promotions.'
    },
    {
        'name': 'admin:offer:update',
        'description': 'Update existing offers and promotions.'
    },
    {
        'name': 'admin:offer:delete',
        'description': 'Delete offers and promotions.'
    },
    {
        'name': 'admin:expense:view',
        'description': 'View expenses and financial records.'
    },
    {
        'name': 'admin:expense:create',
        'description': 'Create new expense records.'
    },
    {
        'name': 'admin:expense:update',
        'description': 'Update existing expense records.'
    },
    {
        'name': 'admin:expense:delete',
        'description': 'Delete expense records.'
    },
    {
        'name': 'property:view',
        'description': 'View property details.'
    },
    {
        'name': 'property:create',
        'description': 'Create new properties.'
    },
    {
        'name': 'property:update',
        'description': 'Update existing properties.'
    },
    {
        'name': 'property:delete',
        'description': 'Delete properties.'
    },
    {
        'name': 'property:amenity:view',
        'description': 'View amenities.'
    },
    {
        'name': 'property:amenity:create',
        'description': 'Create new amenities.'
    },
    {
        'name': 'property:amenity:update',
        'description': 'Update existing amenities.'
    },
    {
        'name': 'property:amenity:delete',
        'description': 'Delete amenities.'
    },
    {
        'name': 'property:rule:view',
        'description': 'View rules.'
    },
    {
        'name': 'property:rule:create',
        'description': 'Create new rules.'
    },
    {
        'name': 'property:rule:update',
        'description': 'Update existing rules.'
    },
    {
        'name': 'property:rule:delete',
        'description': 'Delete rules.'
    },
    {
        'name': 'property:documentation:view',
        'description': 'View documentations.'
    },
    {
        'name': 'property:documentation:create',
        'description': 'Create new documentations.'
    },
    {
        'name': 'property:documentation:update',
        'description': 'Update existing documentations.'
    },
    {
        'name': 'property:documentation:delete',
        'description': 'Delete documentations.'
    },
    {
        'name': 'property:room:view',
        'description': 'View rooms.'
    },
    {
        'name': 'property:room:create',
        'description': 'Create new rooms.'
    },
    {
        'name': 'property:room:update',
        'description': 'Update existing rooms.'
    },
    {
        'name': 'property:room:delete',
        'description': 'Delete rooms.'
    },
    {
        'name': 'booking:view',
        'description': 'View booking details.'
    },
    {
        'name': 'booking:create',
        'description': 'Create new bookings.'
    },
    {
        'name': 'booking:update',
        'description': 'Update existing bookings.'
    },
    {
        'name': 'booking:delete',
        'description': 'Delete bookings.'
    },
    {
        'name': 'review:view',
        'description': 'View reviews.'
    },
    {
        'name': 'review:create',
        'description': 'Create new reviews.'
    },
    {
        'name': 'review:update',
        'description': 'Update existing reviews.'
    },
    {
        'name': 'review:delete',
        'description': 'Delete reviews.'
    },
    {
        'name': 'reply:view',
        'description': 'View replies.'
    },
    {
        'name': 'reply:create',
        'description': 'Create new replies.'
    },
    {
        'name': 'reply:update',
        'description': 'Update existing replies.'
    },
    {
        'name': 'reply:delete',
        'description': 'Delete replies.'
    }
]

for perm_data in permissions:
    HsPermission.objects.get_or_create(name=perm_data['name'], defaults={'description': perm_data['description']})

print("Permissions added successfully with descriptions.")
