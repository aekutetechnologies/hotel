// lib/api/loginUser.ts

import { API_URL } from '../config'

export interface VerifyOtpResponse {
  access_token: string;
  user_role: string;
  id: number;
  name: string;
  permissions: string[];
  // Add other fields if present in your API response
}

export async function verifyOtp({ mobileNumber, otp }: { mobileNumber: string, otp: string }) {
    const response = await fetch(`${API_URL}users/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: mobileNumber, otp })
    })
  
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to login')
    }
  
    return response.json()
  }