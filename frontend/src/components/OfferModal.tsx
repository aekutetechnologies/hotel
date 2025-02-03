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
import { Upload, X } from 'lucide-react'
import { ImageCropper } from './ImageCropper'

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
    discountPercentage: '',
    validFrom: '',
    validTo: '',
    status: 'Active',
    image: ''
  })
  const [cropImage, setCropImage] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setOffer(initialData)
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setOffer(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(offer)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCropImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedImage: string) => {
    setOffer(prev => ({ ...prev, image: croppedImage }))
    setCropImage(null)
  }

  return (
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
          <div>
            <Label htmlFor="image">Offer Image</Label>
            {offer.image ? (
              <div className="relative aspect-[16/9] mt-2">
                <img
                  src={offer.image}
                  alt="Offer"
                  className="w-full h-full object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setOffer(prev => ({ ...prev, image: '' }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="border-2 border-dashed rounded-lg aspect-[16/9] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 mt-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Upload Image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
          <Button type="submit" className="w-full">
            {initialData ? 'Update' : 'Create'} Offer
          </Button>
        </form>
      </DialogContent>
      {cropImage && (
        <ImageCropper
          image={cropImage}
          aspectRatio={16/9}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImage(null)}
        />
      )}
    </Dialog>
  )
}

