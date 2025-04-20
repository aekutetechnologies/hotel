'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, X, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void
  title: string
}

// Define 1MB in bytes (1024 * 1024)
const MAX_FILE_SIZE = 1048576

export function DocumentModal({ isOpen, onClose, onUpload, title }: DocumentModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [sizeError, setSizeError] = useState<boolean>(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Check if file size exceeds 1MB
      if (selectedFile.size > MAX_FILE_SIZE) {
        setSizeError(true)
        toast.error("File size exceeds 1MB. Please upload a file below 1MB.")
        return
      }
      
      setSizeError(false)
      setFile(selectedFile)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setSizeError(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file && !sizeError) {
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
            {!file && !sizeError ? (
              <label className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload a document
                  </span>
                  <span className="mt-1 text-xs text-gray-500">
                    Maximum file size: 1MB
                  </span>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            ) : sizeError ? (
              <div className="relative w-full h-32 bg-red-50 flex items-center justify-center rounded-lg border border-red-200">
                <div className="text-center px-4">
                  <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                  <div className="font-medium text-red-700">File size exceeds 1MB</div>
                  <div className="text-sm text-red-600">Please upload a file below 1MB</div>
                  <Button
                    variant="neutral"
                    size="sm"
                    className="mt-2"
                    onClick={handleRemove}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-32 bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200">
                <div className="max-w-[80%] overflow-hidden text-ellipsis">
                  <div className="font-medium">{file?.name}</div>
                  <div className="text-xs text-gray-500">{(file ? file.size / 1024 : 0).toFixed(1)} KB</div>
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
          <Button type="submit" className="w-full" disabled={!file || sizeError}>
            Upload Document
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

