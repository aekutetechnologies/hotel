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
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createExpense } from '@/lib/api/createExpense'
import { updateExpense } from '@/lib/api/updateExpense'
import { toast } from 'react-toastify'
import { fetchExpenseCategory } from '@/lib/api/fetchExpenseCategory'
import { Spinner } from '@/components/ui/spinner'

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (expense: any) => void
  title: string
  initialData?: any
  properties: any[]
}

interface ExpenseFormData {
  property: string
  category: string
  description: string
  amount: number
  date: string
  status: string
}

export function ExpenseModal({ isOpen, onClose, onSubmit, title, initialData, properties }: ExpenseModalProps) {
  const [expenseFormData, setExpenseFormData] = useState<ExpenseFormData>({
    property: initialData?.property.id || '',
    category: initialData?.category.id || '',
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    status: initialData?.status || 'pending',
  })
  const [expenseCategories, setExpenseCategories] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const isUpdate = !!initialData?.id

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const categories = await fetchExpenseCategory()
        setExpenseCategories(categories)
      } catch (error: any) {
        console.error('Error fetching expense categories:', error)
        toast.error(`Failed to load expense categories: ${error.message}`)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    if (initialData) {
      setExpenseFormData({
        property: initialData.property.id || '',
        category: initialData.category.id || '',
        description: initialData.description || '',
        amount: initialData.amount || 0,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        status: initialData.status || 'pending',
      })
    } else {
      setExpenseFormData({
        property: '',
        category: '',
        description: '',
        amount: 0,
        date: '',
        status: 'pending',
      })
    }
  }, [initialData, isOpen])


  const handleCategoryChange = (value: string) => {
    setExpenseFormData(prev => ({ ...prev, category: value }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setExpenseFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numberValue = value === '' ? 0 : parseFloat(value)
    setExpenseFormData(prev => ({ ...prev, [name]: numberValue }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        ...expenseFormData,
        property: parseInt(expenseFormData.property),
        category: parseInt(expenseFormData.category),
      }
      const response = isUpdate
        ? await updateExpense(initialData.id, payload)
        : await createExpense(payload)

      if (response.success) {
        toast.success(`Expense ${isUpdate ? 'updated' : 'created'} successfully!`)
        onClose()
      } else {
        toast.error(`Failed to ${isUpdate ? 'update' : 'create'} expense.`)
      }
    } catch (error: any) {
      console.error(`Expense ${isUpdate ? 'update' : 'creation'} failed:`, error)
      toast.error(error.message || `Failed to ${isUpdate ? 'update' : 'create'} expense.`)
    }

    if (onSubmit) {
      onSubmit(expenseFormData)
    }
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
            {isUpdate ? (
              <Input
                id="propertyName"
                name="propertyName"
                value={initialData?.property?.name}
                disabled
              />
            ) : (
              <Select onValueChange={(value: string) => setExpenseFormData(prev => ({ ...prev, property: value }))} defaultValue={initialData?.property?.id ? String(initialData.property.id) : expenseFormData.property}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property: any) => (
                    <SelectItem key={property.id} value={String(property.id)}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            {isLoadingCategories ? (
              <Spinner size="sm" className="ml-2" />
            ) : (
              <Select onValueChange={handleCategoryChange} defaultValue={initialData?.category?.id ? String(initialData.category.id) : expenseFormData.category}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select expense category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category: any) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={expenseFormData.description}
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
              value={String(expenseFormData.amount)}
              onChange={handleAmountChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={expenseFormData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={expenseFormData.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">
              {isUpdate ? 'Update Expense' : 'Create Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
