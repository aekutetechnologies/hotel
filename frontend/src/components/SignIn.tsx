'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'
import { sendOtp } from '@/lib/api/sendOtp'
import { verifyOtp, VerifyOtpResponse } from '@/lib/api/verifyOtp'

export function SignIn({ onClose, setIsLoggedIn }: { onClose: () => void, setIsLoggedIn: (isLoggedIn: boolean) => void }) {
  const [mobileNumber, setMobileNumber] = useState('')
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOTP] = useState('')

  const handleSendOTP = async () => {
    try {
      const response = await sendOtp({ mobileNumber })
      setShowOTP(true)
    } catch (err) {
      alert('Failed to send OTP')
    }
  }

  const handleVerifyOTP = async () => {
    try {
      const response: VerifyOtpResponse = await verifyOtp({ mobileNumber, otp })
      console.log("Verify OTP Response:", response)
      console.log(response)
      localStorage.setItem('accessToken', response.access_token)
      localStorage.setItem('role', response.user_role)
      localStorage.setItem('userId', String(response.id))
      localStorage.setItem('name', response.name)
      localStorage.setItem('permissions', String(response.permissions))
      setIsLoggedIn(true)
      onClose()
    } catch (err) {
      console.error("Verify OTP Error:", err)
      alert('Failed to verify OTP')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl relative max-w-md w-full">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#B11E43]">Sign In</h2>
        {!showOTP ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <Input
                type="tel"
                id="mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter your mobile number"
                className="w-full"
                required
              />
            </div>
            <Button 
              onClick={handleSendOTP}
              className="w-full bg-[#B11E43] text-white hover:bg-[#8f1836]"
            >
              Send OTP
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                OTP
              </label>
              <Input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOTP(e.target.value)}
                placeholder="Enter OTP"
                className="w-full"
                required
              />
            </div>
            <Button 
              onClick={handleVerifyOTP}
              className="w-full bg-[#B11E43] text-white hover:bg-[#8f1836]"
            >
              Verify OTP
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

