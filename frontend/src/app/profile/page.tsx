'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { LoginDialog } from '@/components/LoginDialog'
import Footer from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserBookings } from '@/components/UserBookings'
import { updateProfile } from '@/lib/api/updateProfile'
import { toast, ToastContainer } from 'react-toastify'
import { getProfile } from '@/lib/api/getProfile'
import 'react-toastify/dist/ReactToastify.css'
import { UserProfile } from '@/types/profile'

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    mobile: ''
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [isNavModalOpen, setIsNavModalOpen] = useState(false)

  useEffect(() => {
    const storedName = localStorage.getItem("name")
    const storedAccessToken = localStorage.getItem("accessToken")
    
    if (storedName && storedAccessToken) {
      setIsLoggedIn(true)
      setUserName(storedName)
    }
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await getProfile()
      console.log("Profile Response:", response)
      setProfile(response)
    }
    fetchProfile()
  }, [])

  const handleLoginClick = () => {
    setIsLoginDialogOpen(true)
  }

  const handleLoginSuccess = (name: string) => {
    setIsLoggedIn(true)
    setUserName(name)
    setIsLoginDialogOpen(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
    setUserName("")
    window.location.href = "/"
  }

  const setShowDetailSection = (section: string) => {
    window.location.href = `/home?type=${section}`
  }

  const handleNavModalChange = (isOpen: boolean) => {
    setIsNavModalOpen(isOpen)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('accessToken')
    if (!token) {
      toast.error('Please log in to update profile.')
      return
    }

    try {
      const response = await updateProfile({
        name: profile.name,
        mobile: profile.mobile,
        email: profile.email
      })

      console.log("Update Profile Response:", response)
      toast.success('Profile updated successfully!')
      setProfile(response)
      localStorage.setItem('name', response.name)
    } catch (error: any) {
      toast.error(`Profile update error: ${error.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        handleLogout={handleLogout}
        handleLoginClick={handleLoginClick}
        setShowDetailSection={setShowDetailSection}
        isClosed={isClosed}
        currentSection="hotels"
        onNavModalChange={handleNavModalChange}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  value={profile.mobile}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                  aria-label="Phone number (cannot be edited)"
                />
                {profile.mobile && (
                  <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed. Please contact support if you need to update it.</p>
                )}
              </div>
              <Button type="submit" className="bg-[#B11E43] hover:bg-[#8f1836] text-white">
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <ToastContainer />
      <Footer sectionType="hotels" />
      
      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}

