'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Plus, Edit, FileText } from 'lucide-react'
import { ExpenseModal } from '@/components/ExpenseModal'
import { DocumentModal } from '@/components/DocumentModal'
import { toast } from 'react-toastify'
import { Spinner } from '@/components/ui/spinner'
import { type Expense } from '@/types/expense'
import { fetchExpenseCategory } from '@/lib/api/fetchExpenseCategory'
import { listExpenseDoc } from '@/lib/api/listExpenseDocs'
import { uploadExpenseDoc } from '@/lib/api/uploadExpenseDoc'
import { updateExpense } from '@/lib/api/updateExpense'
import { createExpense } from '@/lib/api/createExpense'
import { fetchExpenses } from '@/lib/api/fetchExpenses'
import { fetchProperties } from '@/lib/api/fetchProperties'
import { type Property } from '@/types/property'

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false)
  const [expenseCategories, setExpenseCategories] = useState([])
  const [properties, setProperties] = useState<Property[]>([])
  const fetchExpensesData = useCallback(async () => {
    setIsLoadingExpenses(true)
    try {
      const expensesData = await fetchExpenses()
      setExpenses(expensesData)
      const propertiesData = await fetchProperties()
      setProperties(propertiesData)
    } catch (error: any) {
      console.error('Error fetching expenses:', error)
      toast.error(`Failed to fetch expenses: ${error.message}`)
      setExpenses([])
    } finally {
      setIsLoadingExpenses(false)
    }
  }, [])

  useEffect(() => {
    fetchExpensesData()
  }, [fetchExpensesData])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchExpenseCategory()
        setExpenseCategories(categories)
      } catch (error: any) {
        console.error('Error fetching expense categories:', error)
        toast.error(`Failed to load expense categories: ${error.message}`)
      }
    }

    loadCategories()
  }, [])

  const filteredExpenses = expenses.filter(expense =>
    expense.property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddExpense = async (newExpense: ExpenseFormData) => {
    try {
      const response = await createExpense(newExpense)
      if (response.success) {
        toast.success('Expense created successfully!')
        fetchExpensesData() // Refresh data to include new expense
        setIsAddModalOpen(false)
      } else {
        toast.error('Failed to create expense.')
      }
    } catch (error: any) {
      console.error('Expense creation failed:', error)
      toast.error(error.message || 'Failed to create expense.')
    }
  }

  const handleEditExpense = async (updatedExpense: Expense) => {
    if (!selectedExpense) return; // Ensure selectedExpense is not null

    try {
      const response = await updateExpense(selectedExpense.id.toString(), updatedExpense)
      if (response.success) {
        toast.success('Expense updated successfully!')
        fetchExpensesData() // Refresh data to reflect updates
        setIsEditModalOpen(false)
        setSelectedExpense(null) // Clear selected expense after edit
      } else {
        toast.error('Failed to update expense.')
      }
    } catch (error: any) {
      console.error('Expense update failed:', error)
      toast.error(error.message || 'Failed to update expense.')
    }
  }

  const handleStatusChange = (expenseId: any, newStatus: any) => {
    // In a real app, you would update the status in your backend here
    console.log(`Changing status of expense ${expenseId} to ${newStatus}`)
  }

  const handleDocumentUpload = async (file: File) => {
    if (!selectedExpense) return;

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('expense_id', selectedExpense.id.toString());

      const response = await uploadExpenseDoc(formData);
      if (response.success) {
        toast.success('Document uploaded successfully!')
        setIsDocumentModalOpen(false)
      } else {
        toast.error('Failed to upload document.');
      }
    } catch (error: any) {
      console.error('Document upload failed:', error);
      toast.error(error.message || 'Failed to upload document.');
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button className="bg-[#B11E43] hover:bg-[#8f1836]" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Expense
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search expenses..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingExpenses ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : filteredExpenses.length === 0 && !isLoadingExpenses ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.property.name}</TableCell>
                  <TableCell>{expense.category.name}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>₹{expense.amount}</TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell>
                    <select
                      value={expense.status}
                      onChange={(e) => handleStatusChange(expense.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedExpense(expense)
                        setIsEditModalOpen(true)
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedExpense(expense)
                        setIsDocumentModalOpen(true)
                      }}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddExpense}
        title="Add New Expense"
        properties={properties}
      />

      {selectedExpense && (
        <ExpenseModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditExpense}
          title="Edit Expense"
          initialData={selectedExpense}
          properties={properties}
        />
      )}

      {selectedExpense && (
        <DocumentModal
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
          onUpload={(file) => handleDocumentUpload(file)}
          title="Upload Document"
        />
      )}
    </div>
  )
}

