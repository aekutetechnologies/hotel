'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { Check, Loader2, Pen, Trash2, X as XIcon } from 'lucide-react'

interface ConfigItem {
  id: number
  name: string
}

interface ManageConfigModalProps {
  title: string
  isOpen: boolean
  onClose: () => void
  items: ConfigItem[]
  onCreate: (name: string) => Promise<void>
  onUpdate: (id: number, name: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function ManageConfigModal({
  title,
  isOpen,
  onClose,
  items,
  onCreate,
  onUpdate,
  onDelete,
}: ManageConfigModalProps) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [creating, setCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setNewName('')
      setEditingId(null)
      setEditingName('')
      setCreating(false)
      setUpdatingId(null)
      setDeletingId(null)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleCreate = async () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      toast.error('Name cannot be empty')
      return
    }
    setCreating(true)
    try {
      await onCreate(trimmed)
      setNewName('')
      toast.success(`${title} created`)
    } catch (error: any) {
      toast.error(error?.message || `Failed to create ${title.toLowerCase()}`)
    } finally {
      setCreating(false)
    }
  }

  const startEditing = (item: ConfigItem) => {
    setEditingId(item.id)
    setEditingName(item.name)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleUpdate = async (id: number) => {
    const trimmed = editingName.trim()
    if (!trimmed) {
      toast.error('Name cannot be empty')
      return
    }
    setUpdatingId(id)
    try {
      await onUpdate(id, trimmed)
      toast.success(`${title} updated`)
      cancelEditing()
    } catch (error: any) {
      toast.error(error?.message || `Failed to update ${title.toLowerCase()}`)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`)
    if (!confirmed) return
    setDeletingId(id)
    try {
      await onDelete(id)
      toast.success(`${title} deleted`)
    } catch (error: any) {
      toast.error(error?.message || `Failed to delete ${title.toLowerCase()}`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{`Manage ${title}`}</h3>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`Add new ${title.toLowerCase()}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreate()
              }
            }}
          />
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
          </Button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {items.length === 0 && (
            <p className="text-sm text-gray-500">No entries yet. Add one above.</p>
          )}
          {items.map((item) => {
            const isEditing = editingId === item.id
            const isUpdating = updatingId === item.id
            const isDeleting = deletingId === item.id
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded border border-gray-200 p-2"
              >
                {isEditing ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1"
                  />
                ) : (
                  <span className="flex-1 text-sm text-gray-800">{item.name}</span>
                )}
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleUpdate(item.id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEditing}>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => startEditing(item)}>
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

