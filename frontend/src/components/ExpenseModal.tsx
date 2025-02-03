'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (expense: any) => void
  title: string
  initialData?: any
}

export function ExpenseModal({ isOpen, onClose, onSubmit, title, initialData }: ExpenseModalProps) {
  const [expense, setExpense] = useState({
    propertyName: '',
    category: '',
    description: '',
    amount: '',
    date: '',
    status: 'Pending',
  })

  useEffect(() => {
    if (initialData) {
      setExpense(initialData)
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setExpense(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(expense)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="propertyName">Property Name</Label>
            <Input
              id="propertyName"
              name="propertyName"
              value={expense.propertyName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={expense.category}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={expense.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={expense.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={expense.date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={expense.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <Button type="submit" className="w-full">
            {initialData ? 'Update' : 'Create'} Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

