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
  is_review_created?: boolean; // Whether a review has been created for this booking
  review_id?: number; // ID of the review if one exists
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
    reviews?: Array<{
      id: number;
      user: {
        name: string;
      };
      rating: number;
      review: string;
      created_at: string;
      images?: string[];
    }>;
  };
  user: {
    name: string;
    email: string;
    mobile: string;
  };
} 