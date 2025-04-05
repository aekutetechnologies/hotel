import { API_URL } from '../config'
import { apiGet } from './apiClient'
import { Property } from '@/types/property'

// Define the extended type for transformed properties
export interface TransformedPropertyData extends Property {
  _cityString: string
  _stateString: string
  _countryString: string
  _amenityIds: number[]
  _ruleIds: number[]
  _documentationIds: number[]
  
  // Additional fields for propertyForm compatibility
  images: { 
    id: number
    image?: string
    image_url?: string 
  }[]
  
  rooms?: {
    id: number
    images?: { 
      id: number
      image?: string
      image_url?: string 
    }[]
    roomImages?: { 
      id: number
      image_url: string 
    }[]
    amenities?: any[]
    [key: string]: any
  }[]
}

/**
 * Fetches a property by ID and transforms the data for compatibility with the PropertyForm
 * @param id - The ID of the property to fetch
 * @returns The transformed property data
 */
export async function fetchProperty(id: string): Promise<TransformedPropertyData> {
  try {
    console.log(`Fetching property with ID ${id} from ${API_URL}property/properties/${id}/`);
    
    const data = await apiGet<PropertyData>(`property/properties/${id}/`);
    console.log("Original API response:", JSON.stringify(data, null, 2))
    
    // Validate critical data exists
    if (!data) {
      console.error("Empty response from API");
      throw new Error("Empty response from API");
    }
    
    // Transform data without losing original format
    const transformedData = {
      ...data,
      // Ensure property_type is valid
      property_type: data.property_type || 'hotel',
      
      // Standardize images format
      images: Array.isArray(data.images) ? data.images.map(img => ({
        id: typeof img === 'object' ? (img.id || 0) : 0,
        image_url: typeof img === 'object' ? (img.image_url || img.image || '') : img,
        image: typeof img === 'object' ? (img.image || '') : ''
      })) : [],
      
      // Standardize rooms format
      rooms: Array.isArray(data.rooms) ? data.rooms.map(room => ({
        ...room,
        id: room.id || 0,
        // Standardize room images 
        roomImages: Array.isArray(room.images) ? room.images.map(img => ({
          id: typeof img === 'object' ? (img.id || 0) : 0,
          image_url: typeof img === 'object' ? (img.image_url || img.image || '') : img,
        })) : (Array.isArray(room.roomImages) ? room.roomImages : []),
        amenities: Array.isArray(room.amenities) ? room.amenities : []
      })) : [],
      
      // Preserve original city, state, country objects while adding string versions for PropertyForm
      _cityString: typeof data.city === 'object' ? data.city?.name : (data.city || ''),
      _stateString: typeof data.state === 'object' ? data.state?.name : (data.state || ''),
      _countryString: typeof data.country === 'object' ? data.country?.name : (data.country || ''),
      
      // Preserve original arrays while adding ID arrays for PropertyForm
      _amenityIds: Array.isArray(data.amenities) ? data.amenities.map((amenity: any) => {
        if (!amenity) return 0;
        return typeof amenity === 'object' ? Number(amenity.id || 0) : Number(amenity || 0);
      }).filter(Boolean) : [],
      
      _ruleIds: Array.isArray(data.rules) ? data.rules.map((rule: any) => {
        if (!rule) return 0;
        return typeof rule === 'object' ? Number(rule.id || 0) : Number(rule || 0);
      }).filter(Boolean) : [],
      
      _documentationIds: Array.isArray(data.documentation) ? data.documentation.map((doc: any) => {
        if (!doc) return 0;
        return typeof doc === 'object' ? Number(doc.id || 0) : Number(doc || 0);
      }).filter(Boolean) : []
    } as TransformedPropertyData;
    
    console.log("Transformed property data:", JSON.stringify(transformedData, null, 2))
    return transformedData
  } catch (error) {
    console.error("Error fetching property:", error)
    throw error
  }
}

// Private types for internal use
interface PropertyImage {
  id: number
  image?: string
  [key: string]: any
}

interface PropertyRoom {
  id: number
  images?: PropertyImage[]
  amenities?: any[]
  [key: string]: any
}

interface PropertyData {
  id: number
  property_type?: string
  images?: PropertyImage[]
  rooms?: PropertyRoom[]
  city?: { name: string } | string
  state?: { name: string } | string
  country?: { name: string } | string
  amenities?: any[]
  rules?: any[]
  documentation?: any[]
  [key: string]: any
} 