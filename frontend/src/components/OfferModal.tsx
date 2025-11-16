import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'react-toastify'
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
    discount_percentage: '',
    offer_start_date: '',
    offer_end_date: '',
    status: 'active',
  })
  const [formErrors, setFormErrors] = useState({
    discount_percentage: '',
  })

  useEffect(() => {
    if (initialData) {
      // Convert date strings to the format expected by the input element
      const formattedInitialData = {
        ...initialData,
        offer_start_date: formatDate(initialData.offer_start_date),
        offer_end_date: formatDate(initialData.offer_end_date),
      }
      setOffer(formattedInitialData)
    }
  }, [initialData])

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format to YYYY-MM-DD
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Validate discount percentage
    if (name === 'discount_percentage') {
      const numValue = parseFloat(value)
      if (numValue > 100) {
        setFormErrors(prev => ({ ...prev, discount_percentage: 'Discount percentage cannot exceed 100%' }))
      } else {
        setFormErrors(prev => ({ ...prev, discount_percentage: '' }))
      }
    }
    
    setOffer(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation before submission
    const discountValue = parseFloat(offer.discount_percentage)
    if (discountValue > 100) {
      toast.error('Discount percentage cannot exceed 100%')
      return
    }
    
    const offerData = {
      ...offer,
      discount_percentage: discountValue,
      offer_start_date: new Date(offer.offer_start_date).toISOString(),
      offer_end_date: new Date(offer.offer_end_date).toISOString()
    }
    
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
              <Label htmlFor="discount_percentage">Discount Percentage</Label>
              <Input
                id="discount_percentage"
                name="discount_percentage"
                type="number"
                min="0"
                max="100"
                value={offer.discount_percentage}
                onChange={handleChange}
                required
                className={formErrors.discount_percentage ? 'border-red-500' : ''}
              />
              {formErrors.discount_percentage && (
                <p className="text-red-500 text-sm mt-1">{formErrors.discount_percentage}</p>
              )}
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
              <Label htmlFor="offer_start_date">Valid From</Label>
              <Input
                id="offer_start_date"
                name="offer_start_date"
                type="date"
                value={offer.offer_start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="offer_end_date">Valid To</Label>
              <Input
                id="offer_end_date"
                name="offer_end_date"
                type="date"
                value={offer.offer_end_date}
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
            <Button 
              type="submit" 
              className="w-full"
              disabled={!!formErrors.discount_percentage}
            >
              {initialData ? 'Update' : 'Create'} Offer
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}