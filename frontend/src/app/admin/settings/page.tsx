'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { getSettings } from '@/lib/api/getSettings'

export default function SettingsPage() {
  const [taxRate, setTaxRate] = useState('0.18')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const settings = await getSettings()
      if (settings.tax_rate) {
        setTaxRate(settings.tax_rate)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const accessToken = localStorage.getItem('accessToken')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/'}property/settings/tax_rate/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ value: taxRate })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update tax rate')
      }

      toast.success('Tax rate updated successfully!')
    } catch (error) {
      console.error('Error updating tax rate:', error)
      toast.error('Failed to update tax rate')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only valid decimal numbers (0-1 range)
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 1)) {
      setTaxRate(value)
    }
  }

  const percentage = parseFloat(taxRate) * 100

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A31C44]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage system settings and configurations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Settings</CardTitle>
          <CardDescription>Configure booking-related settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="taxRate">Tax Rate (GST)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={taxRate}
                onChange={handleChange}
                placeholder="0.18"
                className="w-48"
              />
              <span className="text-2xl font-semibold text-gray-700">
                = {isNaN(percentage) ? '0' : percentage.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Tax rate as a decimal (e.g., 0.18 for 18% GST)
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#A31C44] hover:bg-[#8f1836]"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Tax rate is applied to all bookings automatically</li>
            <li>Changes take effect immediately for new bookings</li>
            <li>Set as a decimal (e.g., 0.18 = 18%)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
