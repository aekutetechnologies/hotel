'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { MapPin, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export function Hero() {
  const router = useRouter()
  const [propertyType, setPropertyType] = useState<'hotel' | 'hostel'>('hotel')
  const [bookingType, setBookingType] = useState<'hourly' | 'fullTime'>('fullTime')
  const [location, setLocation] = useState('')
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date())
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() + 1)))
  const [checkInTime, setCheckInTime] = useState('12:00')
  const [checkOutTime, setCheckOutTime] = useState('11:00')
  const [months, setMonths] = useState('1')
  const [rooms, setRooms] = useState('1')
  const [guests, setGuests] = useState('1')

  const handleSearch = () => {
    // Implement search logic here
    router.push('/search')
  }

  const renderSearchComponent = () => {
    if (propertyType === 'hotel' && bookingType === 'hourly') {
      return (
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="w-full md:w-1/4 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-1/4 justify-start text-left font-normal">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Check-in Date</span>
                  <span className="font-medium">
                    {checkInDate ? format(checkInDate, 'PPP') : "Select date"}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className="w-full md:w-1/4"
            placeholder="Check-in Time"
          />
          <Input
            type="time"
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            className="w-full md:w-1/4"
            placeholder="Check-out Time"
          />
        </div>
      )
    } else if (propertyType === 'hotel' && bookingType === 'fullTime') {
      return (
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="w-full md:w-1/3 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-1/3 justify-start text-left font-normal">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Check-in Date</span>
                  <span className="font-medium">
                    {checkInDate ? format(checkInDate, 'PPP') : "Select date"}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-1/3 justify-start text-left font-normal">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Check-out Date</span>
                  <span className="font-medium">
                    {checkOutDate ? format(checkOutDate, 'PPP') : "Select date"}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={setCheckOutDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )
    } else if (propertyType === 'hostel') {
      return (
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="w-full md:w-1/3 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-1/3 justify-start text-left font-normal">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Check-in Date</span>
                  <span className="font-medium">
                    {checkInDate ? format(checkInDate, 'PPP') : "Select date"}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Number of months" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <SelectItem key={num} value={num.toString()}>{num} Month{num > 1 ? 's' : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }
  }

  return (
    <section className="bg-gradient-to-b from-cyan-100 to-pink-100 py-20 px-4 md:px-0">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-center space-x-4 mb-6">
            <Button
              onClick={() => setPropertyType('hotel')}
              variant={propertyType === 'hotel' ? 'default' : 'outline'}
              className="w-32"
            >
              Hotel
            </Button>
            <Button
              onClick={() => setPropertyType('hostel')}
              variant={propertyType === 'hostel' ? 'default' : 'outline'}
              className="w-32"
            >
              Hostel
            </Button>
          </div>

          {propertyType === 'hotel' && (
            <div className="flex justify-center space-x-6 mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="bookingType"
                  checked={bookingType === 'hourly'}
                  onChange={() => setBookingType('hourly')}
                  className="form-radio text-primary"
                />
                <span>Hourly</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="bookingType"
                  checked={bookingType === 'fullTime'}
                  onChange={() => setBookingType('fullTime')}
                  className="form-radio text-primary"
                />
                <span>Full Time</span>
              </label>
            </div>
          )}

          <div className="space-y-4">
            {renderSearchComponent()}

            {propertyType === 'hotel' && (
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={rooms} onValueChange={setRooms}>
                  <SelectTrigger className="w-full md:w-1/2">
                    <SelectValue placeholder="Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} Room{num > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="w-full md:w-1/2">
                    <SelectValue placeholder="Guests" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} Guest{num > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleSearch}
              className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white"
            >
              <Search size={24} className="mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

