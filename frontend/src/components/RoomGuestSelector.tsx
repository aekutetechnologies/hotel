"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Users, Building, Minus, Plus } from "lucide-react"

interface RoomGuestSelectorProps {
  onSelect: (rooms: number, guests: number) => void
  initialRooms?: number
  initialGuests?: number
}

export function RoomGuestSelector({ 
  onSelect, 
  initialRooms = 1, 
  initialGuests = 2 
}: RoomGuestSelectorProps) {
  const [rooms, setRooms] = useState(initialRooms)
  const [guests, setGuests] = useState(initialGuests)
  const [isOpen, setIsOpen] = useState(false)

  const handleIncrement = (type: 'rooms' | 'guests') => {
    if (type === 'rooms' && rooms < 5) {
      const newRooms = rooms + 1
      setRooms(newRooms)
      onSelect(newRooms, guests)
    } else if (type === 'guests' && guests < 10) {
      const newGuests = guests + 1
      setGuests(newGuests)
      onSelect(rooms, newGuests)
    }
  }

  const handleDecrement = (type: 'rooms' | 'guests') => {
    if (type === 'rooms' && rooms > 1) {
      const newRooms = rooms - 1
      setRooms(newRooms)
      onSelect(newRooms, guests)
    } else if (type === 'guests' && guests > 1) {
      const newGuests = guests - 1
      setGuests(newGuests)
      onSelect(rooms, newGuests)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="neutral" 
          className="w-full justify-start text-left font-normal"
        >
          <Users className="mr-2 h-4 w-4" />
          {rooms} Room{rooms > 1 ? 's' : ''}, {guests} Guest{guests > 1 ? 's' : ''}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Rooms</Label>
              <div className="flex items-center text-sm text-muted-foreground">
                <Building className="mr-2 h-4 w-4" />
                Select number of rooms
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="neutral"
                size="icon"
                onClick={() => handleDecrement('rooms')}
                disabled={rooms <= 1}
                className="h-8 w-8"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center">{rooms}</span>
              <Button
                variant="neutral"
                size="icon"
                onClick={() => handleIncrement('rooms')}
                className="h-8 w-8"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Guests</Label>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                Select number of guests
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="neutral"
                size="icon"
                onClick={() => handleDecrement('guests')}
                disabled={guests <= 1}
                className="h-8 w-8"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center">{guests}</span>
              <Button
                variant="neutral"
                size="icon"
                onClick={() => handleIncrement('guests')}
                className="h-8 w-8"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

