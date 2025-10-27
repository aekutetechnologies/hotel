'use client'

export type Permission = 
  | 'property:rule:view' 
  | 'property:room:delete'
  | 'property:documentation:view'
  | 'reply:view'
  | 'reply:update'
  | 'review:create'
  | 'property:documentation:update'
  | 'property:amenity:update'
  | 'admin:user:assign-permissions'
  | 'property:documentation:delete'
  | 'admin:user:delete'
  | 'property:view'
  | 'property:room:view'
  | 'property:amenity:create'
  | 'property:documentation:create'
  | 'property:amenity:view'
  | 'property:create'
  | 'review:update'
  | 'property:rule:delete'
  | 'booking:create'
  | 'review:view'
  | 'property:room:update'
  | 'property:update'
  | 'property:rule:update'
  | 'booking:delete'
  | 'property:delete'
  | 'property:room:create'
  | 'property:rule:create'
  | 'booking:view'
  | 'reply:create'
  | 'property:amenity:delete'
  | 'reply:delete'
  | 'review:delete'
  | 'booking:update'
  | 'admin:expense:create'
  | 'admin:expense:view'
  | 'admin:expense:update'
  | 'admin:expense:delete'
  | 'admin:offer:create'
  | 'admin:offer:view'
  | 'admin:offer:update'
  | 'admin:offer:delete'
  | 'admin:user:view'
  | 'admin:dashboard:view'
  | 'blog:create'
  | 'blog:edit'
  | 'blog:delete'
  | 'blog:publish'
  | 'blog:view';

// Function to safely access localStorage (client-side only)
function getFromLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

// Map permissions required for each admin page
export const pagePermissionsMap: Record<string, Permission[]> = {
  // Dashboard
  '/admin/dashboard': ['admin:dashboard:view', 'property:view'],
  
  // Properties
  '/admin/properties': ['property:view'],
  '/admin/properties/create': ['property:create'],
  '/admin/properties/new': ['property:create'],
  
  // Dynamic paths with regex
  '^/admin/properties/\\d+/edit$': ['property:update'],
  '^/admin/properties/\\d+$': ['property:view'],
  
  // Bookings
  '/admin/bookings': ['booking:view'],
  
  // Visits
  '/admin/visits': ['booking:view'],
  
  // Expenses
  '/admin/expenses': ['admin:expense:view'],
  
  // Users
  '/admin/users': ['admin:user:view', 'admin:user:assign-permissions'],
  
  // User Roles
  '/admin/userroles': ['admin:user:assign-permissions'],
  
  // Offers
  '/admin/offers': ['admin:offer:view'],
  
  // Blogs
  '/admin/blogs': ['blog:view'],
  '/admin/blogs/new': ['blog:create'],
  '^/admin/blogs/.+/edit$': ['blog:edit'],
};

// Check if user has all required permissions
export function hasPermissions(requiredPermissions: Permission[]): boolean {
  if (!requiredPermissions.length) return true;
  
  try {
    const userPermissionsString = getFromLocalStorage('permissions');
    
    if (!userPermissionsString) {
      console.debug(`hasPermissions check failed: No permissions found in localStorage`);
      return false;
    }
    
    const userPermissions = userPermissionsString.split(',').map(p => p.trim().toLowerCase());
    
    // For debugging, log all permissions
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`hasPermissions check:`, {
        required: requiredPermissions,
        userHas: userPermissions
      });
    }
    
    const result = requiredPermissions.every(permission => {
      const normalizedPermission = permission.toLowerCase();
      const hasPermission = userPermissions.includes(normalizedPermission);
      
      // For debugging, log each individual permission check
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`Permission check: "${permission}" => ${hasPermission}`);
      }
      
      return hasPermission;
    });
    
    return result;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

// Check if user has any of the required permissions
export function hasAnyPermission(requiredPermissions: Permission[]): boolean {
  if (!requiredPermissions.length) return true;
  
  try {
    const userPermissionsString = getFromLocalStorage('permissions');
    if (!userPermissionsString) return false;
    
    const userPermissions = userPermissionsString.split(',');
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

// Check if user has permission to access a specific page
export function canAccessPage(path: string): boolean {
  // Direct match first
  if (pagePermissionsMap[path]) {
    return hasPermissions(pagePermissionsMap[path]);
  }
  
  // Try regex patterns for dynamic routes
  for (const [pattern, permissions] of Object.entries(pagePermissionsMap)) {
    if (pattern.startsWith('^') && new RegExp(pattern).test(path)) {
      return hasPermissions(permissions);
    }
  }
  
  // If no match is found, deny access
  return false;
}

// Get all user permissions
export function getUserPermissions(): Permission[] {
  try {
    const userPermissionsString = getFromLocalStorage('permissions');
    if (!userPermissionsString) return [];
    
    return userPermissionsString.split(',') as Permission[];
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

// Check if user has a specific permission
export function hasPermission(permission: Permission): boolean {
  return hasPermissions([permission]);
} 