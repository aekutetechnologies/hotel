'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { PermissionGuard } from '@/components/PermissionGuard'
import { usePermissions } from '@/hooks/usePermissions'
import { fetchProperties } from '@/lib/api/fetchProperties'
import { deleteProperty } from '@/lib/api/deleteProperty'
import { toast } from 'react-toastify'
import { Spinner } from '@/components/ui/spinner'
import { getUserPermissions, Permission } from '@/lib/permissions'

export default function Properties() {
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { can, isLoaded } = usePermissions()
  const [permissionsDebug, setPermissionsDebug] = useState<{
    hasViewPermission: boolean;
    hasCreatePermission: boolean;
    hasUpdatePermission: boolean;
    hasDeletePermission: boolean;
    allPermissions: Permission[];
  }>({
    hasViewPermission: false,
    hasCreatePermission: false,
    hasUpdatePermission: false,
    hasDeletePermission: false,
    allPermissions: []
  })

  // Debug permissions
  useEffect(() => {
    if (isLoaded) {
      const allPermissions = getUserPermissions()
      setPermissionsDebug({
        hasViewPermission: can('property:view'),
        hasCreatePermission: can('property:create'),
        hasUpdatePermission: can('property:update'),
        hasDeletePermission: can('property:delete'),
        allPermissions
      })
      console.log('Permissions loaded:', {
        hasViewPermission: can('property:view'),
        hasCreatePermission: can('property:create'),
        hasUpdatePermission: can('property:update'),
        hasDeletePermission: can('property:delete'),
        allPermissions
      })
    }
  }, [isLoaded, can])

  // Fetch properties
  useEffect(() => {
    async function loadProperties() {
      try {
        console.log('Fetching properties...')
        const data = await fetchProperties()
        console.log('Properties data:', data)
        setProperties(data || [])
      } catch (error: any) {
        console.error('Failed to fetch properties:', error)
        toast.error(`Failed to load properties: ${error.message || 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    setIsDeleting(true)
    try {
      await deleteProperty(id.toString())
      setProperties(properties.filter((property: any) => property.id !== id))
      toast.success('Property deleted successfully')
    } catch (error: any) {
      console.error('Failed to delete property:', error)
      toast.error(`Failed to delete property: ${error.message || 'Unknown error'}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Show debug info
  if (process.env.NODE_ENV !== 'production') {
    console.log('Properties rendering with: ', {
      isLoaded,
      propertiesCount: properties?.length,
      permissionsDebug
    })
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Properties</h1>
        
        <PermissionGuard permission="property:create">
          <Button className="bg-[#B11E43] hover:bg-[#8f1836]">
            <Plus className="mr-2 h-4 w-4" />
            <Link href="/admin/properties/create">Add New Property</Link>
          </Button>
        </PermissionGuard>
      </div>

      {/* Show permissions debug in non-production */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-4 p-4 bg-gray-100 rounded-md text-xs">
          <h3 className="font-bold mb-2">Debug Permissions:</h3>
          <pre>{JSON.stringify(permissionsDebug, null, 2)}</pre>
        </div>
      )}

      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-4">
          <Button 
            onClick={() => {
              // Give all permissions for debugging
              const allPermissionsStr = [
                'property:view', 'property:create', 'property:update', 'property:delete',
                'property:room:view', 'property:room:create', 'property:room:update', 'property:room:delete',
                'property:rule:view', 'property:rule:create', 'property:rule:update', 'property:rule:delete',
                'property:documentation:view', 'property:documentation:create', 'property:documentation:update', 'property:documentation:delete',
                'property:amenity:view', 'property:amenity:create', 'property:amenity:update', 'property:amenity:delete',
                'booking:view', 'booking:create', 'booking:update', 'booking:delete',
                'review:view', 'review:create', 'review:update', 'review:delete',
                'reply:view', 'reply:create', 'reply:update', 'reply:delete',
                'admin:user:view', 'admin:user:assign-permissions', 'admin:user:delete',
                'admin:dashboard:view', 'admin:expense:view', 'admin:expense:create', 'admin:expense:update', 'admin:expense:delete',
                'admin:offer:view', 'admin:offer:create', 'admin:offer:update', 'admin:offer:delete'
              ].join(',');
              
              localStorage.setItem('permissions', allPermissionsStr);
              toast.success('Debug: All permissions granted! Refreshing page...');
              setTimeout(() => window.location.reload(), 1000);
            }}
            size="sm"
            variant="outline"
            className="mb-2"
          >
            Debug: Grant All Permissions
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner className="h-12 w-12" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-lg text-gray-600 mb-4">No properties found</p>
          <PermissionGuard permission="property:create">
            <Button className="bg-[#B11E43] hover:bg-[#8f1836]">
              <Link href="/admin/properties/create">Add your first property</Link>
            </Button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any) => (
            <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={property.images?.[0]?.image_url || '/placeholder-property.jpg'} 
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
                <p className="text-gray-600 mb-3">{property.location}</p>
                <p className="text-gray-600 mb-3">Type: {property.property_type}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <PermissionGuard permission="property:view">
                    <Link href={`/admin/properties/${property.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </PermissionGuard>
                  
                  <PermissionGuard permission="property:update">
                    <Link href={`/admin/properties/${property.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </PermissionGuard>
                  
                  <PermissionGuard permission="property:delete">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(property.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 