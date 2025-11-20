import { apiClient } from './apiClient'

export async function uploadBlogImage(imageFile: File, altText: string = ''): Promise<{ id: number, image_url: string, alt_text: string }> {
  const formData = new FormData()
  formData.append('image', imageFile)
  if (altText) {
    formData.append('alt_text', altText)
  }

  return await apiClient<{ id: number, image_url: string, alt_text: string }>('blog/images/upload/', {
    method: 'POST',
    body: formData,
    isFormData: true
  })
}

