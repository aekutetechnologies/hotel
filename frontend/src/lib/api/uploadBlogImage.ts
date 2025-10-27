import { API_URL } from '../config'

export async function uploadBlogImage(imageFile: File, altText: string = ''): Promise<{ id: number, image_url: string, alt_text: string }> {
  const formData = new FormData()
  formData.append('image', imageFile)
  if (altText) {
    formData.append('alt_text', altText)
  }

  const response = await fetch(`${API_URL}blog/images/upload/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Blog image upload failed: ${JSON.stringify(error)}`)
  }

  return await response.json()
}

