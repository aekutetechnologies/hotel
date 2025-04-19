'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, X } from 'lucide-react'

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void
  title: string
}

export function DocumentModal({ isOpen, onClose, onUpload, title }: DocumentModalProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
    }
  }

  const handleRemove = () => {
    setFile(null)
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
          <div>
            {!file ? (
              <label className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload a document
                  </span>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative w-full h-32 bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200">
                <div className="max-w-[80%] overflow-hidden text-ellipsis">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <Button
                  variant="neutral"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={!file}>
            Upload Document
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

