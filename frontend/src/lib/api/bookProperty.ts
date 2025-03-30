import type { ActionResponse } from '@/types/actions'
import { Property } from '@/types/property'
import { API_URL } from '../config'

interface BookPropertyParams {
  user?: string | null; // Or number, depending on how your user IDs are stored
  property?: number
  room: number
  price: number
  discount: number
  booking_time: string
  payment_type: string
  checkin_date: string
  checkout_date: string
  number_of_guests: number
  number_of_rooms: number
  token: string
}

export async function bookProperty(params: BookPropertyParams): Promise<ActionResponse<any, any>> {
  const {
    user,
    property,
    room,
    price,
    discount,
    booking_time,
    payment_type,
    checkin_date,
    checkout_date,
    number_of_guests,
    number_of_rooms,
    token
  } = params

  const response = await fetch(`${API_URL}booking/bookings/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({
      user,
      property,
      room,
      price,
      discount,
      booking_time,
      payment_type,
      checkin_date,
      checkout_date,
      number_of_guests,
      number_of_rooms,
      token
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to book property')
  }

  return await response.json()
} 