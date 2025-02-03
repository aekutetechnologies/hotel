'use client'

import { useState } from 'react'
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
import { Search, Plus, Edit, FileText } from 'lucide-react'
import { offers } from '@/lib/dummy-data'
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

export default function Offers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredOffers = offers.filter(offer =>
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

  const handleAddOffer = (newOffer) => {
    // In a real app, you would add the offer to your backend here
    console.log('Adding new offer:', newOffer)
    setIsAddModalOpen(false)
  }

  const handleEditOffer = (updatedOffer) => {
    // In a real app, you would update the offer in your backend here
    console.log('Updating offer:', updatedOffer)
    setIsEditModalOpen(false)
  }

  const handleStatusChange = (offerId, newStatus) => {
    // In a real app, you would update the status in your backend here
    console.log(`Changing status of offer ${offerId} to ${newStatus}`)
  }

  const handleDocumentUpload = (offerId, file) => {
    // In a real app, you would upload the document to your backend here
    console.log(`Uploading document for offer ${offerId}:`, file)
    setIsDocumentModalOpen(false)
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
                <TableCell>{offer.discountPercentage}%</TableCell>
                <TableCell>{offer.validFrom}</TableCell>
                <TableCell>{offer.validTo}</TableCell>
                <TableCell>
                  <select
                    value={offer.status}
                    onChange={(e) => handleStatusChange(offer.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedOffer(offer)
                      setIsEditModalOpen(true)
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedOffer(offer)
                      setIsDocumentModalOpen(true)
                    }}>
                      <FileText className="h-4 w-4" />
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

      {selectedOffer && (
        <DocumentModal
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
          onUpload={(file) => handleDocumentUpload(selectedOffer.id, file)}
          title="Upload Document"
        />
      )}
    </div>
  )
}

