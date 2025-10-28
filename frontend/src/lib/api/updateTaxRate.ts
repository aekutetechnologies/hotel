import { apiPut } from './apiClient'

interface UpdateTaxRateRequest {
  value: string
}

/**
 * Updates the tax rate setting
 * @param value - The new tax rate value as a string
 * @returns Promise with the response
 */
export async function updateTaxRate(value: string): Promise<any> {
  return await apiPut('/property/settings/tax_rate/', { value })
}
