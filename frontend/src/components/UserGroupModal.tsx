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

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (user: any) => void
  title: string
  initialData?: any
  groups: any[]
}

export function UserGroupModal({ isOpen, onClose, onSubmit, title, initialData, groups }: UserModalProps) {
  const [group, setGroup] = useState({
    user_id: initialData?.id || 0,
    group_id: initialData?.group_id || 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setGroup(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(group)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="group">Group</Label>
            <select
              id="group"
              name="group_id"
              value={group.group_id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value={0}>Select a group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full">
            {initialData ? 'Update' : 'Create'} User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

