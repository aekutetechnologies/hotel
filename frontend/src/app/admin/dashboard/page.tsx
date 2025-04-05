'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Building2, CalendarCheck, CircleDollarSign, Users, Plus, Search, Edit, Eye, Trash2 } from 'lucide-react'
import { fetchProperties } from '@/lib/api/fetchProperties'
import { toast } from 'react-toastify'
import { Spinner } from '@/components/ui/spinner'
import { PermissionGuard } from '@/components/PermissionGuard'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/lib/permissions'
import { Property } from '@/types/property'

// Helper type for property image display
interface DisplayImage {
  id: number;
  url: string;
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { can, isLoaded } = usePermissions()

  const dashboardStats = {
    activeBookings: 10,
    monthlyRevenue: 10000,
    occupancyRate: 50
  }
  
  useEffect(() => {
    // Only fetch properties once when component is mounted and permissions are loaded
    async function loadProperties() {
      if (!isLoaded || !can('property:view')) return
      
      try {
        setIsLoading(true)
        const data = await fetchProperties()
        setProperties(data || [])
      } catch (error: any) {
        console.error('Error fetching properties:', error)
        toast.error(`Failed to load properties: ${error.message || 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [isLoaded]) // Only depend on isLoaded, not on can which might change more often

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper function to get image URL
  const getImageUrl = (property: Property): string => {
    return property.images && property.images.length > 0 
      ? (property.images[0].image || property.images[0].image_url || '/placeholder.jpg')
      : '/placeholder.jpg';
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  // If no permission to view properties
  if (!can('property:view')) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view the dashboard.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardStats.monthlyRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.occupancyRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Section */}
      <div className="mb-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">Properties</h2>
          <PermissionGuard permission="property:create">
            <Link href="/admin/properties/new">
              <Button variant="neutral">
                <Plus className="mr-2 h-4 w-4" />
                Add New Property
              </Button>
            </Link>
          </PermissionGuard>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search properties..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Spinner className="h-12 w-12" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-lg text-gray-600 mb-4">No properties found</p>
            <PermissionGuard permission="property:create">
              <Link href="/admin/properties/new">
                <Button variant="default">
                  Add your first property
                </Button>
              </Link>
            </PermissionGuard>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rooms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.name}</TableCell>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>{property.property_type || "N/A"}</TableCell>
                    <TableCell>{property.rooms?.length || 0}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${property.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {property.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <PermissionGuard permission="property:view">
                          <Button variant="neutral" size="icon" asChild>
                            <Link href={`/admin/properties/${property.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </PermissionGuard>
                        
                        <PermissionGuard permission="property:update">
                          <Button variant="neutral" size="icon" asChild>
                            <Link href={`/admin/properties/${property.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </PermissionGuard>
                        
                        <PermissionGuard permission="property:delete">
                          <Button variant="neutral" size="icon" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

