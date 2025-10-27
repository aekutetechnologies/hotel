"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ImageWithId {
  id: number;
  image: string;
  category?: string;
}

interface GalleryModalProps {
  images: ImageWithId[]
  initialIndex: number
  onClose: () => void
  activeCategory?: string
}

export function GalleryModal({ images, initialIndex, onClose, activeCategory }: GalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [images.length, onClose])

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight
    })
  }

  // Get unique categories from images
  const categories = Array.from(new Set(images.map(img => img.category || 'other')))
  const getCategoryCount = (category: string) => images.filter(img => (img.category || 'other') === category).length

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Header with close button */}
      <div className="absolute top-4 right-4 z-20">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Category tabs at the top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                (activeCategory === category || (activeCategory === 'all' && category === 'other'))
                  ? 'bg-green-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/20'
              }`}
              onClick={() => {
                // This would need to be handled by parent component
                // For now, just show the current category
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} ({getCategoryCount(category)})
            </button>
          ))}
        </div>
      </div>

      {/* Main gallery layout */}
      <div className="flex h-full items-center justify-center p-8 pt-20">
        {/* Left side image (previous) */}
        <div className="w-1/4 h-full flex items-center justify-center">
          {images.length > 1 && (
            <div className="relative w-full h-3/4 group">
              <Image
                src={images[(currentIndex - 1 + images.length) % images.length]?.image || "/placeholder.svg"}
                alt={`Previous image`}
                fill
                className="object-cover rounded-lg opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
                onClick={prevImage}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Center main image */}
        <div className="w-2/4 h-full flex items-center justify-center px-4">
          <div className="relative w-full h-full">
            <Image
              src={images[currentIndex]?.image || "/placeholder.svg"}
              alt={`Gallery image ${currentIndex + 1}`}
              fill
              className="object-contain rounded-lg"
              onLoad={handleImageLoad}
              priority
            />
            {/* Image counter and category badge */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
              <div className="text-sm font-medium text-gray-900">
                {images[currentIndex]?.category ? 
                  `${images[currentIndex].category.charAt(0).toUpperCase() + images[currentIndex].category.slice(1).replace('_', ' ')} - ${currentIndex + 1}` :
                  `${currentIndex + 1} / ${images.length}`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right side image (next) */}
        <div className="w-1/4 h-full flex items-center justify-center">
          {images.length > 1 && (
            <div className="relative w-full h-3/4 group">
              <Image
                src={images[(currentIndex + 1) % images.length]?.image || "/placeholder.svg"}
                alt={`Next image`}
                fill
                className="object-cover rounded-lg opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
                onClick={nextImage}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom thumbnail strip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                index === currentIndex ? 'ring-2 ring-green-500' : 'opacity-60 hover:opacity-80'
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <Image
                src={image.image}
                alt={`Thumbnail ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

