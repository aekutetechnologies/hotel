import { API_URL } from '../config'

export async function fetchProperty(id: string) {
  try {
    console.log(`Fetching property with ID ${id} from ${API_URL}property/properties/${id}/`);
    
    const response = await fetch(`${API_URL}property/properties/${id}/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch property with id ${id}, status: ${response.status}`)
    }

    const data = await response.json()
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
      
      // Add image_url field for compatibility with the form while preserving the original image
      images: Array.isArray(data.images) ? data.images.map((img: any) => ({
        ...img,
        id: Number(img?.id || 0),
        image_url: img?.image || '' // Add image_url property for PropertyForm
      })) : [],
      
      // Add roomImages for each room for PropertyForm while preserving original room.images
      rooms: Array.isArray(data.rooms) ? data.rooms.map((room: any) => ({
        ...room,
        id: Number(room?.id || 0),
        // Add roomImages array for PropertyForm compatibility
        roomImages: Array.isArray(room.images) ? room.images.map((img: any) => ({
          id: Number(img?.id || 0),
          image_url: img?.image || ''
        })) : [],
        // Ensure amenities are properly formatted for both contexts
        amenities: Array.isArray(room.amenities) ? room.amenities.map((amenity: any) => {
          if (!amenity) return { id: 0, name: 'Unknown' };
          return typeof amenity === 'object' ? amenity : { id: Number(amenity), name: 'Unknown' };
        }) : []
      })) : [],
      
      // Preserve original city, state, country objects while adding string versions for PropertyForm
      _cityString: typeof data.city === 'object' ? data.city?.name : data.city,
      _stateString: typeof data.state === 'object' ? data.state?.name : data.state,
      _countryString: typeof data.country === 'object' ? data.country?.name : data.country,
      
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
    }
    
    console.log("Transformed property data:", JSON.stringify(transformedData, null, 2))
    return transformedData
  } catch (error) {
    console.error("Error fetching property:", error)
    throw error
  }
} 