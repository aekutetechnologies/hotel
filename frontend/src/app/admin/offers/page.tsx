'use client'

import { useState, useEffect } from 'react'
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
import { listOfferImage } from '@/lib/api/listOfferimage'
import { toast } from 'react-toastify'
import { createOffer } from '@/lib/api/createOffer'
import { ImageCropper } from '@/components/ImageCropper'

interface Offer {
  id: number;
  title: string;
  description: string;
  code: string;
  discount_percentage: number;
  offer_start_date: string;
  offer_end_date: string;
  is_active: boolean;
  image?: string; // Assuming offers have an image URL
}

export default function Offers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [offersData, setOffersData] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [uploadingOfferId, setUploadingOfferId] = useState<number | null>(null)

  useEffect(() => {
    loadOffers()
  }, [currentPage])

  const loadOffers = async () => {
    setLoading(true)
    try {
      const fetchedOffers = await fetchOffers()
      setOffersData(fetchedOffers)
    } catch (error) {
      console.error('Error fetching offers:', error)
      toast.error('Failed to load offers.')
    } finally {
      setLoading(false)
    }
  }

  const filteredOffers = offersData.filter(offer =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage)

  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
    setIsEditModalOpen(false)
     // After successful edit, refresh offers list
    loadOffers()
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
      const file = new File([croppedImageBlob], 'cropped-image.jpg', { type: 'image/jpeg' })
      await uploadOfferImage(offerId, file)
      toast.success('Image uploaded successfully.')
      setIsDocumentModalOpen(false)
    } catch (error) {
      console.error('Error uploading cropped image:', error)
      toast.error('Failed to upload cropped image.')
    }
  }

  if (loading) {
    return <div>Loading offers...</div>
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Offers</h1>
        <Button className="bg-[#B11E43] hover:bg-[#8f1836]" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Offer
        </Button>
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
                <TableCell className="font-medium">{offer.title}</TableCell>
                <TableCell>{offer.description}</TableCell>
                <TableCell>{offer.code}</TableCell>
                <TableCell>{offer.discount_percentage} %</TableCell>
                <TableCell>{new Date(offer.offer_start_date).toLocaleDateString('en-CA')}</TableCell>
                <TableCell>{new Date(offer.offer_end_date).toLocaleDateString('en-CA')}</TableCell>
                <TableCell>{offer.is_active ? 'Active' : 'Inactive'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedOffer(offer)
                      setIsEditModalOpen(true)
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      handleImageUploadClick(offer)
                    }}>
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {generatePageNumbers().map((pageNumber, index) => (
              <PaginationItem key={index}>
                {pageNumber === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNumber as number)}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

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

