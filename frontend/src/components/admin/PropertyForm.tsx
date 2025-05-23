'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
import { Upload, X, Plus, Trash, Star, MapPin } from 'lucide-react'
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
import { uploadRoomImage } from '@/lib/api/uploadRoomImage'
import { fetchLocation } from '@/lib/api/fetchLocation'
import { fetchState } from '@/lib/api/fetchState'

interface PropertyFormProps {
  initialData?: Property
  isEditing?: boolean
}

// Define Room type
interface Room {
  id: string | number;
  name: string;
  daily_rate: string;
  hourly_rate: string;
  monthly_rate: string;
  discount: string;
  bed_type: string | null;
  private_bathroom: boolean;
  smoking: boolean;
  security_deposit: boolean;
  size: string;
  maxoccupancy: number;
  number_of_rooms: number;
  amenities: number[] | Amenity[];
  roomImages: { id: string | number; image_url: string }[];
}

interface Amenity {
  id: string | number;
  name: string;
}

interface Policy {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

interface Documentation {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

interface City {
  id: string;
  name: string;
}
interface State {
  id: string;
  name: string;
}

// Interface for API submission that allows for arrays of IDs
interface PropertyApiData {
  name: string;
  property_type: 'hotel' | 'hostel';
  location: string;
  latitude: string;
  longitude: string;
  images: number[];
  amenities: number[];
  rules: number[];
  documentation: number[];
  rooms: {
    id: string | number;
    name: string;
    daily_rate: string;
    hourly_rate: string;
    monthly_rate: string;
    discount: string;
    bed_type: string | null;
    private_bathroom: boolean;
    smoking: boolean;
    security_deposit: boolean;
    size: string;
    maxoccupancy: number;
    number_of_rooms: number;
    amenities: number[];
    images: number[];
  }[];
  description: string;
  city: string;
  state: string;
  country: string;
  area: string;
}

const BED_TYPE_CHOICES = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'queen', label: 'Queen' },
  { value: 'king', label: 'King' },
  { value: 'twin', label: 'Twin' },
  { value: 'double_twin', label: 'Double Twin' },
  { value: 'bunk', label: 'Bunk' },
  { value: 'sofa', label: 'Sofa' },
  { value: 'sofa_bed', label: 'Sofa Bed' },
];

const COUNTRY_CHOICES = [
  { value: 'india', label: 'India' },
];


export function PropertyForm({ initialData, isEditing = false }: PropertyFormProps) {

  // Normalize image URLs to handle different API response formats
  const normalizeImageUrl = (image: any) => {
    if (!image) return '';
    return image.image_url || image.image || '';
  };

  console.log("PropertyForm initialData:", initialData)
  const router = useRouter()
  
  // Get property_type, ensure it's either 'hotel' or 'hostel'
  const propertyTypeValue = initialData?.property_type === 'hostel' ? 'hostel' : 'hotel'
  const [propertyType, setPropertyType] = useState<'hotel' | 'hostel'>(propertyTypeValue)
  
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  // @ts-ignore - Suppressing type errors for images
  const [images, setImages] = useState<{ id: string; image_url: string }[]>(
    initialData?.images?.map((image: any) => ({
      id: String(image.id || ''), 
      image_url: normalizeImageUrl(image)
    })) || []
  )
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState({
    address: initialData?.location || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || ''
  })
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [rules, setRules] = useState<Policy[]>([])
  const [documentation, setDocumentation] = useState<Documentation[]>([])
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [rooms, setRooms] = useState<Room[]>(() => {
    if (!initialData?.rooms) return [];
    
    return initialData.rooms.map((room: any) => {
      // Process room amenities - ensure they're converted to numeric IDs
      const processedAmenities = (room.amenities || []).map((amenity: any) => {
        if (typeof amenity === 'number') return amenity;
        if (typeof amenity === 'object' && amenity.id) return Number(amenity.id);
        return 0; // fallback value
      }).filter((id: number) => id > 0); // remove invalid values
      
      return {
        ...room,
        id: String(room.id || ''),
        amenities: processedAmenities,
        roomImages: (room.images || room.roomImages || []).map((img: any) => ({ 
          id: String(img.id || ''), 
          image_url: normalizeImageUrl(img)
        })) || []
      };
    });
  });
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [uploadingImages, setUploadingImages] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [roomCropImage, setRoomCropImage] = useState<string | null>(null);
  const [roomUploadingImages, setRoomUploadingImages] = useState<boolean>(false);
  const [selectedRoomIndexForImage, setSelectedRoomIndexForImage] = useState<number | null>(null);
  const roomFileInputRef = useRef<HTMLInputElement>(null);

  // @ts-ignore - Suppressing type errors for city
  const [city, setCity] = useState<string>(
    initialData?._cityString || 
    (typeof initialData?.city === 'object' ? initialData?.city?.name || '' : initialData?.city || '')
  )
  const [citySuggestions, setCitySuggestions] = useState<any[]>([])
  // @ts-ignore - Suppressing type errors for state
  const [state, setState] = useState<string>(
    initialData?._stateString || 
    (typeof initialData?.state === 'object' ? initialData?.state?.name || '' : initialData?.state || '')
  )
  const [country] = useState<string>('india') // Fixed to India
  const [area, setArea] = useState<string>(initialData?.area || '')
  const [stateOptions, setStateOptions] = useState<State[]>([])
  
  // Load IDs from the new format
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
    initialData?._amenityIds || 
    initialData?.amenities?.map((amenity: any) => 
      typeof amenity === 'object' ? Number(amenity.id) : Number(amenity)
    ) || []
  )
  const [selectedPolicies, setSelectedPolicies] = useState<number[]>(
    initialData?._ruleIds || 
    initialData?.rules?.map((rule: any) => 
      typeof rule === 'object' ? Number(rule.id) : Number(rule)
    ) || []
  )
  const [selectedDocumentation, setSelectedDocumentation] = useState<number[]>(
    initialData?._documentationIds || 
    initialData?.documentation?.map((doc: any) => 
      typeof doc === 'object' ? Number(doc.id) : Number(doc)
    ) || []
  )

  useEffect(() => {
    // Additional logging to help debug image issues
    if (initialData?.images?.length) {
      console.log("Property images from API:", initialData.images);
      console.log("Mapped image URLs:", images);
    }

    if (initialData?.rooms?.length) {
      console.log("Room data from API:", initialData.rooms.map(room => ({
        id: room.id,
        name: room.name,
        images: room.images
      })));
    }
  
    async function loadData() {
      try {
        const amenitiesResponse = await fetchAmenities()
        setAmenities(amenitiesResponse)

        const policiesResponse = await fetchHotelPolicies()
        setRules(policiesResponse)

        const documentationResponse = await fetchDocumentation()
        setDocumentation(documentationResponse)

        try {
          console.log("Attempting to fetch states...")
          const statesResponse = await fetchState()
          
          if (Array.isArray(statesResponse) && statesResponse.length === 0) {
            console.warn("Received empty states list from API")
            toast.warning("Could not load states data. Some form features may be limited.")
          } else {
            console.log(`Successfully loaded ${statesResponse.length} states`)
            setStateOptions(statesResponse);
          }
        } catch (stateError) {
          console.error("Failed to load states:", stateError)
          toast.error("Failed to load location data. Please try again later.")
          setStateOptions([])
        }

      } catch (error) {
        console.error("Failed to load form data:", error)
        toast.error("Failed to load form data. Please try again later.")
        setAmenities([])
        setRules([])
        setDocumentation([])
        setStateOptions([])
      }
    }

    loadData()
  }, [initialData, images])

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

  const handleRoomCropComplete = useCallback(async (croppedImageBlob: Blob) => {
    setRoomUploadingImages(true);
    try {
      if (!croppedImageBlob) {
        toast.error("No cropped image data to upload.");
        return;
      }

      const imageFile = new File([croppedImageBlob], "room_cropped_image.webp", { type: "image/webp" });
      const uploadResult = await uploadRoomImage(imageFile);
      if (uploadResult && uploadResult.id && selectedRoomIndexForImage !== null) {
        setRooms(prevRooms => {
          const updatedRooms = [...prevRooms];
          updatedRooms[selectedRoomIndexForImage].roomImages = [
            ...(updatedRooms[selectedRoomIndexForImage].roomImages || []),
            { id: String(uploadResult.id), image_url: uploadResult.image_url }
          ];
          return updatedRooms;
        });
        toast.success("Room image uploaded successfully!");
      } else {
        toast.error("Room image upload failed.");
      }
    } catch (error: any) {
      console.error("Room image upload error:", error);
      toast.error(`Room image upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setRoomUploadingImages(false);
      setRoomCropImage(null);
      setSelectedRoomIndexForImage(null);
    }
  }, [setRooms, setRoomCropImage, uploadImage, selectedRoomIndexForImage]);


  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeRoomImage = (roomIndex: number, imageIndex: number) => {
    setRooms(prevRooms => {
      const updatedRooms = [...prevRooms];
      updatedRooms[roomIndex].roomImages = updatedRooms[roomIndex].roomImages.filter((_, i) => i !== imageIndex);
      return updatedRooms;
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cropImage) return
    if (roomCropImage) return

    const preparedRooms = rooms.map(room => {
      // Ensure amenities are always numbers
      const processedAmenities = (room.amenities || []).map((amenity: any) => {
        if (typeof amenity === 'number') return amenity;
        if (typeof amenity === 'object' && amenity.id) return Number(amenity.id);
        return 0;
      }).filter((id: number) => id > 0);
      
      return {
        ...room,
        amenities: processedAmenities,
        images: room.roomImages.map(img => Number(img.id)), // Convert to image IDs
      };
    });
  
    const propertyData: PropertyApiData = {
      name,
      property_type: propertyType,
      location: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      images: images.map(img => Number(img.id)), // Send only image IDs
      amenities: selectedAmenities,
      rules: selectedPolicies,
      documentation: selectedDocumentation,
      rooms: preparedRooms,
      description,
      city,
      state,
      country,
      area,
    };

    try {
      if (isEditing && initialData?.id) {
        // Cast propertyData to any to bypass type checking for API call
        await editProperty(initialData.id.toString(), propertyData as any)
        toast.success('Property updated successfully')
      } else {
        // Cast propertyData to any to bypass type checking for API call
        await createProperty(propertyData as any)
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
        daily_rate: '',
        hourly_rate: '',
        monthly_rate: '',
        discount: '',
        size: '',
        maxoccupancy: 0,
        amenities: [],
        bed_type: null,
        private_bathroom: false,
        smoking: false,
        security_deposit: false,
        number_of_rooms: 0,
        roomImages: [],
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

  const triggerRoomFileInput = (index: number) => {
    setSelectedRoomIndexForImage(index);
    roomFileInputRef.current?.click();
  };

  const handleRoomFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedRoomIndexForImage !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoomCropImage(reader.result as string);
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
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                value={location.address}
                onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address"
                required
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="city">City</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  id="city"
                  value={city}
                  onChange={async (e) => {
                    setCity(e.target.value)
                    if (e.target.value.length > 2) {
                      try {
                        console.log(`Searching for location: "${e.target.value}"`)
                        const suggestions = await fetchLocation(e.target.value)
                        
                        if (Array.isArray(suggestions) && suggestions.length === 0) {
                          console.log("No location suggestions found")
                        } else {
                          console.log(`Found ${suggestions.length} location suggestions`)
                          setCitySuggestions(suggestions)
                        }
                      } catch (error) {
                        console.error("Error fetching location suggestions:", error)
                        setCitySuggestions([])
                        toast.error("Could not fetch location suggestions. You can still enter the city manually.")
                      }
                    } else {
                      setCitySuggestions([])
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setCitySuggestions([]), 200)
                  }}
                  placeholder="Enter city"
                  className="pl-10"
                />
              </div>
              {citySuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-sm max-h-48 overflow-y-auto">
                  {citySuggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => setCity(suggestion.name)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      {suggestion.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={state}
                onValueChange={(value) => setState(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((stateOption) => (
                    <SelectItem key={stateOption.id} value={stateOption.name}>
                      {stateOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={country}
                onValueChange={() => {}}
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CHOICES.map((countryOption) => (
                    <SelectItem key={countryOption.value} value={countryOption.value}>
                      {countryOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Location Name</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Enter Location Name"
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
            {location.address ? (
              <div className="relative h-[200px] w-full rounded-lg overflow-hidden">
                <img src={location.address} alt="Map" className="w-full h-full object-cover" loading="lazy"/>
                <Button 
                  onClick={handleMapOpen} 
                  variant="neutral" 
                  className="absolute bottom-2 right-2"
                >
                  Edit Location
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleMapOpen} 
                variant="neutral" 
                className="w-full py-8"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Select Location on Map
              </Button>
            )}
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
            <Button onClick={handleMapClose} variant="neutral">Close</Button>
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
                  onError={(e) => {
                    console.error("Image load error for URL:", image.image_url);
                    (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                  }}
                  loading="lazy"
                />
                <Button
                  type="button"
                  variant="neutral"
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
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => triggerFileInput()}
                disabled={uploadingImages}
              >
                {uploadingImages ? <Spinner className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload Image
              </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor={`room-hourly-rate-${index}`}>Hourly Rate</Label>
                  <Input
                    id={`room-hourly-rate-${index}`}
                    type="number"
                    step="0.01"
                    value={room.hourly_rate || ''}
                    onChange={(e) => updateRoom(index, { hourly_rate: e.target.value })}
                    placeholder="Enter hourly rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`room-daily-rate-${index}`}>Daily Rate</Label>
                  <Input
                    id={`room-daily-rate-${index}`}
                    type="number"
                    step="0.01"
                    value={room.daily_rate || ''}
                    onChange={(e) => updateRoom(index, { daily_rate: e.target.value })}
                    placeholder="Enter daily rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`room-monthly-rate-${index}`}>Monthly Rate</Label>
                  <Input
                    id={`room-monthly-rate-${index}`}
                    type="number"
                    step="0.01"
                    value={room.monthly_rate || ''}
                    onChange={(e) => updateRoom(index, { monthly_rate: e.target.value })}
                    placeholder="Enter monthly rate"
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
                  <Label htmlFor={`room-numberofrooms-${index}`}>Number of Rooms</Label>
                  <Input
                    id={`room-numberofrooms-${index}`}
                    type="number"
                    value={room.number_of_rooms || ''}
                    onChange={(e) => updateRoom(index, { number_of_rooms: parseInt(e.target.value) })}
                    placeholder="Enter number of rooms"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`room-bedtype-${index}`}>Bed Type</Label>
                  <Select
                    value={room.bed_type || undefined}
                    onValueChange={(value) => updateRoom(index, { bed_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BED_TYPE_CHOICES.map((bedType) => (
                        <SelectItem key={bedType.value} value={bedType.value}>
                          {bedType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`room-privatebathroom-${index}`}>Private Bathroom</Label>
                  <Checkbox
                    id={`room-privatebathroom-${index}`}
                    checked={room.private_bathroom || false}
                    onCheckedChange={(checked) => updateRoom(index, { private_bathroom: !!checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`room-smoking-${index}`}>Smoking Allowed</Label>
                  <Checkbox
                    id={`room-smoking-${index}`}
                    checked={room.smoking || false}
                    onCheckedChange={(checked) => updateRoom(index, { smoking: !!checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`room-securitydeposit-${index}`}>Security Deposit</Label>
                  <Checkbox
                    id={`room-securitydeposit-${index}`}
                    checked={room.security_deposit || false}
                    onCheckedChange={(checked) => updateRoom(index, { security_deposit: !!checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`room-${index}-amenity-${amenity.id}`}
                          checked={(room.amenities as any).includes(Number(amenity.id))}
                          onCheckedChange={(checked) => {
                            const amenityId = Number(amenity.id);
                            const updatedAmenities = !!checked
                              ? [...(room.amenities as any), amenityId]
                              : (room.amenities as any[]).filter(a => a !== amenityId);
                            updateRoom(index, { amenities: updatedAmenities });
                          }}
                        />
                        <Label htmlFor={`room-${index}-amenity-${amenity.id}`}>{amenity.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </form>
  )
}