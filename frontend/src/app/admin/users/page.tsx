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
import { Search, Plus, Edit, FileText, User } from 'lucide-react'
import { UserModal } from '@/components/UserModal'
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
import { fetchUsers } from '@/lib/api/fetchUsers'
import { toast } from 'react-toastify'
import { Spinner } from '@/components/ui/spinner'
import { type User } from '@/types/user'
import { fetchGroupRoles } from '@/lib/api/fetchGroupRoles'
import { updateUserRole } from '@/lib/api/updateUserRole'
import { UserGroupModal } from '@/components/UserGroupModal'

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isUserRoleModalOpen, setIsUserRoleModalOpen] = useState(false)
  const [groups, setGroups] = useState<GroupRole[]>([])
  const fetchUsersData = useCallback(async () => {
    setIsLoadingUsers(true)
    try {
      const usersData = await fetchUsers()
      setUsers(usersData)
      const groupsData = await fetchGroupRoles()
      setGroups(groupsData)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast.error(`Failed to fetch users: ${error.message}`)
      setUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    fetchUsersData()
  }, [fetchUsersData])

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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

  const handleAddUser = (newUser: any) => {
    console.log('Adding new user:', newUser)
    setIsAddModalOpen(false)
  }

  const handleEditUser = (updatedUser: any) => {
    console.log('Updating user:', updatedUser)
    setIsEditModalOpen(false)
  }

  const handleStatusChange = (userId: any, newStatus: any) => {
    console.log(`Changing status of user ${userId} to ${newStatus}`)
  }

  const handleDocumentUpload = (userId: any, file: any) => {
    console.log(`Uploading document for user ${userId}:`, file)
    setIsDocumentModalOpen(false)
  }

  const handleUserRoleSubmit = async (userId: any, groupId: any) => {
    console.log(`Assigning group ${groupId} to user ${userId}`)
    console.log(userId)
    const response = await updateUserRole(userId)
    if (response.success) {
      toast.success('User role assigned successfully')
    } else {
      toast.error('Failed to assign user role')
    }
    setIsUserRoleModalOpen(false)
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button className="bg-[#B11E43] hover:bg-[#8f1836]" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search users..."
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 && !isLoadingUsers ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobile}</TableCell>
                  <TableCell>{user.bookings.length}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell>
                    <select
                      value={user.is_active ? 'Active' : 'Inactive'}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedUser(user)
                        setIsEditModalOpen(true)
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedUser(user)
                        setIsDocumentModalOpen(true)
                      }}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedUser(user)
                        setIsUserRoleModalOpen(true)
                      }}>
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
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

      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
        title="Add New User"
      />

      {selectedUser && (
        <UserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditUser}
          title="Edit User"
          initialData={selectedUser}
        />
      )}

      {selectedUser && (
        <DocumentModal
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
          onUpload={(file) => handleDocumentUpload(selectedUser.id, file)}
          title="Upload Document"
        />
      )}

      {selectedUser && (
        <UserGroupModal
          isOpen={isUserRoleModalOpen}
          onClose={() => setIsUserRoleModalOpen(false)}
          onSubmit={handleUserRoleSubmit}
          title="Assign User Role"
          initialData={selectedUser}
          groups={groups}
        />
      )}
    </div>
  )
}

