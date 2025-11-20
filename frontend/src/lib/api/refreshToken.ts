// lib/api/refreshToken.ts

import { API_URL } from '../config'

export interface RefreshTokenResponse {
  access_token: string;
  user_role: string;
  id: number;
  name: string;
  permissions: string[];
}

export async function refreshToken(): Promise<RefreshTokenResponse | null> {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      console.error('No refresh token available')
      return null
    }

    const response = await fetch(`${API_URL}users/refresh-token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Token refresh failed:', errorData)
      // Clear tokens if refresh fails
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return null
    }

    const data = await response.json()
    
    // Update access token in localStorage
    localStorage.setItem('accessToken', data.access_token)
    
    // Update other user info if provided
    if (data.user_role) {
      localStorage.setItem('role', data.user_role)
    }
    if (data.name) {
      localStorage.setItem('name', data.name)
    }
    if (data.id) {
      localStorage.setItem('userId', String(data.id))
    }
    if (data.permissions) {
      localStorage.setItem('permissions', String(data.permissions))
    }

    return data
  } catch (error: any) {
    console.error('Token refresh error:', error)
    // Clear tokens on error
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return null
  }
}

