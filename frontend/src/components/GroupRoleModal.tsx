'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface GroupRoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (groupRole: GroupRole) => void
  title: string
  initialData?: GroupRole
  permissions: Permission[]
}

interface GroupRole {
  id: number
  name: string
  permissions: string[] // Stores permission IDs as strings
  is_active: boolean
}

interface Permission {
  id: number
  name: string
  description: string
}

export function GroupRoleModal({ isOpen, onClose, onSubmit, title, initialData, permissions }: GroupRoleModalProps) {
  const [groupRole, setGroupRole] = useState<GroupRole>({
    id: 0,
    name: '',
    permissions: [],
    is_active: true,
  })
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false)

  useEffect(() => {
    if (initialData) {
      // Convert initial permissions (objects) to array of ID strings
      const initialPermissions = initialData.permissions
        .map((p: any) => typeof p === 'object' ? String(p.id) : String(p))
      
      setGroupRole({
        id: initialData.id,
        name: initialData.name,
        permissions: initialPermissions,
        is_active: initialData.is_active
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setGroupRole(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(groupRole)
  }

  const filteredPermissions = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase()
    return permissions.filter(permission =>
      permission.name.toLowerCase().includes(lowerQuery)
    )
  }, [permissions, searchQuery])

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setGroupRole(prev => ({
        ...prev,
        permissions: [...prev.permissions, permissionId],
      }))
    } else {
      console.log('permissionId', permissionId)
      setGroupRole(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => id !== permissionId),
      }))
    }
  }

  const handleSelectAll = () => {
    setSelectAllChecked(!selectAllChecked)
    if (!selectAllChecked) {
      const allFilteredPermissionIds = filteredPermissions.map(p => String(p.id))
      setGroupRole(prev => ({
        ...prev,
        permissions: Array.from(new Set([...prev.permissions, ...allFilteredPermissionIds])),
      }))
    } else {
      const filteredPermissionIds = filteredPermissions.map(p => String(p.id))
      setGroupRole(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => !filteredPermissionIds.includes(id)),
      }))
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
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={groupRole.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label className="block pb-2">If Active</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="status-active"
                  name="is_active"
                  value="true"
                  checked={groupRole.is_active === true}
                  onChange={(e) => setGroupRole(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                  className="accent-[#B11E43] h-4 w-4 border-gray-300 focus:ring-2 focus:ring-[#B11E43]"
                />
                <Label htmlFor="status-active">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="status-inactive"
                  name="is_active"
                  value="false"
                  checked={groupRole.is_active === false}
                  onChange={(e) => setGroupRole(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                  className="accent-[#B11E43] h-4 w-4 border-gray-300 focus:ring-2 focus:ring-[#B11E43]"
                />
                <Label htmlFor="status-inactive">No</Label>
              </div>
            </div>
          </div>
          <div>
            <Label>Permissions</Label>
            <div className="flex justify-between items-center mt-2">
              <Input
                type="search"
                placeholder="Search permissions..."
                className="max-w-sm mr-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="space-x-2 flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectAllChecked ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
            <div className="flex flex-col overflow-y-auto space-y-2 mt-2 max-h-48">
              {filteredPermissions.map((permission) => {
                const isChecked = groupRole.permissions.includes(String(permission.id))
                return (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      name="permissions"
                      value={permission.id}
                      checked={isChecked}
                      onCheckedChange={(checked) => handlePermissionChange(String(permission.id), !!checked)}
                      className="accent-[#B11E43] h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-[#B11E43]"
                    />
                    <Label htmlFor={`permission-${permission.id}`} className="text-sm font-medium text-gray-700">
                      {permission.name}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
          <Button type="submit" className="w-full">
            {initialData ? 'Update' : 'Create'} User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}