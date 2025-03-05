'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface OfferModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (offer: any) => void
  title: string
  initialData?: any
}

export function OfferModal({ isOpen, onClose, onSubmit, title, initialData }: OfferModalProps) {
  const [offer, setOffer] = useState({
    title: '',
    description: '',
    code: '',
    discountPercentage: '',
    validFrom: '',
    validTo: '',
    status: 'active',
  })

  useEffect(() => {
    if (initialData) {
      setOffer(initialData)
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setOffer(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const offerData = {
      ...offer,
      discount_percentage: parseFloat(offer.discountPercentage),
      offer_start_date: new Date(offer.validFrom).toISOString(),
      offer_end_date: new Date(offer.validTo).toISOString()
    }
    e.preventDefault()
    onSubmit(offerData)
  }


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={offer.title}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={offer.description}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="discountPercentage">Discount Percentage</Label>
              <Input
                id="discountPercentage"
                name="discountPercentage"
                type="number"
                value={offer.discountPercentage}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                name="code"
                value={offer.code}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                id="validFrom"
                name="validFrom"
                type="date"
                value={offer.validFrom}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="validTo">Valid To</Label>
              <Input
                id="validTo"
                name="validTo"
                type="date"
                value={offer.validTo}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={offer.status}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <Button type="submit" className="w-full">
              {initialData ? 'Update' : 'Create'} Offer
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
