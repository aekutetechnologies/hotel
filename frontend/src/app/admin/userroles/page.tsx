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
import { toast } from 'react-toastify'
import { Spinner } from '@/components/ui/spinner'
import { fetchGroupRoles } from '@/lib/api/fetchGroupRoles'
import { fetchPermissions } from '@/lib/api/fetchPermissions'
import { GroupRole, GroupRoleFormData } from '@/types/groupRole'
import { Permission, PermissionData } from '@/types/permission'
import { GroupRoleModal } from '@/components/GroupRoleModal'
import { createGroupRole } from '@/lib/api/createGroupRole'
import { updateGroupRole } from '@/lib/api/updateGroupRole'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function UserRoles() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGroupRole, setSelectedGroupRole] = useState<GroupRole | null>(null)
  const [groupRoles, setGroupRoles] = useState<GroupRole[]>([])
  const [isLoadingGroupRoles, setIsLoadingGroupRoles] = useState(false)
  const [permissions, setPermissions] = useState<PermissionData[]>([])

  const fetchUserRoles = useCallback(async () => {
    setIsLoadingGroupRoles(true)
    try {
      const groupRolesData = await fetchGroupRoles()
      setGroupRoles(groupRolesData)
      const permissionsData = await fetchPermissions()
      setPermissions(permissionsData)
    } catch (error: any) {
      console.error('Error fetching user roles:', error)
      toast.error(`Failed to fetch user roles: ${error.message}`)
      setGroupRoles([])
    } finally {
      setIsLoadingGroupRoles(false)
    }
  }, [])

  useEffect(() => {
    fetchUserRoles()
  }, [fetchUserRoles])

  const filteredGroupRoles = groupRoles.filter(groupRole =>
    groupRole.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUserRole = async (newUserRole: GroupRoleFormData) => {
    console.log('Adding new user role:', newUserRole)
    const result = await createGroupRole(newUserRole)
    
    if (result.success) {
      toast.success('User role added successfully')
      setIsAddModalOpen(false)
      fetchUserRoles() // Refresh the data
    } else {
      toast.error('Failed to add user role')
    }
  }

  const handleEditGroupRole = async (updatedGroupRole: GroupRoleFormData) => {
    if (!selectedGroupRole) return;
    
    console.log('Updating user role:', updatedGroupRole)
    const result = await updateGroupRole(selectedGroupRole.id, updatedGroupRole)
    
    if (result.success) {
      toast.success('User role updated successfully')
      setIsEditModalOpen(false)
      fetchUserRoles() // Refresh the data
    } else {
      toast.error('Failed to update user role')
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">User Roles</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="bg-[#B11E43] hover:bg-[#8f1836]" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New User Role
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new user role</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search user roles..."
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
            {isLoadingGroupRoles ? (
              <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                <div className="flex justify-center items-center h-[70vh]">
                  <Spinner className="h-12 w-12" />
                </div>
              </TableCell>
            </TableRow>
            ) : filteredGroupRoles.length === 0 && !isLoadingGroupRoles ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredGroupRoles.map((GroupRole) => (
                <TableRow key={GroupRole.id}>
                  <TableCell className="font-medium">{GroupRole.name}</TableCell>
                  <TableCell>{new Date(GroupRole.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell>{GroupRole.is_active ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="neutral" size="icon" onClick={() => {
                              setSelectedGroupRole(GroupRole)
                              setIsEditModalOpen(true)
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit user role</p>
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

      <GroupRoleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUserRole}
        title="Add New User Role"
        permissions={permissions}
      />

      {selectedGroupRole && (
        <GroupRoleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditGroupRole}
          title="Edit Group Role"
          initialData={selectedGroupRole}
          permissions={permissions}
        />
      )}

    </div>
  )
}
