export interface BaseProperty {
  id: number;
  name: string;
  location: string;
  description: string;
  images: string[];
  amenities: string[];
  status: 'Active' | 'Inactive';
  type: 'hotel' | 'hostel';
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

export interface Hotel extends BaseProperty {
  type: 'hotel';
  checkInTime: string;
  checkOut: string;
  rooms: HotelRoom[];
  policies: {
    checkIn: string;
    checkOut: string;
    couplesWelcome: boolean;
    petsAllowed: boolean;
    idRequired: string[];
  };
}

export interface HostelRoom {
  id: number;
  occupancyType: 'Single' | 'Double' | 'Triple';
  basePrice: number;
  originalPrice: number;
  availableBeds: number;
  totalBeds: number;
  description: string;
  amenities: string[];
}

export interface FoodMenu {
  day: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  timings: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export interface Hostel extends BaseProperty {
  type: 'hostel';
  rooms: HostelRoom[];
  foodMenu: FoodMenu[];
  services: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    notice: string;
    idRequired: string[];
    foodInclusive: boolean;
  };
}

export type Property = Hotel | Hostel;

