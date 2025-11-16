import { apiPost, apiDelete } from './apiClient'
import { API_URL } from '../config'

export async function assignOffersToProperties(offerIds: number[], propertyIds: number[]) {
  return apiPost(`${API_URL}offers/assign/`, {
    offer_ids: offerIds,
    property_ids: propertyIds,
  })
}

export async function unassignOffersFromProperties(offerIds: number[], propertyIds: number[]) {
  return apiDelete(`${API_URL}offers/assign/`, {
    body: {
      offer_ids: offerIds,
      property_ids: propertyIds,
    }
  })
}


