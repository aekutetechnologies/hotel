'use client'

import { useState } from 'react'
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
import { expenses } from '@/lib/dummy-data'
import { ExpenseModal } from '@/components/ExpenseModal'
import { DocumentModal } from '@/components/DocumentModal'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredExpenses = expenses.filter(expense =>
    expense.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)

  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleAddExpense = (newExpense) => {
    // In a real app, you would add the expense to your backend here
    console.log('Adding new expense:', newExpense)
    setIsAddModalOpen(false)
  }

  const handleEditExpense = (updatedExpense) => {
    // In a real app, you would update the expense in your backend here
    console.log('Updating expense:', updatedExpense)
    setIsEditModalOpen(false)
  }

  const handleStatusChange = (expenseId, newStatus) => {
    // In a real app, you would update the status in your backend here
    console.log(`Changing status of expense ${expenseId} to ${newStatus}`)
  }

  const handleDocumentUpload = (expenseId, file) => {
    // In a real app, you would upload the document to your backend here
    console.log(`Uploading document for expense ${expenseId}:`, file)
    setIsDocumentModalOpen(false)
  }

  const generatePageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('ellipsis')
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('ellipsis')
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
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
            {paginatedExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.propertyName}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>₹{expense.amount}</TableCell>
                <TableCell>{expense.date}</TableCell>
                <TableCell>
                  <select
                    value={expense.status}
                    onChange={(e) => handleStatusChange(expense.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
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
            ))}
          </TableBody>
        </Table>
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {generatePageNumbers().map((pageNumber, index) => (
              <PaginationItem key={index}>
                {pageNumber === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNumber as number)}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <ExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddExpense}
        title="Add New Expense"
      />

      {selectedExpense && (
        <ExpenseModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditExpense}
          title="Edit Expense"
          initialData={selectedExpense}
        />
      )}

      {selectedExpense && (
        <DocumentModal
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
          onUpload={(file) => handleDocumentUpload(selectedExpense.id, file)}
          title="Upload Document"
        />
      )}
    </div>
  )
}

