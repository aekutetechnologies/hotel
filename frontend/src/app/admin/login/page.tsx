'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NewButton } from "@/components/ui/new-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { verifyOtp } from '@/lib/api/verifyOtp'
import { sendOtp } from '@/lib/api/sendOtp'

function AdminLogin() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [isStaticLogin, setIsStaticLogin] = useState(false)
  const [staticMessage, setStaticMessage] = useState('')

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await sendOtp({ mobileNumber })
      // Check if this is a static login number
      const staticNumbers: Record<string, string> = {
        '8342091661': '420916',
        '9938252725': '382527',
        '9820769934': '207699',
      }
      if (staticNumbers[mobileNumber]) {
        setIsStaticLogin(true)
      } else {
        setIsStaticLogin(false)
        setStaticMessage('')
      }
      setShowOtpInput(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await verifyOtp({ mobileNumber, otp })
      console.log(data)
      localStorage.setItem('accessToken', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('refreshToken', data.refresh_token)
      }
      localStorage.setItem('role', data.user_role)
      localStorage.setItem('userId', data.id.toString())
      localStorage.setItem('permissions', data.permissions.join(','))
      localStorage.setItem('name', data.name)
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#B11E43]">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          {!showOtpInput ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label htmlFor="mobileNumber" className="text-sm font-medium">
                  Mobile Number
                </label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                />
              </div>
              <NewButton
                type="submit"
                variant="default"
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </NewButton>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {staticMessage && (
                <Alert>
                  <AlertDescription>{staticMessage}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">
                  {isStaticLogin ? 'Enter OTP' : 'OTP'}
                </label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder={isStaticLogin ? "Enter OTP" : "Enter the OTP"}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <NewButton
                type="submit"
                variant="default"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </NewButton>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLogin