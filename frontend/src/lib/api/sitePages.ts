import { apiClient, apiGet, apiPatch, apiPost, apiPut } from './apiClient'
import type { SitePage } from '@/types/sitePage'

const BASE_ENDPOINT = 'property/site-pages/'

export async function fetchSitePage(slug: string): Promise<SitePage> {
  return apiGet<SitePage>(`${BASE_ENDPOINT}${slug}/`, { includeAuth: false })
}

export async function fetchSitePages(): Promise<SitePage[]> {
  return apiGet<SitePage[]>(BASE_ENDPOINT)
}

export async function createSitePage(payload: Partial<SitePage>): Promise<SitePage> {
  return apiPost<SitePage>(BASE_ENDPOINT, payload)
}

export async function updateSitePage(slug: string, payload: Partial<SitePage>, options: { partial?: boolean } = {}): Promise<SitePage> {
  if (options.partial) {
    return apiPatch<SitePage>(`${BASE_ENDPOINT}${slug}/`, payload)
  }
  return apiPut<SitePage>(`${BASE_ENDPOINT}${slug}/`, payload)
}

export async function uploadSitePageImage(formData: FormData): Promise<{ id: number; image_url: string; page_slug: string | null }> {
  return apiClient<{ id: number; image_url: string; page_slug: string | null }>(`${BASE_ENDPOINT}upload-image/`, {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

