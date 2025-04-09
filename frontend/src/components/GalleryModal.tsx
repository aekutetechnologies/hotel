"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ImageWithId {
  id: number;
  image: string;
}

interface GalleryModalProps {
  images: ImageWithId[]
  initialIndex: number
  onClose: () => void
}

export function GalleryModal({ images, initialIndex, onClose }: GalleryModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white z-10" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
        
        <div className="relative w-full h-full flex items-center justify-center">
          <div 
            className="relative"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: imageSize.width > 0 ? 'auto' : '100%',
              height: imageSize.height > 0 ? 'auto' : '100%'
            }}
          >
            <Image
              src={images[currentIndex]?.image || "/placeholder.svg"}
              alt={`Gallery image ${currentIndex + 1}`}
              width={imageSize.width}
              height={imageSize.height}
              className="max-w-full max-h-[90vh] object-contain"
              onLoad={handleImageLoad}
              priority
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
          onClick={prevImage}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
          onClick={nextImage}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  )
}

