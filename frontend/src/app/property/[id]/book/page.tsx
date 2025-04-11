'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Property } from '@/types/property'
import { fetchProperty } from '@/lib/api/fetchProperty'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { bookProperty } from '@/lib/api/bookProperty'
import { LoadingIndicator } from '@/components/ui/LoadingIndicator'
import { CalendarDays, X } from "lucide-react"
import { format, parseISO } from 'date-fns'
import { Separator } from "@/components/ui/separator"
import { LoginDialog } from '@/components/LoginDialog'

const capitalize = (s: string) => s && String(s[0]).toUpperCase() + String(s).slice(1)

// Update the BookPropertyParams interface to include booking_room_types
interface BookPropertyParams {
  property?: number;
  room: number;
  user?: string | null;
  checkin_date: string;
  checkout_date: string;
  checkin_time: string;
  checkout_time: string;
  status: string;
  discount: number;
  price: number;
  booking_type: string;
  payment_type: string;
  number_of_guests: number;
  number_of_rooms: number;
  booking_time: string;
  token?: string;
  booking_room_types?: Array<Record<string, number>>;
  offer_code?: string;
  offer_discount?: number;
}

interface Offer {
  id: number;
  code: string;
  title: string;
  discount_percentage: string;
}

export default function BookProperty() {
  const params = useParams()
  const router = useRouter()
  const propertyId = Number(params.id)
  const searchParams = useSearchParams()

  const [property, setProperty] = useState<Property | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<any>(null) // type it later
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false) // Track login status
  const [showSignIn, setShowSignIn] = useState<boolean>(false) // State for SignIn modal
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null) // Track selected offer

  const checkInDateParam = searchParams.get('checkInDate') || '';
  const checkOutDateParam = searchParams.get('checkOutDate') || '';
  const checkInTimeParam = searchParams.get('checkInTime') || '';
  const checkOutTimeParam = searchParams.get('checkOutTime') || '';
  const guestsParam = searchParams.get('guests') || '1';
  const bookingTypeParam = searchParams.get('bookingType') || 'daily';
  const roomsParam = searchParams.get('rooms') || '1';
  const selectedRoomsParam = searchParams.get('selectedRooms') || '';
  const selectedOfferParam = searchParams.get('selectedOffer') || '';

  // Parse selected rooms from URL parameter
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<any[]>([]);
  
  useEffect(() => {
    if (selectedRoomsParam) {
      try {
        const parsedRooms = JSON.parse(selectedRoomsParam);
        setSelectedRoomDetails(parsedRooms);
        console.log("Parsed selected rooms:", parsedRooms);
        
        // Initialize room quantities based on the parsed data
        if (Array.isArray(parsedRooms) && parsedRooms.length > 0) {
          const initialQuantities: Record<number, number> = {};
          parsedRooms.forEach(room => {
            if (room.id && room.quantity) {
              initialQuantities[room.id] = room.quantity;
            }
          });
          setSelectedRoomQuantities(initialQuantities);
        }
      } catch (error) {
        console.error("Error parsing selected rooms:", error);
      }
    }
  }, [selectedRoomsParam]);

  // Track selected room quantities
  const [selectedRoomQuantities, setSelectedRoomQuantities] = useState<Record<number, number>>({});
  const [totalRoomsSelected, setTotalRoomsSelected] = useState(parseInt(roomsParam) || 1);

  useEffect(() => {
    // Check for token to determine login status (example - adjust as per your auth method)
    const token = localStorage.getItem('accessToken'); // Or however you store your token
    setIsLoggedIn(!!token); // Set isLoggedIn based on token presence

    // Fetch property details
    fetchProperty(propertyId.toString()).then((data) => {
      console.log('Property data:', data);
      if (data && data.rooms) {
        console.log('Room data:', data.rooms);
        
        // Initialize room quantities
        const initialQuantities: Record<number, number> = {};
        
        // If we have a rooms parameter and at least one room
        if (parseInt(roomsParam) > 0 && data.rooms.length > 0) {
          // Default: assign all requested rooms to the first room type
          initialQuantities[data.rooms[0].id] = parseInt(roomsParam);
        }
        
        setSelectedRoomQuantities(initialQuantities);
        
        data.rooms.forEach((room: any, index: number) => {
          console.log(`Room ${index}:`, {
            id: room.id,
            name: room.name || room.occupancyType,
            daily_rate: room.daily_rate,
            hourly_rate: room.hourly_rate,
            price: bookingTypeParam === 'hourly' ? room.hourly_rate : room.daily_rate,
            priceType: typeof (bookingTypeParam === 'hourly' ? room.hourly_rate : room.daily_rate),
            parsedPrice: bookingTypeParam === 'hourly' 
              ? (room.hourly_rate ? parseFloat(room.hourly_rate) : 'N/A')
              : (room.daily_rate ? parseFloat(room.daily_rate) : 'N/A'),
            discount: room.discount
          });
        });
      }
      
      // Add price field based on booking type
      if (data && data.rooms) {
        data.rooms = data.rooms.map((room: any) => ({
          ...room,
          price: bookingTypeParam === 'hourly' ? room.hourly_rate : room.daily_rate
        }));
      }
      
      setProperty(data)
      if (data?.rooms && Array.isArray(data.rooms) && data.rooms.length > 0) {
        setSelectedRoom(data.rooms[0]) // Select the first room by default
      }
    })
  }, [propertyId, bookingTypeParam, roomsParam])

  const [booking, setBooking] = useState({
    checkIn: checkInDateParam,
    checkOut: checkOutDateParam,
    checkInTime: checkInTimeParam,
    checkOutTime: checkOutTimeParam,
    guests: guestsParam,
    roomId: selectedRoom?.id,
    checkInDate: checkInDateParam,
    checkOutDate: checkOutDateParam,
    bookingType: bookingTypeParam,
    rooms: roomsParam
  })

  useEffect(() => {
    // Update roomId in booking state when selectedRoom changes
    setBooking(prevBooking => ({
      ...prevBooking,
      roomId: selectedRoom?.id,
      roomType: selectedRoom?.name || selectedRoom?.occupancyType // Keep roomType for display if needed
    }))
  }, [selectedRoom?.id, selectedRoom?.name, selectedRoom?.occupancyType])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBooking(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setBooking(prev => ({ ...prev, [name]: value }))
  }

  // Parse selected offer from URL parameter
  useEffect(() => {
    if (selectedOfferParam) {
      try {
        const parsedOffer = JSON.parse(selectedOfferParam);
        setSelectedOffer(parsedOffer);
        console.log("Parsed selected offer:", parsedOffer);
      } catch (error) {
        console.error("Error parsing selected offer:", error);
      }
    }
  }, [selectedOfferParam]);

  // Calculate offer discount
  const calculateOfferDiscount = (price: number) => {
    if (!selectedOffer) return 0;
    
    const discountPercentage = parseFloat(selectedOffer.discount_percentage);
    if (isNaN(discountPercentage)) return 0;
    
    return price * (discountPercentage / 100);
  };

  // Calculate total price across all selected rooms with quantities, discounts, and offers
  const calculateTotalPrice = () => {
    let total = 0;
    
    if (property && property.rooms && Array.isArray(property.rooms)) {
      property.rooms.forEach((room: any) => {
        const quantity = selectedRoomQuantities[room.id] || 0;
        if (quantity > 0) {
          const basePrice = booking.bookingType === 'hourly' 
            ? parseFloat(room.hourly_rate || '0') 
            : parseFloat(room.daily_rate || '0');
          const discount = parseFloat(room.discount || '0');
          const discountedPrice = basePrice * (1 - (discount / 100));
          total += quantity * discountedPrice;
        }
      });
    }
    
    return parseFloat(total.toFixed(2));
  };
  
  // Get final price after offer discount
  const getFinalPrice = () => {
    const baseTotal = calculateTotalPrice();
    const offerDiscount = calculateOfferDiscount(baseTotal);
    const taxes = baseTotal * 0.18; // 18% GST
    
    return baseTotal - offerDiscount + taxes;
  };

  // Handle offer change
  const handleOfferChange = (offerId: string) => {
    if (!property) return;
    
    const propertyAny = property as any;
    if (!propertyAny.offers) return;
    
    if (offerId === '') {
      setSelectedOffer(null);
      return;
    }
    
    const offer = propertyAny.offers.find((o: any) => o.offer.code === offerId);
    if (offer) {
      setSelectedOffer({
        id: offer.id,
        code: offer.offer.code,
        title: offer.offer.title,
        discount_percentage: offer.offer.discount_percentage
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we have rooms selected from previous page, use those
    if (selectedRoomDetails.length > 0) {
      // Continue with booking using selected room details
    } else if (!selectedRoom) {
      alert('Please select a room type.')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Please log in to book.')
      return
    }
    
    // Prepare booking data based on whether we have pre-selected rooms or not
    let bookingData: BookPropertyParams;
    
    // Create extra data to store room type information
    let extraBookingData: {
      booking_room_types: Array<Record<string, number>>;
    };
    
    // Create the booking_room_types array with room id as key and quantity as value
    let bookingRoomTypes: Array<Record<string, number>> = [];
    
    // Calculate the total price for the booking
    const totalPrice = getFinalPrice();
    
    if (selectedRoomDetails.length > 0) {
      // Use the first selected room for the booking API
      // In a real app, you might want to handle multiple room types in the API
      const primaryRoom = selectedRoomDetails[0];
      
      // Create the booking_room_types array with room id as key and quantity as value
      bookingRoomTypes = selectedRoomDetails.map(room => ({
        [room.id]: room.quantity
      }));
      
      bookingData = {
        user: localStorage.getItem('userId'),
        property: propertyId,
        room: primaryRoom.id,
        price: totalPrice,
        discount: 0, // We would need to pass this from the property page
        booking_time: booking.bookingType, // Use the selected booking type
        booking_type: 'online', // Same as booking_time
        status: 'pending', // Default status
        payment_type: 'upi', // Default payment type, can be updated later
        checkin_date: booking.checkIn,
        checkout_date: booking.bookingType === 'hourly' ? booking.checkIn : booking.checkOut,
        checkin_time: booking.bookingType === 'hourly' ? booking.checkInTime : '12:00',
        checkout_time: booking.bookingType === 'hourly' ? booking.checkOutTime : '11:00',
        number_of_guests: parseInt(booking.guests, 10),
        number_of_rooms: selectedRoomDetails.reduce((total, room) => total + room.quantity, 0),
        token: token,
        booking_room_types: bookingRoomTypes
      };
      
      extraBookingData = {
        booking_room_types: bookingRoomTypes
      };
      
      // Store selected rooms details in sessionStorage for use in confirmation page
      sessionStorage.setItem('selectedRooms', JSON.stringify(selectedRoomDetails));
      // Also store booking room types for API calls from confirmation page if needed
      sessionStorage.setItem('bookingRoomTypes', JSON.stringify(bookingRoomTypes));
    } else {
      // Define a type for room data structure
      interface SelectedRoomInfo {
        id: string;
        name: string;
        quantity: number;
        price: string | number;
        discount?: string | number;
      }
      
      // Create an array of selected rooms with quantities
      const selectedRoomsWithQty: SelectedRoomInfo[] = [];
      
      // Create the booking_room_types array with room id as key and quantity as value
      bookingRoomTypes = [];
      
      if (property && property.rooms && Array.isArray(property.rooms)) {
        Object.entries(selectedRoomQuantities)
          .filter(([_, qty]) => qty > 0)
          .forEach(([roomId, qty]) => {
            const room = property.rooms?.find((r: any) => r.id.toString() === roomId);
            if (room) {
              selectedRoomsWithQty.push({
                id: roomId,
                name: room.name || 'Room',
                quantity: qty,
                price: booking.bookingType === 'hourly' ? room.hourly_rate : room.daily_rate,
                discount: room.discount
              });
              
              // Add to booking_room_types array
              bookingRoomTypes.push({
                [roomId]: qty
              });
            }
          });
      }
      
      // Store selected rooms details in sessionStorage for use in confirmation page
      sessionStorage.setItem('selectedRooms', JSON.stringify(selectedRoomsWithQty));
      // Also store booking room types for API calls from confirmation page if needed
      sessionStorage.setItem('bookingRoomTypes', JSON.stringify(bookingRoomTypes));
          
      bookingData = {
        user: localStorage.getItem('userId'),
        property: propertyId,
        room: selectedRoom.id,
        price: totalPrice,
        discount: parseFloat(selectedRoom.discount || '0'),
        booking_time: booking.bookingType, // Use the selected booking type
        booking_type: 'online', // Same as booking_time
        checkin_time: booking.checkInTime,
        checkout_time: booking.checkOutTime,
        status: 'pending', // Default status
        payment_type: 'upi', // Default payment type, can be updated later
        checkin_date: booking.checkIn,
        checkout_date: booking.checkOut,
        number_of_guests: parseInt(booking.guests, 10),
        number_of_rooms: parseInt(booking.rooms, 10),
        token: token
      };
      
      extraBookingData = {
        booking_room_types: bookingRoomTypes
      };
    }

    // Include offer information in booking data if an offer is selected
    if (selectedOffer) {
      bookingData.offer_code = selectedOffer.code;
      bookingData.offer_discount = calculateOfferDiscount(calculateTotalPrice());
    }

    console.log("Booking data:", bookingData);
    console.log("Extra booking data (room types):", extraBookingData);

    try {
      const response = await bookProperty(bookingData)
      console.log("Booking Response:", response)
      if (response) {
        router.push('/bookingconfirmation') // Redirect to confirmation on success
      } else {
        alert(`Booking failed}`) // Show error message
      }
    } catch (error: any) {
      alert(`Booking error: ${error.message}`) // Show error message
    }
  }

  const formatRoomPrice = (room: any, discount: string | number | null | undefined = 0) => {
    const price = booking.bookingType === 'hourly' ? room.hourly_rate : room.daily_rate;
    
    if (!price) return 'Price unavailable';
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice) || numPrice === 0) return 'Price unavailable';
    
    const discountValue = discount ? (typeof discount === 'string' ? parseFloat(discount) : discount) : 0;
    const discountedPrice = numPrice * (1 - (discountValue / 100));
    
    return `₹${formatPrice(discountedPrice)}`;
  };

  // New function to handle room quantity changes
  const handleRoomQuantityChange = (roomId: number, increment: number) => {
    setSelectedRoomQuantities(prev => {
      const current = prev[roomId] || 0;
      const newQuantity = Math.max(0, current + increment);
      const updated = { ...prev, [roomId]: newQuantity };
      
      // Calculate total rooms selected
      const newTotal = Object.values(updated).reduce((sum, qty) => sum + qty, 0);
      setTotalRoomsSelected(Math.max(1, newTotal)); // Ensure at least 1 room is selected
      
      // Update booking state
      setBooking(prevBooking => ({
        ...prevBooking,
        rooms: String(Math.max(1, newTotal))
      }));
      
      return updated;
    });
  };

  // Handle successful login
  const handleLoginSuccess = (name: string) => {
    // Check for token to ensure login was successful
    const token = localStorage.getItem('accessToken')
    if (token) {
      setIsLoggedIn(true)
      // Refresh the local storage values that might have been updated
      const userId = localStorage.getItem('userId')
      const userName = localStorage.getItem('name')
      
      console.log('Login successful:', { name, userId })
    }
    setShowSignIn(false)
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator 
          variant="spinner" 
          size="lg" 
          text="Loading property details..." 
        />
      </div>
    );
  }

  return (
    <>
    {!isLoggedIn ? (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <p className="text-center mb-4 text-base sm:text-lg">Please sign in to continue your booking</p>
        <Button
          className="bg-[#B11E43] text-white hover:bg-[#8f1836] w-full sm:w-auto"
          onClick={() => setShowSignIn(true)}
        >
          Sign In to Book
        </Button>
        <LoginDialog 
          isOpen={showSignIn}
          onClose={() => setShowSignIn(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    ) : ( // Conditionally render booking form based on login
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Book Your Stay at {property.name}</CardTitle>
            <CardDescription>{property.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Check-in Date - shown for all booking types */}
              <div className={`grid ${bookingTypeParam === 'hourly' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <div>
                  <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700">Check-in Date</label>
                  <div className="relative mt-1">
                    <Input
                      type="date"
                      id="checkIn"
                      name="checkIn"
                      value={booking.checkIn}
                      onChange={handleInputChange}
                      required
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    />
                    <div className="flex items-center justify-between w-full pr-2 border rounded-md px-3 py-2">
                      <span className="text-sm">{booking.checkIn ? format(parseISO(booking.checkIn), 'dd MMM yyyy') : 'Select date'}</span>
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Check-out Date - shown only for daily/monthly bookings */}
                {bookingTypeParam !== 'hourly' && (
                  <div>
                    <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">Check-out Date</label>
                    <div className="relative mt-1">
                      <Input
                        type="date"
                        id="checkOut"
                        name="checkOut"
                        value={booking.checkOut}
                        onChange={handleInputChange}
                        required
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                      />
                      <div className="flex items-center justify-between w-full pr-2 border rounded-md px-3 py-2">
                        <span className="text-sm">{booking.checkOut ? format(parseISO(booking.checkOut), 'dd MMM yyyy') : 'Select date'}</span>
                        <CalendarDays className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Check-in and Check-out Time - shown only for hourly bookings */}
              {bookingTypeParam === 'hourly' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700">Check-in Time</label>
                    <Input
                      type="time"
                      id="checkInTime"
                      name="checkInTime"
                      value={booking.checkInTime || ''}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700">Check-out Time</label>
                    <Input
                      type="time"
                      id="checkOutTime"
                      name="checkOutTime"
                      value={booking.checkOutTime || ''}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-700">Number of Guests</label>
                  <Input
                    type="number"
                    id="guests"
                    name="guests"
                    value={booking.guests}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="rooms" className="block text-sm font-medium text-gray-700">Total Rooms</label>
                  <Input
                    type="number"
                    id="rooms"
                    name="rooms"
                    value={booking.rooms}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1"
                    readOnly={selectedRoomDetails.length > 0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booked Room Types</label>
                {/* Display if rooms were selected on previous page */}
                {selectedRoomDetails.length > 0 ? (
                  <div className="space-y-4 border rounded-md p-4">
                    {selectedRoomDetails.map((room, index) => (
                      <div key={room.id || index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{room.name}</h3>
                          <div className="flex items-center text-sm text-gray-600">
                            ₹{formatPrice(parseFloat(room.price))} 
                            {bookingTypeParam === 'monthly' ? '/month' : bookingTypeParam === 'hourly' ? '/hour' : '/night'}
                          </div>
                        </div>
                        <div className="font-medium">
                          <Badge variant="secondary">{room.quantity} {room.quantity > 1 ? 'rooms' : 'room'}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 border rounded-md p-4">
                    {property?.rooms?.map((room) => {
                      const roomQty = selectedRoomQuantities[room.id] || 0;
                      
                      return (
                        <div key={room.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{room.name || room.occupancyType}</h3>
                            <div className="flex items-center text-sm text-gray-600">
                              {formatRoomPrice(room, room.discount)}
                              {room.discount && parseFloat(room.discount) > 0 && (
                                <Badge variant="secondary" className="ml-2 text-orange-600 bg-orange-50">
                                  {room.discount}% off
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button 
                              type="button"
                              variant="neutral" 
                              size="sm"
                              onClick={() => handleRoomQuantityChange(room.id, -1)}
                              disabled={roomQty <= 0}
                            >
                              -
                            </Button>
                            <span className="w-6 text-center">{roomQty}</span>
                            <Button 
                              type="button"
                              variant="neutral" 
                              size="sm"
                              onClick={() => handleRoomQuantityChange(room.id, 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Offers section */}
              {property && (property as any).offers && (property as any).offers.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apply Offer</label>
                  <div className="border rounded-md p-4">
                    {selectedOffer ? (
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="font-medium">{selectedOffer.code}</p>
                          <p className="text-sm text-gray-500">{selectedOffer.title}</p>
                          <p className="text-sm text-green-600">-{selectedOffer.discount_percentage}% discount</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedOffer(null)}
                          className="p-1"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                          <span className="sr-only">Remove offer</span>
                        </button>
                      </div>
                    ) : (
                      <Select onValueChange={handleOfferChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an offer" />
                        </SelectTrigger>
                        <SelectContent>
                          {(property as any).offers.map((offer: any) => (
                            <SelectItem key={offer.id} value={offer.offer.code}>
                              <div className="flex justify-between items-center">
                                <span>{offer.offer.code}</span>
                                <span className="text-green-600">-{offer.offer.discount_percentage}%</span>
                              </div>
                              <p className="text-sm text-gray-500">{offer.offer.title}</p>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Updated Price Breakdown */}
              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Room charges</span>
                    <span>₹{calculateTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  {selectedOffer && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Offer discount ({selectedOffer.code})</span>
                      <span>-₹{calculateOfferDiscount(calculateTotalPrice()).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>Taxes (18%)</span>
                    <span>₹{(calculateTotalPrice() * 0.18).toFixed(2)}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{getFinalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white">
                Confirm Booking
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer sectionType="hotels" />
    </div>
    )}
    </>
  )
}

