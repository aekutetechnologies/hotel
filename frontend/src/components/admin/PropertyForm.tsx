'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Plus, Trash, Star } from 'lucide-react'
import { Property, Hotel, Hostel, HotelRoom, HostelRoom, FoodMenu } from '@/types/property'
import { ImageCropper } from '@/components/ImageCropper'
import { fetchAmenities } from '@/lib/api/fetchAmenities'
import { fetchHotelPolicies } from '@/lib/api/fetchHotelPolicies'
import { fetchDocumentation } from '@/lib/api/fetchDocumentation'
import { createProperty } from '@/lib/api/createProperty'
import { editProperty } from '@/lib/api/editProperty'
import { MapPicker } from '@/components/MapPicker'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'react-toastify'
import { uploadImage } from '@/lib/api/uploadImage'
import { Spinner } from '@/components/ui/spinner'
import { Image } from 'lucide-react'

interface PropertyFormProps {
  initialData?: Property
  isEditing?: boolean
}

// Define Room type
interface Room {
  id: string
  name: string
  price: string
  discount?: string
  size?: string
  maxoccupancy?: number
  amenities: string[]
  isActive?: boolean
}

interface Amenity {
  id: string
  name: string
}

interface Policy {
  id: string
  name: string
}

interface Documentation {
  id: string
  name: string
}

export function PropertyForm({ initialData, isEditing = false }: PropertyFormProps) {

  console.log(initialData)
  const router = useRouter()
  const [propertyType, setPropertyType] = useState<'hotel' | 'hostel'>(
    initialData?.property_type || 'hotel'
  )
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [images, setImages] = useState<{ id: string; image_url: string }[]>(initialData?.images?.map(image => ({ id: image.id, image_url: image.image_url })) || [])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState({
    address: initialData?.location || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || ''
  })
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [rules, setRules] = useState<Policy[]>([])
  const [documentation, setDocumentation] = useState<Documentation[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(initialData?.amenities.map(Number) || [])
  const [selectedPolicies, setSelectedPolicies] = useState<number[]>(initialData?.rules || [])
  const [selectedDocumentation, setSelectedDocumentation] = useState<number[]>(initialData?.documentation || [])
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [rooms, setRooms] = useState<Room[]>(initialData?.rooms || [])
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [uploadingImages, setUploadingImages] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const amenitiesResponse = await fetchAmenities()
        setAmenities(amenitiesResponse)

        const policiesResponse = await fetchHotelPolicies()
        setRules(policiesResponse)

        const documentationResponse = await fetchDocumentation()
        setDocumentation(documentationResponse)
      } catch (error) {
        console.error("Failed to load data:", error)
        setAmenities([])
        setRules([])
        setDocumentation([])
      }
    }

    loadData()
  }, [])

  const handleCropComplete = useCallback(async (croppedImageBlob: Blob) => {
    setUploadingImages(true) // Start image upload loading
    try {
      if (!croppedImageBlob) {
        toast.error("No cropped image data to upload.")
        return
      }

      const imageFile = new File([croppedImageBlob], "cropped_image.webp", { type: "image/webp" })
      const uploadResult = await uploadImage(imageFile)
      if (uploadResult && uploadResult.id) {
        setImages((prevImages) => [
          ...prevImages,
          { id: String(uploadResult.id), image_url: uploadResult.image_url }
        ]) // Store image ID and URL
        toast.success("Image uploaded successfully!")
      } else {
        toast.error("Image upload failed, but no ID was returned.")
      }
    } catch (error: any) {
      console.error("Image upload error:", error)
      toast.error(`Image upload failed: ${error.message || 'Unknown error'}`)
    } finally {
      setUploadingImages(false) // End image upload loading
      setCropImage(null) // Clear cropImage state
    }
  }, [setImages, setCropImage, uploadImage])

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cropImage) return

    const propertyData = {
      id: isEditing ? initialData?.id : undefined,
      name,
      property_type: propertyType,
      location: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      images: images.map(img => Number(img.id)), // Send only image IDs
      amenities: selectedAmenities,
      rules: selectedPolicies,
      documentation: selectedDocumentation,
      rooms,
      description,
    }

    try {
      if (isEditing) {
        await editProperty(initialData?.id, propertyData)
        toast.success('Property updated successfully')
      } else {
        await createProperty(propertyData)
        toast.success('Property created successfully')
      }
      router.push('/admin/dashboard')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save property')
    }
  }

  const handleMapOpen = () => setIsMapOpen(true)
  const handleMapClose = () => setIsMapOpen(false)

  const handleMapConfirm = () => {
    if (selectedLocation) {
      setLocation(prev => ({
        ...prev,
        latitude: selectedLocation.lat.toString(),
        longitude: selectedLocation.lng.toString()
      }))
    }
    handleMapClose()
  }

  const addRoom = () => {
    setRooms(prevRooms => [
      ...prevRooms,
      {
        id: Date.now().toString(),
        name: '',
        price: '',
        discount: '',
        size: '',
        max_occupancy: 0,
        amenities: [],
      }
    ])
  }

  const updateRoom = (index: number, updatedRoom: Partial<Room>) => {
    setRooms(prevRooms => prevRooms.map((room, i) => i === index ? { ...room, ...updatedRoom } : room))
  }

  const removeRoom = (index: number) => {
    setRooms(prevRooms => prevRooms.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Property Type Selection */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Property Type</h3>
          <Select
            value={propertyType}
            onValueChange={(value: 'hotel' | 'hostel') => setPropertyType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="hostel">Hostel</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter property name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={location.address}
                onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                value={location.latitude}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                value={location.longitude}
                readOnly
              />
            </div>
          </div>
          <div className="mt-4">
            <Button type="button" onClick={handleMapOpen} variant="outline">Set Location on Map</Button>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Description</h3>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter property description"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Map Popup */}
      {isMapOpen && (
        <Modal onClose={handleMapClose}>
          <div className="h-80 w-full mb-4">
            <MapPicker
              onLocationChange={(lat, lng) => setSelectedLocation({
                lat: parseFloat(lat.toFixed(6)),
                lng: parseFloat(lng.toFixed(6))
              })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={handleMapConfirm} variant="default">OK</Button>
            <Button onClick={handleMapClose} variant="outline">Close</Button>
          </div>
        </Modal>
      )}

      {/* Images */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Property Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-[4/3]">
                <img
                  src={image.image_url}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => console.error("Image load error:", e)}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <Button type="button" onClick={triggerFileInput} disabled={uploadingImages}>
                Add Image
              </Button>
              {uploadingImages && <Spinner />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity.id}`}
                  checked={selectedAmenities.includes(Number(amenity.id))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedAmenities(prev => [...prev, Number(amenity.id)])
                    } else {
                      setSelectedAmenities(prev => prev.filter(a => a !== Number(amenity.id)))
                    }
                  }}
                />
                <Label htmlFor={`amenity-${amenity.id}`}>{amenity.name}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hotel Policies */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Hotel Policies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`rule-${rule.id}`}
                  checked={selectedPolicies.includes(Number(rule.id))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPolicies(prev => [...prev, Number(rule.id)])
                    } else {
                      setSelectedPolicies(prev => prev.filter(p => p !== Number(rule.id)))
                    }
                  }}
                />
                <Label htmlFor={`rule-${rule.id}`}>{rule.name}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Documentation</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {documentation.map((doc) => (
              <div key={doc.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`doc-${doc.id}`}
                  checked={selectedDocumentation.includes(Number(doc.id))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedDocumentation(prev => [...prev, Number(doc.id)])
                    } else {
                      setSelectedDocumentation(prev => prev.filter(d => d !== Number(doc.id)))
                    }
                  }}
                />
                <Label htmlFor={`doc-${doc.id}`}>{doc.name}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rooms Section */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Rooms</h3>
          {rooms.map((room, index) => (
            <div key={room.id} className="mb-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`room-name-${index}`}>Room Name</Label>
                  <Input
                    id={`room-name-${index}`}
                    value={room.name}
                    onChange={(e) => updateRoom(index, { name: e.target.value })}
                    placeholder="Enter room name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`room-price-${index}`}>Price</Label>
                  <Input
                    id={`room-price-${index}`}
                    type="number"
                    value={room.price}
                    onChange={(e) => updateRoom(index, { price: e.target.value })}
                    placeholder="Enter price"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`room-discount-${index}`}>Discount</Label>
                  <Input
                    id={`room-discount-${index}`}
                    type="number"
                    value={room.discount || ''}
                    onChange={(e) => updateRoom(index, { discount: e.target.value })}
                    placeholder="Enter discount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`room-size-${index}`}>Size</Label>
                  <Input
                    id={`room-size-${index}`}
                    value={room.size || ''}
                    onChange={(e) => updateRoom(index, { size: e.target.value })}
                    placeholder="Enter size"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`room-maxoccupancy-${index}`}>Max Occupancy</Label>
                  <Input
                    id={`room-maxoccupancy-${index}`}
                    type="number"
                    value={room.maxoccupancy || ''}
                    onChange={(e) => updateRoom(index, { maxoccupancy: parseInt(e.target.value) })}
                    placeholder="Enter max occupancy"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`room-${index}-amenity-${amenity.id}`}
                          checked={room.amenities.includes(amenity.id)}
                          onCheckedChange={(checked) => {
                            const updatedAmenities = checked
                              ? [...room.amenities, amenity.id]
                              : room.amenities.filter(a => a !== amenity.id)
                            updateRoom(index, { amenities: updatedAmenities })
                          }}
                        />
                        <Label htmlFor={`room-${index}-amenity-${amenity.id}`}>{amenity.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button type="button" variant="destructive" onClick={() => removeRoom(index)}>Remove Room</Button>
              </div>
            </div>
          ))}
          <Button type="button" onClick={addRoom} variant="default">Add Room</Button>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#B11E43] hover:bg-[#8f1836]"
          disabled={loading}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
        </Button>
      </div>

      {cropImage && (
        <ImageCropper
          image={cropImage}
          fileName="property-image.webp"
          aspectRatio={4/3}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImage(null)}
        />
      )}
    </form>
  )
}
