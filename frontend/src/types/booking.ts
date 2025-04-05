export interface Booking {
  id: number;
  name: string;
  room_type: string;
  room: number;
  checkin_date: string;
  checkout_date: string;
  price: number;
  status: string;
  booking_id: string;
  number_of_guests: number;
  discount: number;
  payment_type: string;
  property: {
    images: Array<{
      image: string;
    }>;
    name: string;
    rooms: Array<{
      id: number;
      name: string;
    }>;
  };
  user: {
    name: string;
    email: string;
    mobile: string;
  };
} 