'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react'
import Link from 'next/link'
import { PermissionGuard } from '@/components/PermissionGuard'
import { usePermissions } from '@/hooks/usePermissions'
import { fetchProperties } from '@/lib/api/fetchProperties'
import { deleteProperty } from '@/lib/api/deleteProperty'
import { toast } from 'react-toastify'
import { Spinner } from '@/components/ui/spinner'
import { Property } from '@/types/property'
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { can, isLoaded } = usePermissions()
  const hasViewPermission = useRef(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch properties
  useEffect(() => {
    async function loadProperties() {
      if (!isLoaded) return
      
      hasViewPermission.current = can('property:view')
      
      if (!hasViewPermission.current) {
        setIsLoading(false)
        return
      }
      
      try {
        const data = await fetchProperties()
        setProperties(data || [])
      } catch (error: any) {
        console.error('Failed to fetch properties:', error)
        toast.error(`Failed to load properties: ${error.message || 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [isLoaded])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    setIsDeleting(true)
    try {
      await deleteProperty(id.toString())
      setProperties(properties.filter((property: Property) => property.id !== id))
      toast.success('Property deleted successfully')
    } catch (error: any) {
      console.error('Failed to delete property:', error)
      toast.error(`Failed to delete property: ${error.message || 'Unknown error'}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter properties based on search term
  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.property_type && property.property_type.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  if (!hasViewPermission.current) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view properties.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Properties</h1>
        
        <div className="flex gap-2">
          <PermissionGuard permission="property:create">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="bg-[#B11E43] hover:bg-[#8f1836]">
                    <Plus className="mr-2 h-4 w-4" />
                    <Link href="/admin/properties/new">Add New Property</Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new property listing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </PermissionGuard>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
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
            <Button className="bg-[#B11E43] hover:bg-[#8f1836]">
              <Link href="/admin/properties/new">Add your first property</Link>
            </Button>
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
                      
                      <PermissionGuard permission="property:update">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="neutral" size="icon" asChild>
                                <Link href={`/admin/properties/${property.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit property</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </PermissionGuard>
                      
                      <PermissionGuard permission="property:delete">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="neutral" 
                                size="icon" 
                                className="text-red-600"
                                onClick={() => handleDelete(property.id)}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete property</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
  )
}