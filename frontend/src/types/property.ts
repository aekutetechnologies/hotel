export interface Property {
  id: number;
  amenities: any[]; // Replace 'any' with specific type if available
  rules: any[];   // Replace 'any' with specific type if available
  documentation: any[]; // Replace 'any' with specific type if available
  images: { 
    id: number; 
    image?: string;
    image_url?: string;
    category?: ImageCategory | null;
    category_id?: number | null;
    category_name?: string | null;
    category_code?: string | null;
  }[];
  rooms?: {
    id: number;
    images?: { 
      id: number;
      image?: string;
      image_url?: string; 
    }[];
    roomImages?: { 
      id: number;
      image_url: string; 
    }[];
    amenities?: any[];
    [key: string]: any;
  }[];
  name: string;
  property_type: string;
  description: string;
  location: string;
  longitude: string;
  latitude: string;
  discount: string | null;
  gender_type?: string; // Add gender_type for hostels
  created_at: string;
  updated_at: string;
  is_active: boolean;
  city: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
  };
  state: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
  };
  country: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
  };
  area: string;
  reviews?: Review[]; // Add reviews property
  nearby_places?: NearbyPlace[];
  
  // Additional properties for PropertyForm compatibility
  _cityString?: string;
  _stateString?: string;
  _countryString?: string;
  _amenityIds?: number[];
  _ruleIds?: number[];
  _documentationIds?: number[];
}

export interface Hotel extends Omit<Property, 'rooms'> {
  hotelChain: string;
  starRating: 1 | 2 | 3 | 4 | 5;
  rooms: HotelRoom[];
}

export interface Hostel extends Omit<Property, 'rooms'> {
  rooms: HostelRoom[];
}

export interface HotelRoom {
  id: number;
  name: string;
  description: string;
  size: string;
  basePrice: number;
  originalPrice: number;
  maxOccupancy: number;
  amenities: string[];
}

export interface HostelRoom {
  id: number;
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

export interface Amenity {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ImageCategory {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NearbyPlace {
  id: number;
  name: string;
  category: string;
  distance: string;
  sort_order?: number;
}

export interface Room {
    id: number;
    images: { 
        id: number; 
        image?: string;
        image_url?: string;
    }[];
    roomImages?: { 
        id: number;
        image_url: string;
    }[];
    amenities: Amenity[];
    name: string;
    daily_rate: string;
    hourly_rate: string;
    monthly_rate?: string;
    bed_type: string | null;
    private_bathroom: boolean;
    smoking: boolean;
    security_deposit: boolean;
    size: string;
    maxoccupancy: number;
    number_of_rooms: number;
    used_number_of_rooms: number;
    left_number_of_rooms: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    discount?: string | number; // Support both string and number formats
    occupancyType?: string; // Additional property used in ExtendedRoom
}

// Define Review interface for the reviews property
export interface Review {
  id: number;
  user: {
    name: string;
  };
  rating: number;
  review: string;
  created_at: string;
  images: string[];
} 