import { apiGet, apiPut, apiPost } from './apiClient'

export interface HostelVisit {
  id: number
  property: {
    id: number
    name: string
    location: string
    property_type: string
  }
  user: {
    id: number
    name: string
    mobile: string
  } | null
  name: string
  phone: string
  visit_date: string
  visit_time: string
  number_of_guests: number
  status: string
  notes: string
  created_at: string
}

export interface BookVisitRequest {
  property: number
  name: string
  phone: string
  visit_date: string
  visit_time: string
  number_of_guests: number
  notes?: string
}

export interface UpdateVisitStatusRequest {
  status: string
}

/**
 * Fetches all visit requests
 * @returns Promise with visits array
 */
export async function fetchVisits(): Promise<HostelVisit[]> {
  return await apiGet<HostelVisit[]>('/booking/visits/')
}

/**
 * Updates the status of a visit request
 * @param visitId - The ID of the visit to update
 * @param status - The new status
 * @returns Promise with the response
 */
export async function updateVisitStatus(visitId: number, status: string): Promise<any> {
  return await apiPut(`/booking/visits/${visitId}/`, { status })
}

/**
 * Books a new visit request
 * @param visitData - The visit booking data
 * @returns Promise with the response
 */
export async function bookVisit(visitData: BookVisitRequest): Promise<any> {
  return await apiPost('/booking/visits/', visitData)
}
