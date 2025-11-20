import { apiClient } from './apiClient'

export async function toggleFavourite(propertyId: string, isFavourite: boolean) {
  return await apiClient('property/toggle-favourite/', {
    method: 'POST',
    body: { property_id: propertyId, is_favourite: isFavourite }
  })
} 