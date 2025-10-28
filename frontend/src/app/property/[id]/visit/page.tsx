'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarDays, ArrowLeft, MapPin, Phone, Mail, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from 'react-toastify'
import { fetchProperty } from '@/lib/api/fetchProperty'
import { Property } from '@/types/property'
import { LoadingIndicator } from '@/components/ui/LoadingIndicator'
import Image from 'next/image'
import { bookVisit } from '@/lib/api/visitManagement'

export default function VisitBookingPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = Number(params.id)

  const [property, setProperty] = useState<Property | null>(null)
  const [visitName, setVisitName] = useState("")
  const [visitPhone, setVisitPhone] = useState("")
  const [visitDate, setVisitDate] = useState<Date | undefined>(undefined)
  const [visitTime, setVisitTime] = useState<string>("12")
  const [visitGuests, setVisitGuests] = useState(1)
  const [visitNotes, setVisitNotes] = useState("")
  const [bookingVisit, setBookingVisit] = useState(false)
  const [loading, setLoading] = useState(true)

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const formatTime = (hour: number | string) => {
    try {
      const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
      if (isNaN(hourNum)) return "12:00 PM";

      return hourNum === 0 ? "12:00 AM" :
        hourNum < 12 ? `${hourNum}:00 AM` :
          hourNum === 12 ? "12:00 PM" :
            `${hourNum - 12}:00 PM`;
    } catch (error) {
      console.error("Time formatting error:", error);
      return "12:00 PM";
    }
  }

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const data = await fetchProperty(propertyId.toString())
        setProperty(data)
      } catch (error) {
        console.error('Error loading property:', error)
        toast.error('Failed to load property details')
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      loadProperty()
    }
  }, [propertyId])

  const handleBookVisit = async () => {
    if (!visitName.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!visitPhone.trim()) {
      toast.error('Please enter your phone number')
      return
    }
    if (!visitDate || !visitTime) {
      toast.error('Please select visit date and time')
      return
    }

    try {
      setBookingVisit(true)
      
      await bookVisit({
        property: propertyId,
        name: visitName,
        phone: visitPhone,
        visit_date: format(visitDate, 'yyyy-MM-dd'),
        visit_time: `${visitTime}:00`,
        number_of_guests: visitGuests,
        notes: visitNotes
      })

      toast.success('Visit booked successfully! We will contact you soon.')
      router.push(`/property/${propertyId}`)
    } catch (error: any) {
      console.error('Error booking visit:', error)
      toast.error(error.message || 'Failed to book visit. Please try again.')
    } finally {
      setBookingVisit(false)
    }
  }

  if (loading) {
    return <LoadingIndicator />
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Property
          </Button>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule a Visit</h1>
          <p className="text-gray-600">Book a visit to see this property in person</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <div className="relative h-48 w-full rounded-t-lg overflow-hidden">
                <Image
                  src={property.images?.[0]?.image || property.images?.[0]?.image_url || '/placeholder.jpg'}
                  alt={property.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{property.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{property.location}</p>
                    <p className="text-sm text-gray-500">
                      {property.area}{property.city && `, ${property.city.name}`}{property.state && `, ${property.state.name}`}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Our team will contact you to confirm your visit time and provide additional details.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Visit Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Visit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Your Name */}
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={visitName}
                    onChange={(e) => setVisitName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={visitPhone}
                    onChange={(e) => setVisitPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-1"
                    required
                  />
                </div>

                {/* Visit Date */}
                <div>
                  <Label>Visit Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="neutral"
                        className={cn(
                          "w-full mt-1 justify-start text-left font-normal",
                          !visitDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {visitDate ? format(visitDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={visitDate}
                        onSelect={setVisitDate}
                        disabled={(date: Date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return date < today
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Visit Time */}
                <div>
                  <Label>Visit Time *</Label>
                  <Select value={visitTime} onValueChange={setVisitTime}>
                    <SelectTrigger className="mt-1">
                      <SelectValue>{formatTime(parseInt(visitTime))}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour.toString()}>
                          {formatTime(hour)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of Guests */}
                <div>
                  <Label htmlFor="guests">Number of Guests *</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="10"
                    value={visitGuests}
                    onChange={(e) => setVisitGuests(parseInt(e.target.value) || 1)}
                    className="mt-1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum 10 guests per visit</p>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements or questions..."
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="neutral"
                    className="flex-1"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#B11E43] hover:bg-[#8f1836]"
                    onClick={handleBookVisit}
                    disabled={bookingVisit || !visitDate}
                  >
                    {bookingVisit ? 'Scheduling...' : 'Confirm Visit'}
                  </Button>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">What to expect:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>We'll contact you within 24 hours to confirm your visit</li>
                        <li>A property representative will show you around</li>
                        <li>You can ask any questions about the property</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer sectionType={property.property_type === 'hostel' ? 'hostels' : 'hotels'} />
    </div>
  )
}
