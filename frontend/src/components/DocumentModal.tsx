'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileUpload } from "./FileUpload"

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void
  title: string
}

export function DocumentModal({ isOpen, onClose, onUpload, title }: DocumentModalProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      onUpload(file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload onFileUpload={handleFileUpload} />
          <Button type="submit" className="w-full" disabled={!file}>
            Upload Document
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

