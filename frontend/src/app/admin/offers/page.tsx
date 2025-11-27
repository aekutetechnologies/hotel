'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Plus, Edit, FileText, Upload } from 'lucide-react'
import { OfferModal } from '@/components/OfferModal'
import { DocumentModal } from '@/components/DocumentModal'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { fetchOffers } from '@/lib/api/fetchOffers'
import { updateOffer } from '@/lib/api/updateOffer'
import { uploadOfferImage } from '@/lib/api/uploadOfferImage'
import { listOfferimage } from '@/lib/api/listOfferimage'
import { toast } from 'react-toastify'
import { createOffer } from '@/lib/api/createOffer'
import { assignOffersToProperties, unassignOffersFromProperties } from '@/lib/api/assignOffers'
import { fetchProperties } from '@/lib/api/fetchProperties'
import { ImageCropper } from '@/components/ImageCropper'
import { type Offer, type OfferFormData } from '@/types/offer'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGuard } from '@/components/PermissionGuard'
import { usePermissions } from '@/hooks/usePermissions'
import { Spinner } from '@/components/ui/spinner'

export default function Offers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [offersData, setOffersData] = useState<Offer[]>([])
  const [loading, setLoading] = useState(false)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [uploadingOfferId, setUploadingOfferId] = useState<number | null>(null)
  const [selectedOfferIds, setSelectedOfferIds] = useState<number[]>([])
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([])
  const [propertySearch, setPropertySearch] = useState('')
  const itemsPerPage = 15
  const { can, isLoaded } = usePermissions()
  const offersLoadedRef = useRef(false)
  const isLoadingRef = useRef(false)
  const mountedRef = useRef(false)

  // Set mounted state on component mount
  useEffect(() => {
    console.log('Component mounted effect running')
    mountedRef.current = true
    
    // Cleanup on unmount
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Memoize loadOffers function to prevent it from being recreated on each render
  const loadOffers = useCallback(async () => {
    console.log('loadOffers function called')
    
    if (!mountedRef.current) {
      console.log('Component not mounted, skipping loadOffers')
      return
    }
    
    // Use ref for loading check to avoid dependency issues
    if (isLoadingRef.current) {
      console.log('Already loading (ref), skipping fetchOffers call')
      return // Prevent multiple simultaneous calls
    }
    
    // Set both the state and ref
    setLoading(true)
    isLoadingRef.current = true
    
    try {
      console.log('Loading offers now')
      // Log the API call
      console.log('Calling fetchOffers API')
      const fetchedOffers = await fetchOffers()
      console.log('API call complete')
      
      // Check if component is still mounted before updating state
      if (!mountedRef.current) {
        console.log('Component unmounted during fetch, skipping state update')
        return
      }
      
      console.log('Fetched offers:', fetchedOffers)
      setOffersData(fetchedOffers)
      offersLoadedRef.current = true
    } catch (error) {
      console.error('Error fetching offers:', error)
      
      // Only show toast if component is still mounted
      if (mountedRef.current) {
        toast.error('Failed to load offers.')
      }
    } finally {
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setLoading(false)
      }
      isLoadingRef.current = false
    }
  }, []) // No dependencies needed for loadOffers now

  // Force initial load on mount
  useEffect(() => {
    console.log('Initial load effect, isLoaded:', isLoaded)
    
    if (!mountedRef.current) {
      console.log('Component not mounted yet in load effect')
      return
    }
    
    // Only proceed if permission check is loaded
    if (!isLoaded) {
      console.log('Permissions not loaded yet')
      return
    }
    
    // Check permission and load if needed
    const hasViewPermission = can('admin:offer:view')
    console.log('Initial mount, has view permission:', hasViewPermission)
    
    if (hasViewPermission && !offersLoadedRef.current) {
      console.log('Initial load of offers')
      loadOffers()
    }
  }, [isLoaded, loadOffers])
  
  // Effect to handle pagination changes
  useEffect(() => {
    if (offersLoadedRef.current) {
      // Reset to page 1 when search term changes
      setCurrentPage(1)
    }
  }, [searchTerm])

  // Force an immediate load for testing in development
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: Forcing immediate load check')
      const timer = setTimeout(() => {
        if (isLoaded && !offersLoadedRef.current) {
          console.log('DEV MODE: Forcing loadOffers call')
          loadOffers()
        }
      }, 1000) // Try after 1 second
      
      return () => clearTimeout(timer)
    }
  }, [isLoaded, loadOffers])

  const filteredOffers = offersData.filter(offer =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage)
  const shouldShowPagination = filteredOffers.length > itemsPerPage

  const paginatedOffers = shouldShowPagination 
    ? filteredOffers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredOffers

  const generatePageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('ellipsis')
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('ellipsis')
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  const handleAddOffer = async (newOffer: Omit<Offer, 'id'>) => {
    // In a real app, you would add the offer to your backend here
    console.log('Adding new offer:', newOffer)
    try {
      await createOffer(newOffer)
      toast.success('Offer created successfully.')
      setIsAddModalOpen(false)
      loadOffers()
    } catch (error) {
      console.error('Error creating offer:', error)
      toast.error('Failed to create offer.')
    }
  }

  const handleEditOffer = async (updatedOffer: Offer) => {
    // In a real app, you would update the offer in your backend here
    console.log('Updating offer:', updatedOffer)
    try {
      await updateOffer(updatedOffer.id, updatedOffer)
      toast.success('Offer updated successfully.')
      setIsEditModalOpen(false)
      loadOffers()
    } catch (error) {
      console.error('Error updating offer:', error)
      toast.error('Failed to update offer.')
    }
  }

  const handleStatusChange = async (offerId: number, newStatus: string) => {
    try {
      await updateOffer(offerId, { is_active: newStatus === 'Active' ? true : false }) // Assuming updateOffer takes offerId and updates object
      toast.success(`Offer status updated to ${newStatus}`)
      loadOffers() // Refresh offers to reflect status change
    } catch (error) {
      console.error('Error updating offer status:', error)
      toast.error('Failed to update offer status.')
    }
  }

  const toggleOfferSelection = (offerId: number, checked: boolean) => {
    setSelectedOfferIds(prev => {
      if (checked) return Array.from(new Set([...prev, offerId]))
      return prev.filter(id => id !== offerId)
    })
  }

  const openAssignModal = async () => {
    try {
      const props = await fetchProperties()
      setProperties(props || [])
      setIsAssignModalOpen(true)
    } catch (e) {
      toast.error('Failed to load properties')
    }
  }

  const togglePropertySelection = (propertyId: number, checked: boolean) => {
    setSelectedPropertyIds(prev => {
      if (checked) return Array.from(new Set([...prev, propertyId]))
      return prev.filter(id => id !== propertyId)
    })
  }

  const handleAssign = async () => {
    if (selectedOfferIds.length === 0 || selectedPropertyIds.length === 0) {
      toast.error('Select at least one offer and one property')
      return
    }
    try {
      await assignOffersToProperties(selectedOfferIds, selectedPropertyIds)
      toast.success('Assigned offers to properties')
      setIsAssignModalOpen(false)
      setSelectedPropertyIds([])
      // Keep selected offers to allow multiple assignments if desired
    } catch (e: any) {
      toast.error(e?.message || 'Assignment failed')
    }
  }

  const handleUnassign = async () => {
    if (selectedOfferIds.length === 0 || selectedPropertyIds.length === 0) {
      toast.error('Select at least one offer and one property')
      return
    }
    try {
      await unassignOffersFromProperties(selectedOfferIds, selectedPropertyIds)
      toast.success('Unassigned offers from properties')
      setIsAssignModalOpen(false)
      setSelectedPropertyIds([])
    } catch (e: any) {
      toast.error(e?.message || 'Unassignment failed')
    }
  }

  const handleImageUploadClick = (offer: Offer) => {
    setSelectedOffer(offer)
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setCropImage(e.target?.result as string)
          setUploadingOfferId(offer.id) // Set offer ID for upload
        }
        reader.readAsDataURL(file)
      }
    }
    fileInput.click()
  }

  const handleCropComplete = async (croppedImageBlob: Blob, offerId: number) => {
    try {
      const blobType = croppedImageBlob.type || 'image/jpeg'
      const extension = blobType.split('/')[1] || 'jpg'
      const file = new File([croppedImageBlob], `offer_image.${extension}`, { type: blobType })
      await uploadOfferImage(offerId, file)
      toast.success('Image uploaded successfully.')
      setIsDocumentModalOpen(false)
    } catch (error) {
      console.error('Error uploading cropped image:', error)
      toast.error('Failed to upload cropped image.')
    }
  }

  if (!isLoaded) {
    console.log('Render: Loading permissions')
    return (
      <div className="flex justify-center items-center p-12 h-[70vh]">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  // If no permission to view offers
  if (!can('admin:offer:view')) {
    console.log('Render: No permission to view offers')
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view offers.</p>
      </div>
    )
  }

  console.log('Render: Main component with permissions')

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Offers</h1>
        <div className="flex gap-2">
          <PermissionGuard permissions={['admin:offer:update']} requireAll={false}>
            <Button variant="neutral" onClick={openAssignModal} disabled={selectedOfferIds.length === 0}>
              Assign to Properties
            </Button>
          </PermissionGuard>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="neutral" 
                  onClick={() => {
                    console.log('Manual refresh clicked')
                    offersLoadedRef.current = false
                    loadOffers()
                  }}
                >
                  Refresh Offers
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reload all offers from server</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PermissionGuard permissions={['admin:offer:create']} requireAll={false}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="bg-[#B11E43] hover:bg-[#8f1836]" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Offer
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new offer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </PermissionGuard>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search offers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOfferIds(paginatedOffers.map(o => o.id))
                    } else {
                      setSelectedOfferIds([])
                    }
                  }}
                  checked={paginatedOffers.length > 0 && paginatedOffers.every(o => selectedOfferIds.includes(o.id))}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Valid To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOffers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedOfferIds.includes(offer.id)}
                    onChange={(e) => toggleOfferSelection(offer.id, e.target.checked)}
                    aria-label={`Select offer ${offer.title}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{offer.title}</TableCell>
                <TableCell>{offer.description}</TableCell>
                <TableCell>{offer.code}</TableCell>
                <TableCell>{offer.discount_percentage} %</TableCell>
                <TableCell>{new Date(offer.offer_start_date).toLocaleDateString('en-CA')}</TableCell>
                <TableCell>{new Date(offer.offer_end_date).toLocaleDateString('en-CA')}</TableCell>
                <TableCell>
                  <PermissionGuard permissions={['admin:offer:update']} requireAll={false}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <select
                            value={offer.is_active ? 'Active' : 'Inactive'}
                            onChange={(e) => handleStatusChange(offer.id, e.target.value === 'Active' ? 'Active' : 'Inactive')}
                            className="border rounded px-2 py-1"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Change offer status</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </PermissionGuard>
                  {!can('admin:offer:update') && (
                    <span className={`px-2 py-1 rounded text-xs ${offer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {offer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <PermissionGuard permissions={['admin:offer:update']} requireAll={false}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="neutral" size="icon" onClick={() => {
                              setSelectedOffer(offer)
                              setIsEditModalOpen(true)
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit offer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </PermissionGuard>
                    
                    <PermissionGuard permissions={['admin:offer:update']} requireAll={false}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="neutral" size="icon" onClick={() => {
                              handleImageUploadClick(offer)
                            }}>
                              <Upload className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Upload offer image</p>
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
        
        {shouldShowPagination && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                {currentPage === 1 ? (
                  <span className="opacity-50">
                    <PaginationPrevious size="default" />
                  </span>
                ) : (
                  <PaginationPrevious 
                    size="default"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
                  />
                )}
              </PaginationItem>
              {generatePageNumbers().map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {pageNumber === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      size="default"
                      onClick={() => setCurrentPage(pageNumber as number)}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                {currentPage === totalPages ? (
                  <span className="opacity-50">
                    <PaginationNext size="default" />
                  </span>
                ) : (
                  <PaginationNext 
                    size="default"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Assign Offers to Properties</h2>
              <Button variant="neutral" onClick={() => setIsAssignModalOpen(false)}>Close</Button>
            </div>
            <div className="mb-3">
              <Input
                placeholder="Search properties..."
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
              />
            </div>
            <div className="max-h-80 overflow-auto border rounded">
              {(properties || [])
                .filter(p => {
                  const q = propertySearch.trim().toLowerCase()
                  if (!q) return true
                  return (p.name || '').toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q)
                })
                .map((p) => (
                  <label key={p.id} className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0">
                    <input
                      type="checkbox"
                      checked={selectedPropertyIds.includes(p.id)}
                      onChange={(e) => togglePropertySelection(p.id, e.target.checked)}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-gray-500">{p.location}</span>
                    </div>
                  </label>
                ))}
              {(!properties || properties.length === 0) && (
                <div className="p-4 text-center text-gray-500">No properties found</div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button variant="neutral" onClick={handleUnassign} disabled={selectedPropertyIds.length === 0 || selectedOfferIds.length === 0}>
                Unassign
              </Button>
              <Button className="bg-[#B11E43] hover:bg-[#8f1836]" onClick={handleAssign} disabled={selectedPropertyIds.length === 0 || selectedOfferIds.length === 0}>
                Assign
              </Button>
            </div>
          </div>
        </div>
      )}

      {cropImage && uploadingOfferId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center">
          <ImageCropper
            image={cropImage}
            aspectRatio={1125 / 320}
            onCropComplete={async (croppedImageBlob) => {
              await handleCropComplete(croppedImageBlob, uploadingOfferId)
              setCropImage(null)
              setUploadingOfferId(null)
            }}
            onCancel={() => {setCropImage(null); setUploadingOfferId(null)}}
          />
        </div>
      )}

      <OfferModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddOffer}
        title="Add New Offer"
      />

      {selectedOffer && (
        <OfferModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditOffer}
          title="Edit Offer"
          initialData={selectedOffer}
        />
      )}
    </div>
  )
}

