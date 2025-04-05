'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { properties } from "@/lib/dummy-data"

export default function NewBooking() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('propertyId')

  const [booking, setBooking] = useState({
    propertyId: propertyId || '',
    guestName: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    amount: '',
  })

  const [selectedProperty, setSelectedProperty] = useState<any>(null)

  useEffect(() => {
    if (propertyId) {
      const property = properties.find(p => p.id === Number(propertyId))
      setSelectedProperty(property)
      if (property) {
        setBooking(prev => ({
          ...prev,
          amount: property?.rooms?.[0]?.daily_rate?.toString() || '0',
        }))
      }
    }
  }, [propertyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBooking(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the booking data to your backend
    console.log('Booking submitted:', booking)
    router.push('/admin/bookings')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Create New Booking</h1>
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="propertyId">Property</Label>
              {selectedProperty ? (
                <Input
                  id="propertyId"
                  value={selectedProperty.name}
                  disabled
                />
              ) : (
                <select
                  id="propertyId"
                  name="propertyId"
                  value={booking.propertyId}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select a property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                name="guestName"
                value={booking.guestName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="checkIn">Check-in Date</Label>
              <Input
                id="checkIn"
                name="checkIn"
                type="date"
                value={booking.checkIn}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="checkOut">Check-out Date</Label>
              <Input
                id="checkOut"
                name="checkOut"
                type="date"
                value={booking.checkOut}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="guests">Number of Guests</Label>
              <Input
                id="guests"
                name="guests"
                type="number"
                value={booking.guests}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={booking.amount}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-[#B11E43] hover:bg-[#8f1836]">
              Create Booking
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

