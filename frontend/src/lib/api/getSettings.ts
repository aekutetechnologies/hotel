import { apiGet } from './apiClient'

interface Settings {
  [key: string]: string
}

/**
 * Fetches all settings from the backend
 * @returns Promise with settings object
 */
export async function getSettings(): Promise<Settings> {
  const response = await apiGet<Settings>('/property/settings/')
  return response
}

/**
 * Fetches a specific setting value
 * @param key - The setting key to fetch
 * @returns Promise with the setting value or undefined
 */
export async function getSetting(key: string): Promise<string | undefined> {
  const settings = await getSettings()
  return settings[key]
}
