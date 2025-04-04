"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Gift, Users, Briefcase } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { sendOtp } from '@/lib/api/sendOtp'
import { verifyOtp, VerifyOtpResponse } from '@/lib/api/verifyOtp'
import { getProfile } from '@/lib/api/getProfile'
import { updateProfile } from '@/lib/api/updateProfile'

interface LoginDialogProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (name: string) => void
}

export function LoginDialog({ isOpen, onClose, onLoginSuccess }: LoginDialogProps) {
  const [view, setView] = useState<"benefits" | "phone" | "otp" | "userInfo">("benefits")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [mobileNumber, setMobileNumber] = useState('')
  const [otpValue, setOtpValue] = useState('')
  const [userNameInput, setUserNameInput] = useState('')
  const [userEmailInput, setUserEmailInput] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resetDialogState = () => {
    setView("benefits")
    setPhoneNumber("")
    setOtp(["", "", "", "", "", ""])
    setShowOTPInput(false)
    setMobileNumber('')
    setOtpValue('')
    setUserNameInput('')
    setUserEmailInput('')
  }

  const benefits = [
    {
      icon: Gift,
      title: "Earn Hsquare credits",
      description: "Earn credits for your subsequent bookings",
    },
    {
      icon: Users,
      title: "Join the Hsquare club",
      description: "Become our club member for exclusive discounts",
    },
    {
      icon: Briefcase,
      title: "Easy cancellations & refunds",
      description: "Manage all bookings easily via one click",
    },
  ]

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSendOTP = async () => {
    setMessage(null)
    setError(null)
    try {
      const response = await sendOtp({ mobileNumber: phoneNumber })
      console.log("response", response)
      if (response) {
        setShowOTPInput(true)
        setView("otp")
        const otpArray = response.otp.split('')
        setOtp(otpArray)
      } else {
        setError('Failed to send OTP.')
      }
    } catch (err) {
      setError('Failed to send OTP.')
    }
  }

  const handleVerifyOTP = async () => {
    setMessage(null)
    setError(null)
    try {
      const otpString = otp.join('')
      if (otpString.length !== 6) {
        setError('Please enter a 6-digit OTP.')
        return
      }
      let response: VerifyOtpResponse | null = null;
      try {
        response = await verifyOtp({ mobileNumber: phoneNumber, otp: otpString })
      } catch (e: any) {
        setError('Failed to verify OTP.');
        return;
      }

      if (response && response.access_token) {
        console.log("Verify OTP Response:", response)
        localStorage.setItem('accessToken', response.access_token)
        localStorage.setItem('role', response.user_role)
        localStorage.setItem('userId', String(response.id))
        localStorage.setItem('name', response.name)

        const profileResponse = await getProfile()
        if (!profileResponse.name || !profileResponse.email) {
          setView('userInfo')
          return;
        }
        localStorage.setItem('permissions', String(response.permissions))
        onLoginSuccess(response.name)
        onClose()
        resetDialogState()
      } else {
        setError('Failed to verify OTP.')
        resetDialogState()
      }
    } catch (err) {
      console.error("Verify OTP Error:", err)
      setError('Failed to verify OTP.')
    }
  }

  const handleSubmitUserInfo = async () => {
    if (!userNameInput.trim() || !userEmailInput.trim()) {
      alert('Please enter both your name and email.')
      return;
    }

    try {
      const profilePayload = {
        name: userNameInput,
        email: userEmailInput,
        mobile: phoneNumber, // Assuming phoneNumber is still available
      }
      const updateResponse = await updateProfile(profilePayload)
      if (updateResponse) {
        localStorage.setItem('name', updateResponse.name)
        onLoginSuccess(userNameInput)
        onClose()
        resetDialogState()
      } else {
        setError('Failed to update profile.');
      }
    } catch (error) {
      setError('Failed to update profile.');
    }
  }

  const clearMessages = () => { setMessage(null); setError(null) }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Log In/Sign Up</DialogTitle>
          <p className="text-sm text-gray-500">Sign-up to become a member of Hsquare, and get exclusive discounts.</p>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {message && (
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-md">{message}</div>
          )}

          {error && (
            <div className="px-4 py-2 bg-red-100 text-red-700 rounded-md">{error}</div>
          )}

          {view === "benefits" ? (
            // Benefits View
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-[#A31C44]" />
                  </div>
                  <div>
                    <h3 className="font-medium">{benefit.title}</h3>
                    <p className="text-sm text-gray-500">{benefit.description}</p>
                  </div>
                </div>
              ))}
              <Button className="w-full bg-[#A31C44] hover:bg-[#7A1533] text-white" onClick={() => setView("phone")}>
                Continue
              </Button>
            </div>
          ) : view === "phone" ? (
            // Phone Input View
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Enter your phone number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-shrink-0">
                      <input
                        type="text"
                        value="+91"
                        disabled
                        className="w-12 h-10 text-center border rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="Enter your phone number"
                      className="flex-1 h-10 border rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-[#A31C44]"
                      onFocus={clearMessages}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">We'll send you a verification code to this number</p>
              </div>
              <Button
                className="w-full bg-[#A31C44] hover:bg-[#7A1533] text-white"
                disabled={phoneNumber.length !== 10}
                onClick={handleSendOTP}
              >
                Get OTP
              </Button>
            </div>
          ) : view === "otp" ? (
            // OTP View
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  We have sent the verification code to your mobile number{" "}
                  <span className="font-medium">+91-{phoneNumber}</span>
                  <button className="text-blue-600 ml-2 hover:underline" onClick={() => setView("phone")}>
                    Change?
                  </button>
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={cn(
                        "w-12 h-12 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A31C44]",
                        "text-lg font-semibold"
                      )}
                      onFocus={clearMessages}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <button className="text-blue-600 text-sm hover:underline">Resend?</button>
                </div>
              </div>

              <Button 
                className="w-full bg-[#A31C44] hover:bg-[#7A1533] text-white"
                disabled={otp.join('').length !== 6}
                onClick={handleVerifyOTP}
              >
                Verify & Continue
              </Button>
            </div>
          ) : view === "userInfo" ? (
            // User Info View
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    required
                    onFocus={clearMessages}
                  />
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Your Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={userEmailInput}
                    onChange={(e) => setUserEmailInput(e.target.value)}
                    required
                    onFocus={clearMessages}
                  />
                </div>
              </div>
              <Button className="w-full bg-[#A31C44] hover:bg-[#7A1533] text-white" onClick={handleSubmitUserInfo}>
                Complete Profile
              </Button>
            </div>
          ) : (
            <div>Unexpected view: {view}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

