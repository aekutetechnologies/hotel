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
import { Search, Plus, Edit, FileText, User as UserIcon, House, Upload, Trash2 } from 'lucide-react'
import { UserModal } from '@/components/UserModal'
import { DocumentModal } from '@/components/DocumentModal'
import { GenericModal } from '@/components/GenericModal'
import { UserPropertiesModal } from '@/components/UserPropertiesModal'
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
import { type User, type UserDocument } from '@/types/user'
import { fetchGroupRoles } from '@/lib/api/fetchGroupRoles'
import { updateUserRole } from '@/lib/api/updateUserRole'
import { listUserDoc } from '@/lib/api/listUserDocs'
import { uploadUserDoc } from '@/lib/api/uploadUserDocument'
import { deleteUserDoc } from '@/lib/api/deleteUserDoc'
import { UserGroupModal } from '@/components/UserGroupModal'
import { GroupRole } from '@/types/groupRole'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGuard } from '@/components/PermissionGuard'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/lib/permissions'
import { updateProfile } from '@/lib/api/updateProfile'

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [isDocumentListModalOpen, setIsDocumentListModalOpen] = useState(false)
  const [isPropertiesModalOpen, setIsPropertiesModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [isLoadingUpload, setIsLoadingUpload] = useState(false)
  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [isUserRoleModalOpen, setIsUserRoleModalOpen] = useState(false)
  const [groups, setGroups] = useState<GroupRole[]>([])
  const itemsPerPage = 15
  const { can, isLoaded } = usePermissions()

  const fetchUsersData = useCallback(async () => {
    // Don't fetch if no permission
    if (!isLoaded || !can('admin:user:view')) return

    console.log('Fetching users data...')
    console.log('isLoaded', isLoaded)
    console.log('can', can)
    
    setIsLoadingUsers(true)
    try {
      console.log('Fetching users data...')
      const usersResponse = await fetchUsers()
      console.log('Users data fetched:', usersResponse, typeof usersResponse)
      
      // Check if the response is an object with results property (pagination format)
      const usersData = Array.isArray(usersResponse) 
        ? usersResponse 
        : usersResponse && typeof usersResponse === 'object' && 'results' in (usersResponse as any) 
          ? (usersResponse as any).results 
          : [];
          
      console.log('Processed users data:', usersData)
      setUsers(Array.isArray(usersData) ? usersData : [])
      
      const groupsResponse = await fetchGroupRoles()
      console.log('Groups data fetched:', groupsResponse)
      
      // Check if the response is an object with results property
      const groupsData = Array.isArray(groupsResponse) 
        ? groupsResponse 
        : groupsResponse && typeof groupsResponse === 'object' && 'results' in (groupsResponse as any) 
          ? (groupsResponse as any).results 
          : [];
          
      console.log('Processed groups data:', groupsData)
      setGroups(Array.isArray(groupsData) ? groupsData : [])
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast.error(`Failed to fetch users: ${error.message}`)
      setUsers([])
      setGroups([])
    } finally {
      setIsLoadingUsers(false)
    }
  }, [isLoaded])

  useEffect(() => {
    fetchUsersData()
  }, [fetchUsersData])
  
  const fetchDocuments = useCallback(async (userId: number) => {
    setIsLoadingDocuments(true)
    try {
      const fetchedDocuments = await listUserDoc(userId.toString())
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
    if (isDocumentListModalOpen && selectedUser) {
      fetchDocuments(selectedUser.id)
    }
  }, [isDocumentListModalOpen, selectedUser, fetchDocuments])

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const shouldShowPagination = filteredUsers.length > itemsPerPage

  const paginatedUsers = shouldShowPagination
    ? filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredUsers

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

  const handleStatusChange = async (userId: number, newStatus: boolean) => {
    try {
      const response = await updateProfile({
        user_id: userId,
        is_active: newStatus
      });
      toast.success('User status updated successfully!');
      fetchUsersData(); // Refresh the user list
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error(`Failed to update user status: ${error.message}`);
    }
  };

  const handleEditUser = async (updatedUser: any) => {
    try {
      const profileData = {
        user_id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        is_active: updatedUser.is_active
      };
  
      const response = await updateProfile(profileData);
      toast.success('User updated successfully!');
      setIsEditModalOpen(false);
      fetchUsersData(); // Refresh the user list
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(`Failed to update user: ${error.message}`);
    }
  };

  const handleDocumentUpload = async (userId: number, file: File) => {
    setIsLoadingUpload(true)
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('user_id', userId.toString());

      const response = await uploadUserDoc(formData);
      if (response.success) {
        toast.success('Document uploaded successfully!')
        setIsDocumentModalOpen(false)
        fetchUsersData() // Refresh data after upload
      } else {
        toast.error('Failed to upload document.');
      }
    } catch (error: any) {
      console.error('Document upload failed:', error);
      toast.error(error.message || 'Failed to upload document.');
    } finally {
      setIsLoadingUpload(false)
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await deleteUserDoc(documentId.toString())
      toast.success('Document deleted successfully!')
      if (selectedUser) {
        fetchDocuments(selectedUser.id)
      }
    } catch (error: any) {
      console.error('Error deleting document:', error)
      toast.error(`Failed to delete document: ${error.message}`)
    }
  }

  const handleUserRoleSubmit = async (userId: any, groupId: any) => {
    console.log(`Assigning group ${groupId} to user ${userId}`)
    console.log(userId)
    try {
      const response = await updateUserRole({ 
        user_id: userId, 
        group_id: groupId 
      })
      toast.success('User role assigned successfully')
      fetchUsersData()
    } catch (error: any) {
      toast.error(`Failed to assign user role: ${error.message || 'Unknown error'}`)
    }
    setIsUserRoleModalOpen(false)
  }

  const handlePropertiesSubmit = () => {
    fetchUsersData() // Refresh user data after updating properties
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center p-12 h-[70vh]">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  // If no permission to view users
  if (!can('admin:user:view')) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view users.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <PermissionGuard permissions={['admin:user:view']} requireAll={false}>
          <Button className="bg-[#B11E43] hover:bg-[#8f1836]" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </PermissionGuard>
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
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>User Group</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <div className="flex justify-center items-center h-[70vh]">
                    <Spinner className="h-12 w-12" />
                  </div>
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
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobile}</TableCell>
                  <TableCell>{user.user_group}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell>
                    <PermissionGuard permissions={['admin:user:view']} requireAll={false}>
                      <select
                        value={user.is_active ? 'Active' : 'Inactive'}
                        onChange={(e) => handleStatusChange(user.id, e.target.value === 'Active')}
                        className="border rounded px-2 py-1"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </PermissionGuard>
                    {!can('admin:user:view') && (
                      <span className={`px-2 py-1 rounded text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <PermissionGuard permissions={['admin:user:view']} requireAll={false}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="neutral" size="icon" onClick={() => {
                                setSelectedUser(user)
                                setIsEditModalOpen(true)
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit user</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </PermissionGuard>

                      <PermissionGuard permissions={['property:update']} requireAll={false}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="neutral" size="icon" onClick={() => {
                                setSelectedUser(user)
                                setIsPropertiesModalOpen(true)
                              }}>
                                <House className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Update properties</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </PermissionGuard>

                      <PermissionGuard permissions={['admin:user:view']} requireAll={false}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="neutral" size="icon" onClick={() => {
                                setSelectedUser(user)
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
                      </PermissionGuard>

                      <PermissionGuard permissions={['admin:user:view']} requireAll={false}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="neutral" size="icon" onClick={() => {
                                setSelectedUser(user)
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
                      </PermissionGuard>

                      <PermissionGuard permissions={['admin:user:assign-permissions']} requireAll={false}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="neutral" size="icon" onClick={() => {
                                setSelectedUser(user)
                                setIsUserRoleModalOpen(true)
                              }}>
                                <UserIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Assign user role</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </PermissionGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {shouldShowPagination && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                  }}
                  aria-disabled={currentPage === 1}
                  size="default"
                />
              </PaginationItem>
              {generatePageNumbers().map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {pageNumber === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber as number);
                      }}
                      isActive={currentPage === pageNumber}
                      size="default"
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  }}
                  aria-disabled={currentPage === totalPages}
                  size="default"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
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
        <GenericModal
          isOpen={isDocumentListModalOpen}
          onClose={() => {
            setIsDocumentListModalOpen(false)
            setDocuments([])
          }}
          title="User Documents"
          description={`Documents for user ${selectedUser.name}`}
        >
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoadingDocuments ? (
              <div className="text-center py-4 flex justify-center items-center h-[70vh]">
                <Spinner className="h-12 w-12" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-gray-500 text-center">No documents found for this user</p>
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

      {selectedUser && (
        <UserGroupModal
          isOpen={isUserRoleModalOpen}
          onClose={() => setIsUserRoleModalOpen(false)}
          onSubmit={(data) => handleUserRoleSubmit(selectedUser.id, data.group_id)}
          title="Assign User Role"
          initialData={selectedUser}
          groups={groups}
        />
      )}

      {selectedUser && (
        <UserPropertiesModal
          isOpen={isPropertiesModalOpen}
          onClose={() => setIsPropertiesModalOpen(false)}
          user={selectedUser}
          onSuccess={handlePropertiesSubmit}
        />
      )}
    </div>
  )
}

