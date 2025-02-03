export interface Property {
  id: number;
  amenities: any[]; // Replace 'any' with specific type if available
  rules: any[];   // Replace 'any' with specific type if available
  documentation: any[]; // Replace 'any' with specific type if available
  images: { id: number; image: string }[];
  rooms: any[];     // Replace 'any' with specific type (HotelRoom[] | HostelRoom[])
  name: string;
  property_type: string;
  description: string;
  location: string;
  longitude: string;
  latitude: string;
  discount: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Hotel extends Property {
  hotelChain: string;
  starRating: 1 | 2 | 3 | 4 | 5;
  rooms: HotelRoom[];
}

export interface Hostel extends Property {
  rooms: HostelRoom[];
}

export interface HotelRoom {
  id: string;
  name: string;
  description: string;
  size: string;
  basePrice: number;
  originalPrice: number;
  maxOccupancy: number;
  amenities: string[];
}

export interface HostelRoom {
  id: string;
  name: string;
  description: string;
  beds: number;
  basePrice: number;
  originalPrice: number;
  amenities: string[];
}

export interface FoodMenu {
  items: string[];
  cuisines: string[];
}

export interface Amenity { /* ... */ } 