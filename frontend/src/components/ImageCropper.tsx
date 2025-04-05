'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from "@/components/ui/button"

interface ImageCropperProps {
  image: string
  aspectRatio: number
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
}

export function ImageCropper({ image, aspectRatio, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropCompleteHandler = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const showCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) {
      console.error('No cropped area available')
      return
    }
    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels, aspectRatio)
      if (croppedImageBlob) {
        onCropComplete(croppedImageBlob)
      } else {
        console.error('Cropped image blob is null')
      }
    } catch (error: any) {
      console.error('Error during image cropping:', error)
    }
  }, [croppedAreaPixels, image, onCropComplete, aspectRatio])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-96 h-96">
        <div className="relative w-full h-80">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
          />
        </div>
        <div className="mt-4 flex justify-between">
          <Button onClick={onCancel} variant="neutral">Cancel</Button>
          <Button onClick={showCroppedImage}>Crop</Button>
        </div>
      </div>
    </div>
  )
}

async function getCroppedImg(imageSrc: string, pixelCrop: any, aspectRatio: number): Promise<Blob | null> {
  if (!pixelCrop) {
    console.error('No pixel crop data provided')
    return null
  }

  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    console.error('Could not get canvas context')
    return null
  }

  // Set canvas size to match the aspect ratio
  const maxSize = Math.max(pixelCrop.width, pixelCrop.height)
  canvas.width = maxSize
  canvas.height = maxSize / aspectRatio

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  )

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
      if (!blob) {
          console.error('Canvas toBlob failed')
          resolve(null)
        } else {
          resolve(blob)
        }
      },
      'image/webp',
      0.9
    )
  })
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })
}
