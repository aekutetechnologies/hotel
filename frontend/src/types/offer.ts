/**
 * Image associated with an offer
 */
export interface OfferImage {
  id: number
  image: string
  offer: number
  created_at?: string
  updated_at?: string
}

/**
 * Offer data as returned from the API
 */
export interface Offer {
  id: number
  title: string
  description: string
  code: string
  discount_percentage: number
  offer_start_date: string
  offer_end_date: string
  is_active: boolean
  images?: OfferImage[]
  image?: string // Legacy field for backward compatibility
  created_at?: string
  updated_at?: string
}

/**
 * Form data for creating or updating an offer
 */
export interface OfferFormData {
  title: string
  description: string
  code: string
  discount_percentage: number
  offer_start_date: string
  offer_end_date: string
  is_active: boolean
} 