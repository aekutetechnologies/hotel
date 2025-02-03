// lib/api/sendOtp.ts

import { API_URL } from '../config'

export async function sendOtp({ mobileNumber }: { mobileNumber: string }) {
  const response = await fetch(`${API_URL}users/send-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: mobileNumber })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to send OTP')
  }

  return response.json()
}