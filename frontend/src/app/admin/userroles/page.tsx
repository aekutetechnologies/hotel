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
import { UserModal } from '@/components/UserModal'
import { toast } from 'react-toastify'
import { Spinner } from '@/components/ui/spinner'
import { type User } from '@/types/user'
import { fetchUserRoles } from '@/lib/api/fetchUserRoles'
import { fetchPermissions } from '@/lib/api/fetchPermissions'

export default function UserRoles() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUserRole, setSelectedUserRole] = useState<User | null>(null)
  const [userRoles, setUserRoles] = useState<User[]>([])
  const [isLoadingUserRoles, setIsLoadingUserRoles] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])

  const fetchUserRoles = useCallback(async () => {
    setIsLoadingUserRoles(true)
    try {
      const userRolesData = await fetchUserRoles()
      setUserRoles(userRolesData)
      const permissionsData = await fetchPermissions()
      setPermissions(permissionsData)
    } catch (error: any) {
      console.error('Error fetching user roles:', error)
      toast.error(`Failed to fetch user roles: ${error.message}`)
      setUserRoles([])
    } finally {
      setIsLoadingUserRoles(false)
    }
  }, [])

  useEffect(() => {
    fetchUserRoles()
  }, [fetchUserRoles])

  const filteredUserRoles = userRoles.filter(userRole =>
    userRole.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUserRole = (newUserRole: any) => {
    console.log('Adding new user:', newUserRole )
    setIsAddModalOpen(false)
  }

  const handleEditUserRole = (updatedUserRole: any) => {
    console.log('Updating user:', updatedUserRole)
    setIsEditModalOpen(false)
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
              <TableHead>Created Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUserRoles ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : filteredUserRoles.length === 0 && !isLoadingUserRoles ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUserRoles.map((userRole) => (
                <TableRow key={userRole.id}>
                  <TableCell className="font-medium">{userRole.name}</TableCell>
                  <TableCell>{new Date(userRole.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell>{userRole.is_active}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedUserRole(userRole)
                        setIsEditModalOpen(true)
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUserRole}
        title="Add New User Role"
        permissions={permissions}
      />

      {selectedUserRole && (
        <UserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditUserRole}
          title="Edit User"
          initialData={selectedUserRole}
          permissions={permissions}
        />
      )}

    </div>
  )
}
