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
import { Search, Plus, Edit, FileText, Trash2, Upload } from 'lucide-react'
import { ExpenseModal } from '@/components/ExpenseModal'
import { DocumentModal } from '@/components/DocumentModal'
import { GenericModal } from '@/components/GenericModal'
import { toast } from 'react-toastify'
import { Spinner } from '@/components/ui/spinner'
import { type Expense, type ExpenseFormData, type ExpenseCategory, type ExpenseDocument } from '@/types/expense'
import { fetchExpenseCategory } from '@/lib/api/fetchExpenseCategory'
import { listExpenseDoc } from '@/lib/api/listExpenseDocs'
import { uploadExpenseDoc } from '@/lib/api/uploadExpenseDoc'
import { updateExpense } from '@/lib/api/updateExpense'
import { createExpense } from '@/lib/api/createExpense'
import { fetchExpenses } from '@/lib/api/fetchExpenses'
import { fetchProperties } from '@/lib/api/fetchProperties'
import { deleteExpenseDoc } from '@/lib/api/deleteExpenseDoc'
import { type Property } from '@/types/property'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [isDocumentListModalOpen, setIsDocumentListModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [documents, setDocuments] = useState<ExpenseDocument[]>([])
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
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

  const fetchDocuments = useCallback(async (expenseId: number) => {
    setIsLoadingDocuments(true)
    try {
      const fetchedDocuments = await listExpenseDoc(expenseId.toString())
      setDocuments(fetchedDocuments)
    } catch (error: any) {
      console.error('Error fetching documents:', error)
      toast.error(`Failed to fetch documents: ${error.message}`)
      setDocuments([])
    } finally {
      setIsLoadingDocuments(false)
    }
  }, [])

  useEffect(() => {
    if (isDocumentListModalOpen && selectedExpense) {
      fetchDocuments(selectedExpense.id)
    }
  }, [isDocumentListModalOpen, selectedExpense, fetchDocuments])

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

  const handleEditExpense = async (updatedExpense: ExpenseFormData) => {
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

  const handleStatusChange = (expenseId: number, newStatus: string) => {
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
        fetchExpensesData() // Refresh data to reflect uploaded document
      } else {
        toast.error('Failed to upload document.');
      }
    } catch (error: any) {
      console.error('Document upload failed:', error);
      toast.error(error.message || 'Failed to upload document.');
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await deleteExpenseDoc(documentId.toString())
      toast.success('Document deleted successfully!')
      if (selectedExpense) {
        fetchDocuments(selectedExpense.id)
      }
    } catch (error: any) {
      console.error('Error deleting document:', error)
      toast.error(`Failed to delete document: ${error.message}`)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="bg-[#B11E43] hover:bg-[#8f1836]" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Expense
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new expense record</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="neutral" size="icon" onClick={() => {
                              setSelectedExpense(expense)
                              setIsEditModalOpen(true)
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit expense</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="neutral" size="icon" onClick={() => {
                              setSelectedExpense(expense)
                              setIsDocumentModalOpen(true)
                            }}>
                              <Upload className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Upload document</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="neutral" size="icon" onClick={() => {
                              setSelectedExpense(expense)
                              setIsDocumentListModalOpen(true)
                            }}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View documents</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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

      {selectedExpense && (
        <GenericModal
          isOpen={isDocumentListModalOpen}
          onClose={() => {
            setIsDocumentListModalOpen(false)
            setDocuments([])
          }}
          title="Expense Documents"
          description={`Documents for Expense #${selectedExpense.id}`}
        >
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoadingDocuments ? (
              <div className="text-center py-4">
                <Spinner />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-gray-500 text-center">No documents found for this expense</p>
            ) : (
              <div className="space-y-4">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{document.document.split('/').pop()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={document.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        View
                      </a>
                      <Button
                        variant="neutral"
                        size="icon"
                        onClick={() => handleDeleteDocument(document.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GenericModal>
      )}
    </div>
  )
}

