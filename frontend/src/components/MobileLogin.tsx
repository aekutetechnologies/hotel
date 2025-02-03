'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MobileLoginProps {
  onLoginSuccess: () => void
}

export function MobileLogin({ onLoginSuccess }: MobileLoginProps) {
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  const handleSendOtp = () => {
    // In a real application, you would send an OTP to the mobile number here
    console.log('Sending OTP to', mobileNumber)
    setShowOtp(true)
  }

  const handleVerifyOtp = () => {
    // In a real application, you would verify the OTP here
    console.log('Verifying OTP', otp)
    onLoginSuccess()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your mobile number to continue booking</CardDescription>
      </CardHeader>
      <CardContent>
        {!showOtp ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
            <Button onClick={handleSendOtp} className="w-full bg-[#B11E43] hover:bg-[#8f1836]">
              Send OTP
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter the OTP sent to your mobile"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <Button onClick={handleVerifyOtp} className="w-full bg-[#B11E43] hover:bg-[#8f1836]">
              Verify OTP
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

