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
  offer_id: number;
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
  const monthsParam = searchParams.get('months') || '1';
  const yearsParam = searchParams.get('years') || '1';

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
            monthly_rate: room.monthly_rate,
            yearly_rate: room.yearly_rate,
            price: bookingTypeParam === 'hourly' ? room.hourly_rate : 
                   bookingTypeParam === 'monthly' ? room.monthly_rate :
                   bookingTypeParam === 'yearly' ? room.yearly_rate : room.daily_rate,
            priceType: typeof (bookingTypeParam === 'hourly' ? room.hourly_rate : 
                              bookingTypeParam === 'monthly' ? room.monthly_rate :
                              bookingTypeParam === 'yearly' ? room.yearly_rate : room.daily_rate),
            parsedPrice: bookingTypeParam === 'hourly' 
              ? (room.hourly_rate ? parseFloat(room.hourly_rate) : 'N/A')
              : bookingTypeParam === 'monthly'
              ? (room.monthly_rate ? parseFloat(room.monthly_rate) : 'N/A')
              : bookingTypeParam === 'yearly'
              ? (room.yearly_rate ? parseFloat(room.yearly_rate) : 'N/A')
              : (room.daily_rate ? parseFloat(room.daily_rate) : 'N/A'),
            discount: room.discount
          });
        });
      }
      
      // Add price field based on booking type
      const normalizePropertyImages = (images: any[] = []) =>
        images.map((img: any) => {
          const normalizedCategory =
            img && typeof img.category === 'object'
              ? img.category
              : null

          return {
            ...img,
            category: normalizedCategory,
          }
        })

      const normalizedRooms = Array.isArray(data?.rooms)
        ? data.rooms.map((room: any) => ({
            ...room,
            images: normalizePropertyImages(room.images),
            roomImages: room.roomImages,
            price:
              bookingTypeParam === 'hourly'
                ? room.hourly_rate
                : bookingTypeParam === 'monthly'
                ? room.monthly_rate
                : bookingTypeParam === 'yearly'
                ? room.yearly_rate
                : room.daily_rate,
          }))
        : []

      const normalizedProperty: Property = {
        ...(data as Property),
        images: normalizePropertyImages(data?.images),
        rooms: normalizedRooms,
      }

      setProperty(normalizedProperty)
      if (normalizedProperty.rooms && normalizedProperty.rooms.length > 0) {
        setSelectedRoom(normalizedProperty.rooms[0]) // Select the first room by default
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

  // Calculate offer discount (should be applied to totalPrice, not discountedPrice)
  const calculateOfferDiscount = (price: number) => {
    if (!selectedOffer) return 0;
    
    const discountPercentage = parseFloat(selectedOffer.discount_percentage);
    if (isNaN(discountPercentage)) return 0;
    
    return price * (discountPercentage / 100);
  };

  // Calculate total base price (before discounts) across all selected rooms
  const calculateBaseTotalPrice = () => {
    let total = 0;
    
    // Calculate duration of stay based on booking type
    let duration = 1;
    if (booking.checkIn && booking.bookingType !== 'monthly' && booking.bookingType !== 'yearly') {
      if (booking.bookingType === 'hourly' && booking.checkInTime && booking.checkOutTime) {
        // For hourly bookings, calculate hours between checkInTime and checkOutTime
        const checkInHour = parseInt(booking.checkInTime.split(':')[0], 10);
        const checkOutHour = parseInt(booking.checkOutTime.split(':')[0], 10);
        
        // Handle case where checkout time is on the next day
        duration = checkOutHour > checkInHour 
          ? checkOutHour - checkInHour 
          : (24 - checkInHour) + checkOutHour;
      } else if (booking.bookingType === 'daily' && booking.checkIn && booking.checkOut) {
        // For daily bookings, calculate days between checkIn and checkOut
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        duration = Math.max(1, diffDays); // At least 1 day
      }
    } else if (booking.bookingType === 'monthly') {
      // For monthly bookings, use the specified number of months
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      duration = Math.max(1, Math.floor(diffDays / 30)); // At least 1 month
    } else if (booking.bookingType === 'yearly') {
      // For yearly bookings, use the specified number of years
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      duration = Math.max(1, Math.floor(diffDays / 365)); // At least 1 year
    }
    
    // Use selected room details if they exist
    if (selectedRoomDetails && selectedRoomDetails.length > 0) {
      selectedRoomDetails.forEach(room => {
        if (!room.id || !room.quantity) return;
        
        const quantity = parseInt(room.quantity, 10);
        if (quantity <= 0) return;
        
        // Find the room details from property data
        const roomInfo = property?.rooms?.find((r: any) => r.id === parseInt(room.id, 10));
        if (!roomInfo) return;
        
        // Use the appropriate rate based on booking type
        let basePrice = 0;
        if (booking.bookingType === 'hourly') {
          basePrice = parseFloat(roomInfo.hourly_rate || '0');
        } else if (booking.bookingType === 'monthly') {
          basePrice = parseFloat(roomInfo.monthly_rate || '0');
        } else if (booking.bookingType === 'yearly') {
          basePrice = parseFloat(roomInfo.yearly_rate || '0');
        } else { // daily
          basePrice = parseFloat(roomInfo.daily_rate || '0');
        }
        
        // For hostels, multiple by number of guests for shared rooms
        const isHostel = property?.property_type === 'hostel';
        const guestFactor = isHostel ? parseInt(booking.guests, 10) || 1 : 1;
        
        // Add to total (base price before discounts - discounts applied later)
        total += quantity * basePrice * duration * guestFactor;
      });
    } else if (property && property.rooms && Array.isArray(property.rooms)) {
      // Use selectedRoomQuantities if no selected room details
      property.rooms.forEach((room: any) => {
        const quantity = selectedRoomQuantities[room.id] || 0;
        if (quantity <= 0) return;
        
        // Use the appropriate rate based on booking type
        let basePrice = 0;
        if (booking.bookingType === 'hourly') {
          basePrice = parseFloat(room.hourly_rate || '0');
        } else if (booking.bookingType === 'monthly') {
          basePrice = parseFloat(room.monthly_rate || '0');
        } else if (booking.bookingType === 'yearly') {
          basePrice = parseFloat(room.yearly_rate || '0');
        } else { // daily
          basePrice = parseFloat(room.daily_rate || '0');
        }
        
        // For hostels, multiple by number of guests for shared rooms
        const isHostel = property?.property_type === 'hostel';
        const guestFactor = isHostel ? parseInt(booking.guests, 10) || 1 : 1;
        
        // Add to total (base price before discounts - discounts applied later)
        total += quantity * basePrice * duration * guestFactor;
      });
    }
    
    return parseFloat(total.toFixed(2));
  };

  // Calculate average discount from all selected rooms (matching BookingCard logic)
  const calculateAverageDiscount = () => {
    let totalQuantity = 0;
    let weightedDiscount = 0;

    if (selectedRoomDetails && selectedRoomDetails.length > 0) {
      selectedRoomDetails.forEach(room => {
        if (!room.id || !room.quantity) return;
        const quantity = parseInt(room.quantity, 10);
        if (quantity <= 0) return;
        
        const roomInfo = property?.rooms?.find((r: any) => r.id === parseInt(room.id, 10));
        if (!roomInfo) return;
        
        const discount = parseFloat(roomInfo.discount || '0');
        totalQuantity += quantity;
        weightedDiscount += discount * quantity;
      });
    } else if (property && property.rooms && Array.isArray(property.rooms)) {
      property.rooms.forEach((room: any) => {
        const quantity = selectedRoomQuantities[room.id] || 0;
        if (quantity <= 0) return;
        
        const discount = parseFloat(room.discount || '0');
        totalQuantity += quantity;
        weightedDiscount += discount * quantity;
      });
    }

    if (totalQuantity === 0) return 0;
    return weightedDiscount / totalQuantity;
  };

  // Calculate total price (matching BookingCard logic)
  const calculateTotalPrice = () => {
    return calculateBaseTotalPrice();
  };

  // Calculate discounted price after room discounts
  const calculateDiscountedPrice = () => {
    const totalPrice = calculateTotalPrice();
    const averageDiscount = calculateAverageDiscount();
    return totalPrice - (totalPrice * averageDiscount / 100);
  };
  
  // Get final price after offer discount and dynamic tax (matching BookingCard logic)
  const getFinalPrice = () => {
    const totalPrice = calculateTotalPrice();
    const averageDiscount = calculateAverageDiscount();
    const discountedPrice = totalPrice - (totalPrice * averageDiscount / 100);
    
    // Calculate offer discount on totalPrice (matching BookingCard)
    const offerDiscount = selectedOffer 
      ? (totalPrice * parseFloat(selectedOffer.discount_percentage || '0')) / 100 
      : 0;
    
    // Calculate taxable base per unit (after discounts and offer)
    const taxableBasePerUnit = Math.max(discountedPrice - offerDiscount, 0);
    
    // Calculate booking and guest multipliers for monthly/yearly bookings
    const bookingMultiplier = (bookingTypeParam === 'monthly' && parseInt(monthsParam) > 0) 
      ? parseInt(monthsParam) 
      : (bookingTypeParam === 'yearly' && parseInt(yearsParam) > 0) 
        ? parseInt(yearsParam) 
        : 1;
    
    const guestMultiplier = parseInt(guestsParam) > 0 ? parseInt(guestsParam) : 1;
    
    // Calculate total taxable base (for determining tax rate)
    const totalTaxableBase = taxableBasePerUnit * bookingMultiplier * guestMultiplier;
    
    // Dynamic tax rate: 5% if < 7500, 18% if >= 7500
    const taxRate = totalTaxableBase <= 0 
      ? 0 
      : totalTaxableBase < 7500 
        ? 0.05 
        : 0.18;
    
    // Calculate taxes on taxable base per unit
    const taxes = taxableBasePerUnit * taxRate;
    
    // Final price = taxable base per unit + taxes
    const finalPrice = taxableBasePerUnit + taxes;
    
    return {
      baseTotal: totalPrice,
      discountedPrice,
      offerDiscount,
      taxableBasePerUnit,
      taxes,
      finalPrice,
      taxRate
    };
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
    const priceDetails = getFinalPrice();
    const totalPrice = priceDetails.finalPrice;
    
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
        offer_id: selectedOffer?.id || 0,
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
                price: booking.bookingType === 'hourly' ? room.hourly_rate : 
                       booking.bookingType === 'monthly' ? room.monthly_rate :
                       booking.bookingType === 'yearly' ? room.yearly_rate : room.daily_rate,
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
        offer_id: selectedOffer?.id || 0,
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
      bookingData.offer_discount = priceDetails.offerDiscount;
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
    let price;
    if (booking.bookingType === 'hourly') {
      price = room.hourly_rate;
    } else if (booking.bookingType === 'monthly') {
      price = room.monthly_rate;
    } else if (booking.bookingType === 'yearly') {
      price = room.yearly_rate;
    } else {
      price = room.daily_rate;
    }
    
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
      
      // Close the dialog and refresh the page to load with authenticated state
      setShowSignIn(false)
      window.location.reload()
    } else {
      setShowSignIn(false)
    }
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto shadow-lg border border-gray-100 rounded-xl">
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
                    <div className="flex items-center justify-between w-full pr-2 border border-gray-100 rounded-md px-3 py-2 bg-gray-50 shadow-sm">
                      <span className="text-sm">{booking.checkIn ? format(parseISO(booking.checkIn), 'dd MMM yyyy') : 'Select date'}</span>
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Check-out Date - shown only for daily bookings (not hourly, monthly, or yearly) */}
                {bookingTypeParam !== 'hourly' && bookingTypeParam !== 'monthly' && bookingTypeParam !== 'yearly' && (
                  <div>
                    <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">Check-out Date</label>
                    <div className="relative mt-1">
                      <div className="flex items-center justify-between w-full pr-2 border border-gray-100 rounded-md px-3 py-2 bg-gray-50 shadow-sm">
                        <span className="text-sm">{booking.checkOut ? format(parseISO(booking.checkOut), 'dd MMM yyyy') : 'Select date'}</span>
                        <CalendarDays className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Auto-calculated Check-out Date - shown for monthly and yearly bookings */}
                {(bookingTypeParam === 'monthly' || bookingTypeParam === 'yearly') && (
                  <div>
                    <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">
                      Auto Check-out Date ({bookingTypeParam === 'yearly' ? 'Yearly' : 'Monthly'} Booking)
                    </label>
                    <div className="relative mt-1">
                      <div className="flex items-center justify-between w-full pr-2 border border-gray-100 rounded-md px-3 py-2 bg-gray-50 shadow-sm">
                        <span className="text-sm">{booking.checkOut ? format(parseISO(booking.checkOut), 'dd MMM yyyy') : 'Auto-calculated'}</span>
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
                      disabled
                      className="mt-1 bg-gray-50 border-gray-100 shadow-sm"
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
                      disabled
                      className="mt-1 bg-gray-50 border-gray-100 shadow-sm"
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
                    disabled
                    className="mt-1 bg-gray-50 border-gray-100 shadow-sm"
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
                    disabled
                    className="mt-1 bg-gray-50 border-gray-100 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booked Room Types</label>
                {/* Display if rooms were selected on previous page */}
                {selectedRoomDetails.length > 0 ? (
                  <div className="space-y-4 border border-gray-100 rounded-md p-4 shadow-sm">
                    {selectedRoomDetails.map((room, index) => (
                      <div key={room.id || index} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg shadow-sm bg-white">
                        <div>
                          <h3 className="font-medium">{room.name}</h3>
                          <div className="flex items-center text-sm text-gray-600">
                            ₹{formatPrice(parseFloat(room.price))} 
                            {bookingTypeParam === 'yearly' ? '/year' : bookingTypeParam === 'monthly' ? '/month' : bookingTypeParam === 'hourly' ? '/hour' : '/night'}
                          </div>
                        </div>
                        <div className="font-medium">
                          <Badge variant="secondary">{room.quantity} {room.quantity > 1 ? 'rooms' : 'room'}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 border border-gray-100 rounded-md p-4 shadow-sm">
                    {property?.rooms?.map((room) => {
                      const roomQty = selectedRoomQuantities[room.id] || 0;
                      
                      return (
                        <div key={room.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg shadow-sm bg-white">
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
                              disabled
                              className="opacity-70"
                            >
                              -
                            </Button>
                            <span className="w-6 text-center">{roomQty}</span>
                            <Button 
                              type="button"
                              variant="neutral" 
                              size="sm"
                              onClick={() => handleRoomQuantityChange(room.id, 1)}
                              disabled
                              className="opacity-70"
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
                  <div className="border border-gray-100 rounded-md p-4 shadow-sm">
                    {selectedOffer ? (
                      <div className="flex items-center justify-between p-2 border border-gray-100 rounded-md shadow-sm bg-white">
                        <div>
                          <p className="font-medium">{selectedOffer.code}</p>
                          <p className="text-sm text-gray-500">{selectedOffer.title}</p>
                          <p className="text-sm text-green-600">-{selectedOffer.discount_percentage}% discount</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedOffer(null)}
                          className="p-1"
                          disabled
                        >
                          <X className="h-4 w-4 text-gray-500" />
                          <span className="sr-only">Remove offer</span>
                        </button>
                      </div>
                    ) : (
                      <Select onValueChange={handleOfferChange} disabled>
                        <SelectTrigger className="bg-gray-50 border-gray-100 shadow-sm">
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
              <div className="pt-4 border-t border-gray-100">
                {(() => {
                  const priceDetails = getFinalPrice();
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Room charges</span>
                        <span>₹{priceDetails.baseTotal.toFixed(2)}</span>
                      </div>
                      
                      {priceDetails.discountedPrice < priceDetails.baseTotal && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-₹{(priceDetails.baseTotal - priceDetails.discountedPrice).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {selectedOffer && priceDetails.offerDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Offer discount ({selectedOffer.code})</span>
                          <span>-₹{priceDetails.offerDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span>Taxes ({(priceDetails.taxRate * 100).toFixed(0)}%)</span>
                        <span>₹{priceDetails.taxes.toFixed(2)}</span>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>₹{priceDetails.finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-between items-center space-x-4">
                <Button 
                  type="button" 
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-100 shadow-sm"
                  onClick={() => router.back()}
                >
                  Modify Booking
                </Button>
                
                {isLoggedIn ? (
                  <Button 
                    type="submit" 
                    className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white shadow-md"
                  >
                    Confirm Booking
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white shadow-md"
                    onClick={() => setShowSignIn(true)}
                  >
                    Sign in to Book
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer sectionType="hotels" />
      
      {/* Login dialog */}
      <LoginDialog 
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}

