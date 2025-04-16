'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Property } from '@/types/property'
import { User } from '@/types/user'
import { getAllProperties } from '@/lib/api/getAllProperties'
import { getUserProperties } from '@/lib/api/getUserProperties'
import { addPropertiesToUser } from '@/lib/api/addPropertiesToUser'
import { toast } from 'react-toastify'

interface UserPropertiesModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSuccess?: () => void
}

export function UserPropertiesModal({
  isOpen,
  onClose,
  user,
  onSuccess
}: UserPropertiesModalProps) {
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [userProperties, setUserProperties] = useState<Property[]>([])
  const [selectedProperties, setSelectedProperties] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all properties and user's properties when the modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchProperties()
    }
  }, [isOpen, user])

  const fetchProperties = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Fetch all properties and user's properties in parallel
      const [allPropsResponse, userPropsResponse] = await Promise.all([
        getAllProperties(),
        getUserProperties(user.id)
      ])
      
      setAllProperties(allPropsResponse)
      setUserProperties(userPropsResponse)
      
      // Pre-select user's existing properties
      setSelectedProperties(userPropsResponse.map(prop => prop.id))
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to load properties')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    
    setIsSubmitting(true)
    try {
      await addPropertiesToUser(user.id, selectedProperties)
      toast.success('Properties updated successfully')
      onClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error updating properties:', error)
      toast.error('Failed to update properties')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredProperties = allProperties.filter(property => 
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePropertyToggle = (propertyId: number, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, propertyId])
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId))
    }
  }

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([])
    } else {
      setSelectedProperties(filteredProperties.map(property => property.id))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-xl md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage User Properties</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* User info */}
          {user && (
            <div className="bg-gray-50 p-3 rounded-md border">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )}
          
          {/* Search and select all */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search properties..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              type="button" 
              variant="neutral"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedProperties.length === filteredProperties.length 
                ? 'Deselect All' 
                : 'Select All'}
            </Button>
          </div>
          
          {/* Property list */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
              <span className="ml-2">Loading properties...</span>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[50vh] border rounded-md">
              {filteredProperties.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No properties found
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {filteredProperties.map(property => (
                    <div 
                      key={property.id} 
                      className="flex items-start p-2 hover:bg-gray-50 rounded-md"
                    >
                      <Checkbox
                        id={`property-${property.id}`}
                        checked={selectedProperties.includes(property.id)}
                        onCheckedChange={(checked) => 
                          handlePropertyToggle(property.id, checked === true)
                        }
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={`property-${property.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {property.name}
                        </Label>
                        <p className="text-xs text-gray-500">{property.location}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                            {property.property_type}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            property.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {property.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="neutral" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 