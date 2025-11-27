'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ImageCropper } from "./ImageCropper"
import { Upload, X } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
          setShowCropper(true)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        onFileUpload(selectedFile)
      }
    }
  }

  const handleCropComplete = (croppedImage: Blob) => {
    // Convert blob to data URL for preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(croppedImage)
    
    setShowCropper(false)
    
    // Create a file from the blob
    const blobType = croppedImage.type || file?.type || 'image/jpeg'
    const baseName = file?.name?.replace(/\.[^/.]+$/, '') || 'cropped_image'
    const extension = blobType.split('/')[1] || 'jpg'
    const croppedFile = new File([croppedImage], `${baseName}.${extension}`, { type: blobType })
    onFileUpload(croppedFile)
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <div>
      {!file && (
        <label className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Upload a file
            </span>
          </div>
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
      )}
      {file && !showCropper && (
        <div className="relative">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
          ) : (
            <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">{file.name}</span>
            </div>
          )}
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
      {showCropper && preview && (
        <ImageCropper
          image={preview}
          aspectRatio={1}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  )
}

