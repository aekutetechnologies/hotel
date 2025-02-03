'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Users, Clock, Info, CheckCircle2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HotelRoom, HostelRoom } from '@/types/property'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface BookingCardProps {
  propertyId: number
  propertyType: 'hotel' | 'hostel'
  rooms: (HotelRoom | HostelRoom)[]
  selectedRoom?: HotelRoom | HostelRoom
  onRoomSelect: (room: HotelRoom | HostelRoom) => void
}

export function BookingCard({
  propertyId,
  propertyType,
  rooms,
  selectedRoom,
  onRoomSelect
}: BookingCardProps) {
  const router = useRouter()

  const handleBookNow = () => {
    if (selectedRoom) {
      const roomType = 'name' in selectedRoom ? selectedRoom.name : 'occupancyType' in selectedRoom ? selectedRoom.occupancyType : 'Room'
      router.push(`/property/${propertyId}/book`)
    } else {
      alert('Please select a room before booking.')
    }
  }

  return (
    <Card className="sticky top-4">
      <div className="p-6 space-y-4">
        {/* Price Header */}
        <div>{selectedRoom && (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                ₹{formatPrice(selectedRoom.price ? parseFloat(selectedRoom.price.toString()) * (1 - (parseFloat(selectedRoom.discount?.toString() || '0') / 100)) : 0)}
              </span>
              {selectedRoom.discount && parseFloat(selectedRoom.discount.toString() || '0') > 0 && (
                <span className="text-gray-500 line-through text-sm">
                  ₹{formatPrice(selectedRoom.price ? parseFloat(selectedRoom.price.toString()) : 0)}
                </span>
              )}
              {selectedRoom.discount && parseFloat(selectedRoom.discount.toString() || '0') > 0 && (
                <Badge variant="secondary" className="text-orange-600 bg-orange-50">
                  {selectedRoom.discount}% off
                </Badge>
              )}
            </div>
          </>
        )}
        </div>

        {/* Dates and Room Info */}
        <div className="flex justify-between text-sm">
          <span>Wed, 8 Jan - Thu, 9 Jan</span>
          <span>1 Room, 1 Guest</span>
        </div>

        {/* Selected Room */}
        {selectedRoom && (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {'name' in selectedRoom ? selectedRoom.name : 'occupancyType' in selectedRoom ? selectedRoom.occupancyType : 'Room'}
              </span>
              <Button variant="ghost" size="sm" className="text-[#B11E43]">
                Change
              </Button>
            </div>
          </div>
        )}

        {/* Price Summary */}
        {selectedRoom && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between">
              <span>Room charges</span>
              <span>₹{formatPrice(selectedRoom.price ? parseFloat(selectedRoom.price.toString()) : 0)}</span>
            </div>
            {selectedRoom.discount && parseFloat(selectedRoom.discount.toString() || '0') > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{formatPrice(selectedRoom.price ? (parseFloat(selectedRoom.price.toString()) * (parseFloat(selectedRoom.discount.toString()) / 100)) : 0)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Taxes & fees</span>
              <span>₹{formatPrice(238)}</span> {/* Hardcoded taxes for now */}
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total price</span>
              <span>₹{formatPrice((selectedRoom.price ? parseFloat(selectedRoom.price.toString()) * (1 - (parseFloat(selectedRoom.discount?.toString() || '0') / 100)) : 0) + 238)}</span>{/* Hardcoded taxes */}
            </div>
          </div>)}

        {/* Action Button */}
        <Button
          className="w-full bg-[#B11E43] hover:bg-[#8f1836]"
          onClick={handleBookNow}
        >
          Book Now
        </Button>

        {/* Footer Information */}
        <div className="text-sm text-gray-500">
          By proceeding, you agree to our Guest Policies
        </div>
      </div>
    </Card>
  )
}

