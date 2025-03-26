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
      <DialogContent className="w-full max-w-md sm:max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <FileUpload onFileUpload={handleFileUpload} />
          <Button type="submit" className="w-full" disabled={!file}>
            Upload Document
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

