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
import { Search, Plus, Edit, FileText, Trash2, Upload, Calendar, Filter, X, Info, FileDown } from 'lucide-react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from 'date-fns'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { listBookingDoc } from '@/lib/api/listBookingdoc'
import { deleteBookingDoc } from '@/lib/api/deleteBookingDoc'
import { fetchProperties } from '@/lib/api/fetchProperties'
import { fetchUsers } from '@/lib/api/fetchUsers'
import { type Property } from "@/types/property"
import { type User } from "@/types/user"
import { bookProperty } from '@/lib/api/bookProperty'
import { generatePDFInvoice } from '@/lib/invoice/generatePDFInvoice'

// Define Document and Booking interfaces that will be used by other files
export interface Document {
  id: number;
  name: string;
  file: string;
  document?: string;
  type?: string;
  user?: number;
}

interface BookingProperty {
  id: number;
  name: string;
  images: Array<{
    image: string;
  }>;
  rooms?: Array<{
    id: number;
    name: string;
  }>;
  location?: string;
  property_type?: string;
}

interface BookingUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
}

export interface Booking {
  id: number;
  property: number | BookingProperty | null;
  room: number;
  price: string;
  discount: string;
  booking_type: string;
  status: string;
  payment_type: string;
  checkin_date: string;
  checkout_date: string;
  checkin_time?: string;
  checkout_time?: string;
  created_at: string;
  updated_at: string;
  user?: number | BookingUser | null;
  number_of_guests?: number;
  number_of_rooms?: number;
  booking_room_types?: Array<BookingRoomType>;
  booking_time?: string;
}

// Interface for the book property API params
interface BookPropertyParams {
  property?: number;
  room: number;
  user?: number | string | null;
  checkin_date: string;
  checkout_date: string;
  status: string;
  discount: number;
  price: number;
  offer_id: number;
  booking_type: string;
  payment_type: string;
  number_of_guests: number;
  number_of_rooms: number;
  booking_time: string;
  token?: string;
}



// Add interface for booking room types
interface BookingRoomType {
  [key: string]: number;
}

export default function Bookings() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [isDocumentListModalOpen, setIsDocumentListModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [users, setUsers] = useState<User[]>([])
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [openStartDate, setOpenStartDate] = useState(false)
  const [openEndDate, setOpenEndDate] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<Booking | null>(null)

  const getBookingsData = useCallback(async () => {
    console.log("Fetching bookings data...")
    setIsLoadingBookings(true)
    
    try {
      const bookingsResponse = await fetchBookings()
      
      let processedBookings: Booking[] = []
      
      if (Array.isArray(bookingsResponse)) {
        processedBookings = bookingsResponse
      } else if (bookingsResponse && typeof bookingsResponse === 'object' && 'results' in (bookingsResponse as any)) {
        processedBookings = (bookingsResponse as any).results
      } else {
        processedBookings = []
      }
      
      console.log("Processed bookings:", processedBookings)
      
      const normalizedBookings: Booking[] = processedBookings.map((booking: any): Booking => {
        return {
          ...booking,
          property: (booking.property !== null && typeof booking.property === 'object') ? booking.property : null,
          user: (booking.user !== null && typeof booking.user === 'object') ? booking.user : null
        }
      })
      
      const propertiesResponse = await fetchProperties()
      let properties: any[] = []
      
      if (Array.isArray(propertiesResponse)) {
        properties = propertiesResponse
      } else if (propertiesResponse && typeof propertiesResponse === 'object' && 'results' in (propertiesResponse as any)) {
        properties = (propertiesResponse as any).results
      } else {
        properties = []
      }
      
      const usersResponse = await fetchUsers()
      let users: any[] = []
      
      if (Array.isArray(usersResponse)) {
        users = usersResponse
      } else if (usersResponse && typeof usersResponse === 'object' && 'results' in (usersResponse as any)) {
        users = (usersResponse as any).results
      } else {
        users = []
      }
      
      setBookings(normalizedBookings)
      setProperties(properties)
      setUsers(users)
    } catch (error) {
      console.error("Error fetching booking data:", error)
      setBookings([])
      setProperties([])
      setUsers([])
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

  const handleAddBooking = async (bookingData: Omit<BookPropertyParams, 'token'>) => {
    console.log('Adding new booking:', bookingData)
    const token = localStorage.getItem('accessToken')
    if (!token) {
      toast.error('Please log in to book')
      return
    }
    
    try {
      const response = await bookProperty({
        ...bookingData,
        token,
        user: bookingData.user ? String(bookingData.user) : null
      })
      console.log('Booking Response:', response)
      setIsAddModalOpen(false)
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

  // Function to filter bookings based on search term and date range
  const filteredBookings = bookings.filter(booking => {
    // Search term filter
    const searchTermLower = searchTerm.toLowerCase()
    const guestMatch = booking.user && typeof booking.user === 'object' && 
      (booking.user.name?.toLowerCase().includes(searchTermLower) || 
       booking.user.mobile?.toLowerCase().includes(searchTermLower) ||
       booking.user.email?.toLowerCase().includes(searchTermLower))
    
    const paymentTypeMatch = booking.payment_type?.toLowerCase().includes(searchTermLower)
    const bookingTimeMatch = booking.booking_time?.toLowerCase().includes(searchTermLower)
    const propertyMatch = booking.property && typeof booking.property === 'object' && 
      booking.property.name?.toLowerCase().includes(searchTermLower)
    
    const matchesSearch = !searchTerm || guestMatch || paymentTypeMatch || bookingTimeMatch || propertyMatch
    
    // Date range filter
    let matchesDateRange = true
    
    if (startDate) {
      // Convert to local date strings for consistent comparison
      const checkinDateStr = booking.checkin_date
      const checkinDateLocal = new Date(checkinDateStr)
      // Reset hours to ensure we're comparing dates only
      checkinDateLocal.setHours(0, 0, 0, 0)
      const startDateLocal = new Date(startDate)
      startDateLocal.setHours(0, 0, 0, 0)
      matchesDateRange = matchesDateRange && checkinDateLocal >= startDateLocal
    }
    
    if (endDate) {
      // Convert to local date strings for consistent comparison
      const checkoutDateStr = booking.checkout_date
      const checkoutDateLocal = new Date(checkoutDateStr)
      // Reset hours to ensure we're comparing dates only
      checkoutDateLocal.setHours(0, 0, 0, 0)
      const endDateLocal = new Date(endDate)
      endDateLocal.setHours(0, 0, 0, 0)
      matchesDateRange = matchesDateRange && checkoutDateLocal <= endDateLocal
    }
    
    return matchesSearch && matchesDateRange
  })
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const shouldShowPagination = filteredBookings.length > itemsPerPage
  
  const paginatedBookings = shouldShowPagination 
    ? filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredBookings
  
  // Generate page numbers for pagination display
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
  
  // Reset current page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, startDate, endDate])

  const clearFilters = () => {
    setSearchTerm('')
    setStartDate(undefined)
    setEndDate(undefined)
  }

  // Function to render the booking room types
  const renderBookingRoomTypes = (roomTypes: Array<BookingRoomType> | undefined) => {
    if (!roomTypes || roomTypes.length === 0) return "No room types data";
    
    return (
      <div className="space-y-2">
        {roomTypes.map((roomType, index) => {
          const roomId = Object.keys(roomType)[0];
          const quantity = roomType[roomId];
          
          // Find room details from property
          let roomName = `Room ${roomId}`;
          if (bookingDetails?.property && typeof bookingDetails.property === 'object' && bookingDetails.property.rooms) {
            const room = bookingDetails.property.rooms.find(r => r.id.toString() === roomId);
            if (room) {
              roomName = room.name || roomName;
            }
          }
          
          return (
            <div key={index} className="flex justify-between items-center border-b pb-2">
              <span>{roomName}</span>
              <span>× {quantity}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Add function to handle invoice download
  const handleDownloadInvoice = (booking: Booking) => {
    try {
      // Extract property details to match expected BookingData format
      let propertyDetails: any = null;
      if (booking.property && typeof booking.property === 'object') {
        propertyDetails = booking.property;
      } else if (typeof booking.property === 'number') {
        propertyDetails = properties.find(p => p.id === booking.property);
      }
      
      // Extract user details
      let userDetails: any = null;
      if (booking.user && typeof booking.user === 'object') {
        userDetails = booking.user;
      } else if (typeof booking.user === 'number') {
        userDetails = users.find(u => u.id === booking.user);
      }
      
      // Format booking data for the invoice generator
      const bookingData = {
        id: booking.id,
        property: propertyDetails,
        user: userDetails || { name: 'Guest', email: 'guest@example.com', mobile: '' },
        status: booking.status,
        booking_time: booking.booking_time || booking.booking_type,
        checkin_date: booking.checkin_date,
        checkout_date: booking.checkout_date,
        checkin_time: booking.checkin_time,
        checkout_time: booking.checkout_time,
        number_of_guests: booking.number_of_guests || 1,
        number_of_rooms: booking.number_of_rooms || 1,
        price: booking.price,
        discount: booking.discount || '0',
        room: booking.room,
        booking_room_types: booking.booking_room_types,
        created_at: booking.created_at,
        payment_type: booking.payment_type
      };
      
      // Generate and download the PDF invoice
      const doc = generatePDFInvoice(bookingData as any);
      doc.save(`invoice-${booking.id}.pdf`);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="neutral" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Booking
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new booking</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Box */}
        <div className="relative md:col-span-5">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by guest, payment type, booking time..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Date Filters */}
        <div className="flex space-x-2 md:col-span-6">
          {/* Start Date */}
          <div className="flex-1">
            <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
              <PopoverTrigger asChild>
                <Button variant="neutral" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date)
                    setOpenStartDate(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* End Date */}
          <div className="flex-1">
            <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
              <PopoverTrigger asChild>
                <Button variant="neutral" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date)
                    setOpenEndDate(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Clear Filters */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="neutral" 
                  size="icon"
                  onClick={clearFilters}
                  disabled={!searchTerm && !startDate && !endDate}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear all filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Booking Time</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingBookings ? (
              <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                <div className="flex justify-center items-center h-[70vh]">
                  <Spinner className="h-12 w-12" />
                </div>
              </TableCell>
            </TableRow>
            ) : paginatedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.property && typeof booking.property === 'object' ? booking.property.name : ''}
                  </TableCell>
                  <TableCell>
                    {booking.user && typeof booking.user === 'object' ? booking.user.mobile : ''}
                  </TableCell>
                  <TableCell>{format(new Date(booking.created_at), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{format(new Date(booking.checkin_date), 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as any)}
                      className="border rounded px-2 py-1 w-full max-w-[120px]"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="checked_in">Checked In</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </TableCell>
                  <TableCell>₹{booking.price}</TableCell>
                  <TableCell>{booking.booking_time}</TableCell>
                  <TableCell>{booking.payment_type}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="neutral" size="icon" onClick={() => {
                              setSelectedBooking(booking)
                              setIsEditModalOpen(true)
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit booking</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="neutral" size="icon" onClick={() => {
                              setSelectedBooking(booking)
                              setIsDocumentModalOpen(true)
                            }}>
                              <Upload className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Upload documents</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="neutral" size="icon" onClick={() => {
                              setSelectedBooking(booking)
                              setIsDocumentListModalOpen(true)
                            }}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View documents</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="neutral" size="icon" onClick={() => {
                              setBookingDetails(booking)
                              setIsInfoModalOpen(true)
                            }}>
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View detailed information</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="neutral" 
                              size="icon" 
                              onClick={() => handleDownloadInvoice(booking)}
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download invoice</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
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

      <BookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBooking}
        title="Add New Booking"
        properties={properties}
        users={users}
        onBookingAction={getBookingsData}
      />

      {selectedBooking && (
        <BookingModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateBooking}
          title="Edit Booking"
          initialData={selectedBooking}
          properties={properties}
          users={users}
          onBookingAction={getBookingsData}
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
              <div className="flex justify-center items-center h-[70vh]">
                <Spinner className="h-12 w-12" />
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
                        <p className="font-medium">{document.document?.split('/').pop()}</p>
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
                        variant="neutral"
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

      {/* Add Booking Details Modal */}
      {bookingDetails && (
        <GenericModal
          isOpen={isInfoModalOpen}
          onClose={() => {
            setIsInfoModalOpen(false)
            setBookingDetails(null)
          }}
          title="Booking Details"
          description={`Detailed information for Booking #${bookingDetails.id}`}
        >
          <div className="max-h-[70vh] overflow-y-auto p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Property Information</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><span className="font-medium">Name:</span> {bookingDetails.property && typeof bookingDetails.property === 'object' ? bookingDetails.property.name : 'N/A'}</p>
                    <p><span className="font-medium">Location:</span> {bookingDetails.property && typeof bookingDetails.property === 'object' && bookingDetails.property.location ? bookingDetails.property.location : 'N/A'}</p>
                    <p><span className="font-medium">Type:</span> {bookingDetails.property && typeof bookingDetails.property === 'object' && bookingDetails.property.property_type ? bookingDetails.property.property_type : 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Guest Information</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><span className="font-medium">Name:</span> {bookingDetails.user && typeof bookingDetails.user === 'object' ? bookingDetails.user.name : 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {bookingDetails.user && typeof bookingDetails.user === 'object' ? bookingDetails.user.email : 'N/A'}</p>
                    <p><span className="font-medium">Mobile:</span> {bookingDetails.user && typeof bookingDetails.user === 'object' ? bookingDetails.user.mobile : 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Room Details</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><span className="font-medium">Number of Rooms:</span> {bookingDetails.number_of_rooms || 'N/A'}</p>
                    <p><span className="font-medium">Number of Guests:</span> {bookingDetails.number_of_guests || 'N/A'}</p>
                    
                    {bookingDetails.booking_room_types && (
                      <div>
                        <p className="font-medium mt-2 mb-1">Rooms Booked:</p>
                        {renderBookingRoomTypes(bookingDetails.booking_room_types)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Booking Information</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><span className="font-medium">Booking Type:</span> {bookingDetails.booking_type}</p>
                    <p><span className="font-medium">Booking Time:</span> {bookingDetails.booking_time}</p>
                    <p><span className="font-medium">Status:</span> {bookingDetails.status}</p>
                    <p><span className="font-medium">Payment Method:</span> {bookingDetails.payment_type}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Date & Time</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><span className="font-medium">Check-in Date:</span> {bookingDetails.checkin_date}</p>
                    <p><span className="font-medium">Check-out Date:</span> {bookingDetails.checkout_date}</p>
                    <p><span className="font-medium">Check-in Time:</span> {bookingDetails.checkin_time}</p>
                    <p><span className="font-medium">Check-out Time:</span> {bookingDetails.checkout_time}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Payment Information</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><span className="font-medium">Price:</span> ₹{bookingDetails.price}</p>
                    <p><span className="font-medium">Discount:</span> ₹{bookingDetails.discount}</p>
                    <p><span className="font-medium">Total:</span> ₹{parseFloat(bookingDetails.price) - parseFloat(bookingDetails.discount || '0')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GenericModal>
      )}
    </div>
  )
}