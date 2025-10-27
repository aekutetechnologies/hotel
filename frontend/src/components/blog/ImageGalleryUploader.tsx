'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { uploadBlogImage } from '@/lib/api/uploadBlogImage'
import { BlogImage } from '@/types/blog'
import { toast } from 'react-toastify'

interface ImageGalleryUploaderProps {
  images: { id: number; image_url: string; alt_text?: string }[]
  onImagesChange: (images: { id: number; image_url: string; alt_text?: string }[]) => void
  onFeaturedImageChange?: (imageId: number | null) => void
  featuredImageId?: number | null
  className?: string
}

export function ImageGalleryUploader({
  images,
  onImagesChange,
  onFeaturedImageChange,
  featuredImageId,
  className = ''
}: ImageGalleryUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [altText, setAltText] = useState('')

  const handleSetFeatured = (imageId: number) => {
    if (onFeaturedImageChange) {
      const isAlreadyFeatured = featuredImageId === imageId
      onFeaturedImageChange(isAlreadyFeatured ? null : imageId)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      const uploadedImages: { id: number; image_url: string; alt_text?: string }[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const result = await uploadBlogImage(file, altText || file.name)
        uploadedImages.push({
          id: result.id,
          image_url: result.image_url,
          alt_text: result.alt_text
        })
      }

      onImagesChange([...images, ...uploadedImages])
      toast.success(`${files.length} image(s) uploaded successfully`)
    } catch (error) {
      console.error('Failed to upload images:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
      setAltText('')
    }
  }

  const handleRemoveImage = (imageId: number) => {
    // If removing the featured image, clear it
    if (featuredImageId === imageId && onFeaturedImageChange) {
      onFeaturedImageChange(null)
    }
    const updatedImages = images.filter(img => img.id !== imageId)
    onImagesChange(updatedImages)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gallery Images
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Upload multiple images to create an automatic slideshow in your blog post
        </p>
        
        {/* Upload Button */}
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#B11E43] text-white rounded-lg cursor-pointer hover:bg-[#8f1836] transition-colors">
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input
            type="file"
            multiple
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </label>

        {/* Alt Text Input */}
        {images.length === 0 && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Alt text for all images (optional)"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B11E43]"
            />
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => {
            const isFeatured = featuredImageId === image.id
            return (
              <div key={image.id} className="relative group">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || 'Blog image'}
                    width={200}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Featured Badge */}
                {isFeatured && (
                  <div className="absolute top-2 left-2 bg-[#B11E43] text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    {/* Set Featured Button */}
                    {onFeaturedImageChange && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSetFeatured(image.id)
                        }}
                        className={`p-2 rounded-full transition-all ${
                          isFeatured 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-black/70 text-white hover:bg-black/90'
                        }`}
                        title={isFeatured ? 'Remove featured' : 'Set as featured'}
                      >
                        <Star className={`h-4 w-4 ${isFeatured ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage(image.id)
                      }}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No images uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload images to create an automatic slideshow
          </p>
        </div>
      )}
    </div>
  )
}
