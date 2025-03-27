'use client'

import { useState } from 'react'
import { useApiRequest } from '@/hooks/useApiRequest'
import { Button } from '@/components/ui/button'
import { ApiButton } from '@/components/ui/api-button'
import { toast } from 'react-toastify'

// Simulated API call
const submitBookingApi = async (formData: any): Promise<{ success: boolean; id: string }> => {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Simulate API response
  return { success: true, id: `booking-${Math.floor(Math.random() * 1000)}` }
}

export function ApiRequestExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: ''
  })

  // Method 1: Using the useApiRequest hook with a regular Button
  const { isLoading, error, execute: submitForm } = useApiRequest(
    // The API function to call
    () => submitBookingApi(formData),
    // Success callback
    (data) => {
      toast.success(`Booking successful! ID: ${data.id}`)
      setFormData({ name: '', email: '', date: '' })
    },
    // Error callback
    (error) => {
      toast.error(`Booking failed: ${error.message}`)
    }
  )

  // Method 2: Using the ApiButton component directly
  const handleDirectSubmit = async () => {
    const result = await submitBookingApi(formData)
    if (result.success) {
      toast.success(`Booking successful! ID: ${result.id}`)
      setFormData({ name: '', email: '', date: '' })
    }
    return result
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Booking Form Example</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>
      
      <div className="flex gap-4">
        {/* Method 1: Using useApiRequest hook with Button */}
        <Button
          variant="default"
          onClick={() => submitForm()}
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit (Hook)'}
        </Button>
        
        {/* Method 2: Using ApiButton directly */}
        <ApiButton
          variant="default"
          onClick={handleDirectSubmit}
          loadingText="Processing..."
          cooldown={1000}
        >
          Submit (ApiButton)
        </ApiButton>
      </div>
      
      {error && (
        <div className="text-red-500 mt-2">Error: {error.message}</div>
      )}
    </div>
  )
} 