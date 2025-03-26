import { API_URL } from '../config'

export async function fetchProperty(id: string) {
  const response = await fetch(`${API_URL}property/properties/${id}/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch property with id ${id}`)
  }

  const data = await response.json()
  
  // Transform data to match expected format for the form
  const transformedData = {
    ...data,
    // Transform images to include image_url field expected by the form
    images: data.images?.map((img: any) => ({
      ...img,
      id: img.id,
      image_url: img.image
    })) || [],
    
    // Transform rooms to include roomImages
    rooms: data.rooms?.map((room: any) => ({
      ...room,
      id: room.id,
      // Transform room images to include image_url field
      roomImages: room.images?.map((img: any) => ({
        id: img.id,
        image_url: img.image
      })) || []
    })) || [],
    
    // Set state, city, country as strings if they are objects
    state: typeof data.state === 'object' ? data.state.name : data.state,
    city: typeof data.city === 'object' ? data.city.name : data.city,
    country: typeof data.country === 'object' ? data.country.name : data.country,
    
    // Convert amenities, rules, and documentation to arrays of IDs if they are objects
    amenities: data.amenities?.map((amenity: any) => 
      typeof amenity === 'object' ? amenity.id : amenity
    ) || [],
    
    rules: data.rules?.map((rule: any) => 
      typeof rule === 'object' ? rule.id : rule
    ) || [],
    
    documentation: data.documentation?.map((doc: any) => 
      typeof doc === 'object' ? doc.id : doc
    ) || []
  }
  
  console.log("Transformed property data:", transformedData)
  return transformedData
} 