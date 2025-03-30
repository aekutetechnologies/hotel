'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
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

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobile: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await getProfile()
      console.log("Profile Response:", response)
      setProfile(response)
    }
    fetchProfile()
  }, [])

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

      if (response) {
        toast.success('Profile updated successfully!')
        if (response) {
          setProfile(response)
          localStorage.setItem('name', response.name)
        }
      } else {
        toast.error(`Profile update failed: ${response.error?.message || 'Unknown error'}`)
      }
    } catch (error: any) {
      toast.error(`Profile update error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
                  onChange={(e) => setProfile(prev => ({ ...prev, mobile: e.target.value }))}
                  required
                />
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
    </div>
  )
}

