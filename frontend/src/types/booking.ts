export interface Booking {
  id: number;
  name?: string;
  room_type?: string;
  room: number;
  checkin_date: string;
  checkout_date: string;
  checkin_time?: string;
  checkout_time?: string;
  price: number;
  status: string;
  booking_id?: string;
  booking_type: string;
  booking_time: string; // 'daily', 'hourly', or 'monthly'
  number_of_guests: number;
  number_of_rooms: number;
  discount: number;
  payment_type: string;
  booking_room_types?: Array<Record<string, number>>; // Array of objects where key is room ID and value is count
  property: {
    id: number;
    images: Array<{
      image: string;
    }>;
    name: string;
    rooms: Array<{
      id: number;
      name: string;
      amenities?: Array<{
        id: number;
        name: string;
      }>;
    }>;
  };
  user: {
    name: string;
    email: string;
    mobile: string;
  };
} 