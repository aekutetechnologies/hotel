'use client'

import { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [userType, setUserType] = useState('')

  const handleSendToWhatsApp = () => {
    if (!name || !gender || !propertyType || !userType) {
      alert('Please fill in all the details to get started.')
      return
    }

    const message = `Hello! My name is ${name}. I am a ${gender} ${userType} looking for ${propertyType}. Can you help me find suitable accommodation?`
    const whatsappUrl = `https://wa.me/917400455087?text=${encodeURIComponent(message)}`
    
    // Try to open WhatsApp Web first, then fallback to mobile app
    window.open(whatsappUrl, '_blank')
    
    // Close the dialog
    setIsOpen(false)
    
    // Reset form
    setName('')
    setGender('')
    setPropertyType('')
    setUserType('')
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#B11E43] hover:bg-[#8f1836] shadow-lg transform transition-all duration-200 hover:scale-110"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chat Dialog - Positioned near the chat icon */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.15)] z-50 transform transition-all duration-300 ease-in-out overflow-hidden">
          {/* Dark Red Header */}
          <div className="bg-[#B11E43] text-white p-6 relative rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 text-white">Chat with us</h2>
                <p className="text-sm text-white opacity-90">
                  To help us serve you better, please let us know the area in which you're looking for accommodation.
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                {/* Chat illustration */}
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    24/7
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* White Content Area */}
          <div className="p-6 space-y-4 bg-white rounded-b-2xl">
            {/* Name Input */}
            <div>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Gender Selection */}
            <div>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="I am" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Type Selection */}
            <div>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="I am looking for" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Type Selection */}
            <div>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="I'm a" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Chat Button */}
            <Button
              onClick={handleSendToWhatsApp}
              disabled={!name || !gender || !propertyType || !userType}
              className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white shadow-[0_2px_5px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
