'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Search, Plus, Edit, FileText, Eye, Trash2, Upload } from 'lucide-react'
import Link from 'next/link'
import { BookingModal } from '@/components/BookingModal'
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
import { fetchBookings } from '@/lib/api/fetchBookings'
import { updateStatusBooking } from '@/lib/api/updateStatusBooking'
import { toast } from 'react-toastify'
import { Spinner } from '@/components/ui/spinner'
import { uploadBookingDoc } from '@/lib/api/uploadBookingDoc'
import { GenericModal } from '@/components/GenericModal'

import { listBookingDoc } from '@/lib/api/listBookingdoc'
import { deleteBookingDoc } from '@/lib/api/deleteBookingDoc'
import { fetchProperties } from '@/lib/api/fetchProperties'
import { fetchUsers } from '@/lib/api/fetchUsers'
import { Property } from '@/types/property'
import { User } from '@/types/user'
import { bookProperty } from '@/lib/api/bookProperty'

export interface Document {
  id: number;
  document: string;
}

export interface Booking {
  property: number;
  room: number;
  user: number;
  checkin_date: string;
  checkout_date: string;
  status: string;
  price: number;
  booking_type: string;
  payment_type: string;
  documents?: Document[];
  id: number;
}

export default function Bookings() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [isDocumentListModalOpen, setIsDocumentListModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [isLoadingUpload, setIsLoadingUpload] = useState(false)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [users, setUsers] = useState<User[]>([])

  const getBookingsData = useCallback(async () => {
    setIsLoadingBookings(true)
    try {
      const fetchedBookings = await fetchBookings()
      setBookings(fetchedBookings)
      const fetchedProperties = await fetchProperties()
    setProperties(fetchedProperties)
    const fetchedUsers = await fetchUsers()
    setUsers(fetchedUsers)
    } catch (error: any) {
      console.error('Error fetching bookings:', error)
      toast.error(`Failed to fetch bookings: ${error.message}`)
    } finally {
      setIsLoadingBookings(false)
    }
  }, [])

  useEffect(() => {
    getBookingsData()
  }, [getBookingsData])

  const fetchDocuments = useCallback(async (bookingId: number) => {
    setIsLoadingDocuments(true)
    try {
      const fetchedDocuments = await listBookingDoc(bookingId.toString())
      setDocuments(fetchedDocuments)
    } catch (error: any) {
      console.error('Error fetching documents:', error)
      toast.error(`Failed to fetch documents: ${error.message}`)
    } finally {
      setIsLoadingDocuments(false)
    }
  }, [])

  useEffect(() => {
    if (isDocumentListModalOpen && selectedBooking) {
      fetchDocuments(selectedBooking.id)
    }
  }, [isDocumentListModalOpen, selectedBooking, fetchDocuments])

  const handleAddBooking = async (newBooking: Omit<Booking, 'id'>) => {
    console.log('Adding new booking:', newBooking)
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Please log in to book.')
      return
    }
    const response = await bookProperty(newBooking)
    console.log('Booking Response:', response)
    setIsAddModalOpen(false)
    try {
      toast.success('Booking added successfully')
      await getBookingsData()
    } catch (error: any) {
      console.error('Error adding booking:', error)
      toast.error(`Failed to add booking: ${error.message}`)
    }
  }

  const handleUpdateBooking = async (updatedBooking: Booking) => {
    console.log('Updating booking:', updatedBooking)
    setIsEditModalOpen(false)
    try {
      toast.success('Booking updated successfully')
      await getBookingsData()
    } catch (error: any) {
      console.error('Error updating booking:', error)
      toast.error(`Failed to update booking: ${error.message}`)
    }
  }

  const handleStatusChange = async (bookingId: number, newStatus: 'confirmed' | 'pending' | 'cancelled') => {
    try {
      setIsLoading(true)
      await updateStatusBooking({ id: bookingId.toString(), status: newStatus })
      getBookingsData()
      toast.success('Booking status updated successfully')
    } catch (error: any) {
      console.error('Error updating booking status:', error)
      toast.error(`Failed to update booking status: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentUpload = async (bookingId: number, file: File) => {
    setIsLoadingUpload(true)
    try {
      await uploadBookingDoc(bookingId.toString(), file)
      toast.success('Document uploaded successfully')
      setIsDocumentModalOpen(false)
      getBookingsData()
    } catch (error: any) {
      console.error('Error uploading document:', error)
      toast.error(`Failed to upload document: ${error.message}`)
    } finally {
      setIsLoadingUpload(false)
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await deleteBookingDoc(documentId.toString())
      toast.success('Document deleted successfully')
      if (selectedBooking) {
        fetchDocuments(selectedBooking.id)
      }
    } catch (error: any) {
      console.error('Error deleting document:', error)
      toast.error(`Failed to delete document: ${error.message}`)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <Button className="bg-[#B11E43] hover:bg-[#8f1836]" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Booking
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Booking Type</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingBookings ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.property.name}</TableCell>
                  <TableCell>{booking.user.name}</TableCell>
                  <TableCell>{booking.checkin_date}</TableCell>
                  <TableCell>{booking.checkout_date}</TableCell>
                  <TableCell>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as any)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </TableCell>
                  <TableCell>₹{booking.price}</TableCell>
                  <TableCell>{booking.booking_type}</TableCell>
                  <TableCell>{booking.payment_type}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedBooking(booking)
                        setIsEditModalOpen(true)
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedBooking(booking)
                        setIsDocumentModalOpen(true)
                      }}>
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedBooking(booking)
                        setIsDocumentListModalOpen(true)
                      }}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBooking}
        title="Add New Booking"
        onBookingAction={getBookingsData}
        properties={properties}
        users={users}
      />

      {selectedBooking && (
        <BookingModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateBooking}
          title="Edit Booking"
          initialData={selectedBooking}
          onBookingAction={getBookingsData}
          properties={properties}
          users={users}
        />
      )}

      {selectedBooking && (
        <DocumentModal
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
          title="Upload Document"
          onUpload={(file: File) => handleDocumentUpload(selectedBooking.id, file)}
        />
      )}

      {selectedBooking && (
        <GenericModal
          isOpen={isDocumentListModalOpen}
          onClose={() => {
            setIsDocumentListModalOpen(false)
            setDocuments([])
          }}
          title="Booking Documents"
          description={`Documents for Booking #${selectedBooking.id}`}
        >
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoadingDocuments ? (
              <div className="text-center py-4">
                <Spinner />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-gray-500 text-center">No documents found for this booking</p>
            ) : (
              <div className="space-y-4">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{document.document.split('/').pop()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={document.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        View
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDocument(document.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GenericModal>
      )}
    </div>
  )
}