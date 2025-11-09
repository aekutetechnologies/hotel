'use client'

import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react'
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
import { fetchAmenities, createAmenity, updateAmenity, deleteAmenity } from '@/lib/api/fetchAmenities'
import { fetchHotelPolicies, createHotelPolicy, updateHotelPolicy, deleteHotelPolicy } from '@/lib/api/fetchHotelPolicies'
import { fetchDocumentation, createDocumentation, updateDocumentation, deleteDocumentation } from '@/lib/api/fetchDocumentation'
import { createProperty } from '@/lib/api/createProperty'
// Import MapPicker dynamically to prevent SSR issues
import dynamic from 'next/dynamic'
import { toast } from 'react-toastify'
import { uploadImage } from '@/lib/api/uploadImage'
import { Spinner } from '@/components/ui/spinner'
import { uploadRoomImage } from '@/lib/api/uploadRoomImage'
import { fetchLocation } from '@/lib/api/fetchLocation'
import { fetchState } from '@/lib/api/fetchState'
import { fetchImageCategories, createImageCategory, updateImageCategory, deleteImageCategory } from '@/lib/api/imageCategories'
import { updatePropertyImage } from '@/lib/api/propertyImages'
import { ManageConfigModal } from '@/components/admin/ManageConfigModal'
import { ImageCategory } from '@/types/property'
import imageCompression from 'browser-image-compression'

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const UNCATEGORIZED_IMAGE_CATEGORY = 'uncategorized'

// Dynamically import the FormMapPicker with no SSR to prevent leaflet errors
const FormMapPicker = dynamic(() => import('@/components/FormMapPicker').then(mod => mod.FormMapPicker), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

// Define Room type
interface Room {
  id: string | number;
  name: string;
  daily_rate: string;
  hourly_rate: string;
  monthly_rate: string;
  yearly_rate: string;
  discount: string;
  bed_type: string | null;
  private_bathroom: boolean;
  smoking: boolean;
  security_deposit: boolean;
  size: string;
  maxoccupancy: number;
  number_of_rooms: number;
  amenities: number[];
  roomImages: { id: string | number; image_url: string }[];
  gender_type?: 'unisex' | 'male' | 'female' | null;
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

interface NearbyPlaceFormEntry {
  id: string;
  name: string;
  category: string;
  distance: string;
}

const createNearbyPlaceEntry = (): NearbyPlaceFormEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  category: '',
  distance: '',
})

interface City {
  id: string;
  name: string;
}
interface State {
  id: string;
  name: string;
}

// Interface for API submission
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
  nearby_places?: {
    id?: string | number;
    name: string;
    category: string;
    distance: string;
    sort_order?: number;
  }[];
  rooms: {
    id: string | number;
    name: string;
    daily_rate: string;
    hourly_rate: string;
    monthly_rate: string;
    yearly_rate: string;
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
  gender_type?: string;
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

const GENDER_TYPE_CHOICES = [
  { value: 'unisex', label: 'Unisex' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const COUNTRY_CHOICES = [
  { value: 'india', label: 'India' },
];

// Separate component for map to avoid rendering issues
function PropertyMapSection({ 
  location, 
  setLocation 
}: { 
  location: { address: string; latitude: string; longitude: string }; 
  setLocation: React.Dispatch<React.SetStateAction<{ address: string; latitude: string; longitude: string }>>;
}) {
  // Use a stable ID to avoid re-initialization issues
  const mapId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`).current;
  
  // Use callback to prevent unnecessary renders
  const handleLocationChange = useCallback((lat: number, lng: number) => {
    // Update the location state directly but memoize the callback
    setLocation(prev => {
      // Only update if values actually changed
      if (prev.latitude === lat.toFixed(6) && prev.longitude === lng.toFixed(6)) {
        return prev; // No change
      }
      
      // If there's a change, show the notification and return new state
      toast.success("Location coordinates updated from map");
      return {
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      };
    });
  }, [setLocation]);

  // Create a stable key that changes when coordinates are manually entered
  const mapKey = useMemo(() => {
    if (location.latitude && location.longitude) {
      return `map-${location.latitude}-${location.longitude}`;
    }
    return `map-${Math.random().toString(36).substr(2, 9)}`;
  }, [location.latitude, location.longitude]);
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-md font-medium">Location on Map</h4>
        {location.latitude && location.longitude && (
          <span className="text-sm text-green-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Coordinates set
          </span>
        )}
      </div>
      <div className="bg-gray-50 p-2 rounded-lg mb-2 text-sm text-gray-600">
        <p>Click anywhere on the map to set the property's coordinates. You can also zoom in for more precise location selection.</p>
      </div>
      <div className="h-[300px] w-full rounded-lg overflow-hidden border">
        <FormMapPicker
          key={mapKey} 
          onLocationChange={handleLocationChange}
          initialPosition={
            location.latitude && location.longitude
              ? [parseFloat(location.latitude), parseFloat(location.longitude)]
              : undefined
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Latitude:</span>
          <span className="text-sm text-gray-700">{location.latitude || 'Not set'}</span>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Longitude:</span>
          <span className="text-sm text-gray-700">{location.longitude || 'Not set'}</span>
        </div>
      </div>
    </div>
  );
}

// Add a Required Field component that includes a red star
function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      {children}
      <span className="text-red-500">*</span>
    </div>
  );
}

function RequiredHotelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      {children}
      <span className="text-blue-500">*</span>
    </div>
  );
}

function RequiredHostelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      {children}
      <span className="text-green-500">*</span>
    </div>
  );
}

export function AddPropertyForm() {
  const router = useRouter()
  
  // Initialize with default values for creating a new property
  const [propertyType, setPropertyType] = useState<'hotel' | 'hostel'>('hotel')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<{ id: string; image_url: string; categoryId: number | null }[]>([])
  const [imageCategories, setImageCategories] = useState<ImageCategory[]>([])
  const [selectedImageCategoryId, setSelectedImageCategoryId] = useState<string>(UNCATEGORIZED_IMAGE_CATEGORY)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState({
    address: '',
    latitude: '',
    longitude: ''
  })
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [rules, setRules] = useState<Policy[]>([])
  const [documentation, setDocumentation] = useState<Documentation[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [uploadingImages, setUploadingImages] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [roomCropImage, setRoomCropImage] = useState<string | null>(null);
  const [roomUploadingImages, setRoomUploadingImages] = useState<boolean>(false);
  const [selectedRoomIndexForImage, setSelectedRoomIndexForImage] = useState<number | null>(null);
  const roomFileInputRef = useRef<HTMLInputElement>(null);
  const [city, setCity] = useState<string>('Mumbai')
  const [citySuggestions, setCitySuggestions] = useState<any[]>([])
  const [state, setState] = useState<string>('Maharashtra')
  const [country] = useState<string>('india') // Fixed to India
  const [area, setArea] = useState<string>('')
  const [stateOptions, setStateOptions] = useState<State[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])
  const [selectedPolicies, setSelectedPolicies] = useState<number[]>([])
  const [selectedDocumentation, setSelectedDocumentation] = useState<number[]>([])
  const [genderType, setGenderType] = useState<string>('')
  const [manageAmenitiesOpen, setManageAmenitiesOpen] = useState(false)
  const [managePoliciesOpen, setManagePoliciesOpen] = useState(false)
  const [manageDocumentationOpen, setManageDocumentationOpen] = useState(false)
  const [manageImageCategoriesOpen, setManageImageCategoriesOpen] = useState(false)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlaceFormEntry[]>([])

  const addNearbyPlace = useCallback(() => {
    setNearbyPlaces((prev) => [...prev, createNearbyPlaceEntry()])
  }, [])

  const updateNearbyPlace = useCallback(
    (index: number, field: keyof Omit<NearbyPlaceFormEntry, 'id'>, value: string) => {
      setNearbyPlaces((prev) =>
        prev.map((place, i) => (i === index ? { ...place, [field]: value } : place))
      )
    },
    []
  )

  const removeNearbyPlace = useCallback((index: number) => {
    setNearbyPlaces((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const refreshAmenities = useCallback(async () => {
    const amenitiesResponse = await fetchAmenities()
    setAmenities(amenitiesResponse)
  }, [])

  const refreshPolicies = useCallback(async () => {
    const policiesResponse = await fetchHotelPolicies()
    setRules(policiesResponse)
  }, [])

  const refreshDocumentation = useCallback(async () => {
    const documentationResponse = await fetchDocumentation()
    setDocumentation(documentationResponse)
  }, [])

  const refreshImageCategories = useCallback(async (preferredCategoryId?: number | null) => {
    const categoriesResponse = await fetchImageCategories()
    setImageCategories(categoriesResponse)

    const preferredIdString = preferredCategoryId != null ? String(preferredCategoryId) : null
    if (preferredIdString && categoriesResponse.some(category => category.id === preferredCategoryId)) {
      setSelectedImageCategoryId(preferredIdString)
    } else if (
      selectedImageCategoryId !== UNCATEGORIZED_IMAGE_CATEGORY &&
      categoriesResponse.some(category => String(category.id) === selectedImageCategoryId)
    ) {
      // Keep existing selection
    } else if (categoriesResponse.length > 0) {
      setSelectedImageCategoryId(String(categoriesResponse[0].id))
    } else {
      setSelectedImageCategoryId(UNCATEGORIZED_IMAGE_CATEGORY)
    }
  }, [selectedImageCategoryId])

  useEffect(() => {
    async function loadData() {
      try {
        await refreshAmenities()
        await refreshPolicies()
        await refreshDocumentation()

        try {
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

        await refreshImageCategories()

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
  }, [refreshAmenities, refreshDocumentation, refreshImageCategories, refreshPolicies])

  // Debug hook to track changes to rooms state
  useEffect(() => {
    if (rooms.length > 0) {
      console.log('Rooms state updated:');
      rooms.forEach((room, index) => {
        console.log(`Room ${index} (${room.id}): ${room.name} - ${room.roomImages?.length || 0} images`);
      });
    }
  }, [rooms]);

  const handleCreateAmenity = async (name: string) => {
    await createAmenity(name)
    await refreshAmenities()
  }

  const handleUpdateAmenity = async (id: number, name: string) => {
    await updateAmenity(id, name)
    await refreshAmenities()
  }

  const handleDeleteAmenity = async (id: number) => {
    await deleteAmenity(id)
    setSelectedAmenities((prev) => prev.filter((amenityId) => amenityId !== id))
    await refreshAmenities()
  }

  const handleCreatePolicy = async (name: string) => {
    await createHotelPolicy(name)
    await refreshPolicies()
  }

  const handleUpdatePolicy = async (id: number, name: string) => {
    await updateHotelPolicy(id, name)
    await refreshPolicies()
  }

  const handleDeletePolicy = async (id: number) => {
    await deleteHotelPolicy(id)
    setSelectedPolicies((prev) => prev.filter((policyId) => policyId !== id))
    await refreshPolicies()
  }

  const handleCreateDocumentation = async (name: string) => {
    await createDocumentation(name)
    await refreshDocumentation()
  }

  const handleUpdateDocumentation = async (id: number, name: string) => {
    await updateDocumentation(id, name)
    await refreshDocumentation()
  }

  const handleDeleteDocumentation = async (id: number) => {
    await deleteDocumentation(id)
    setSelectedDocumentation((prev) => prev.filter((docId) => docId !== id))
    await refreshDocumentation()
  }

  const handleCreateImageCategory = async (name: string) => {
    const category = await createImageCategory(name)
    await refreshImageCategories(category.id)
  }

  const handleUpdateImageCategoryName = async (id: number, name: string) => {
    await updateImageCategory(id, name)
    await refreshImageCategories(id)
  }

  const handleDeleteImageCategory = async (id: number) => {
    await deleteImageCategory(id)
    setImages((prev) =>
      prev.map((image) =>
        image.categoryId === id ? { ...image, categoryId: null } : image
      )
    )
    if (selectedImageCategoryId === String(id)) {
      setSelectedImageCategoryId(UNCATEGORIZED_IMAGE_CATEGORY)
    }
    await refreshImageCategories()
  }

  const handleCropComplete = useCallback(async (croppedImageBlob: Blob) => {
    setUploadingImages(true)
    try {
      if (!croppedImageBlob) {
        toast.error("No cropped image data to upload.")
        return
      }

      const blobType = (croppedImageBlob.type || '').toLowerCase()
      const isPng = blobType === 'image/png'
      const targetType = isPng ? 'image/png' : 'image/jpeg'
      const targetExtension = isPng ? 'png' : 'jpg'

      const croppedFile = new File([croppedImageBlob], `property_image.${targetExtension}`, { type: targetType })

      const compressionOptions = {
        maxSizeMB: 1.5,
        useWebWorker: true,
        fileType: targetType,
        initialQuality: 0.8,
        maxIteration: 10
      }

      const compressedFile = await imageCompression(croppedFile, compressionOptions)
      const fileToUpload =
        compressedFile instanceof File
          ? compressedFile
          : new File([compressedFile], `property_image.${targetExtension}`, { type: targetType })

      if (fileToUpload.size > 1.5 * 1024 * 1024) {
        toast.warning("Compressed image exceeds 1.5 MB. Please crop a smaller area or choose a different image.")
        return
      }

      const categoryId =
        selectedImageCategoryId === UNCATEGORIZED_IMAGE_CATEGORY
          ? null
          : Number(selectedImageCategoryId)

      const uploadResult = await uploadImage(fileToUpload, categoryId)
      if (uploadResult && uploadResult.id) {
        const resolvedCategoryId =
          uploadResult.category_id ??
          uploadResult.category?.id ??
          categoryId
        setImages((prevImages) => [
          ...prevImages,
          {
            id: String(uploadResult.id),
            image_url: uploadResult.image_url,
            categoryId: resolvedCategoryId ?? null,
          }
        ])
        toast.success("Image uploaded successfully!")
      } else {
        toast.error("Image upload failed, but no ID was returned.")
      }
    } catch (error: any) {
      console.error("Image upload error:", error)
      toast.error(`Image upload failed: ${error.message || 'Unknown error'}`)
    } finally {
      setUploadingImages(false)
      setCropImage(null)
    }
  }, [setImages, setCropImage, selectedImageCategoryId])

  const handleRoomCropComplete = useCallback(async (croppedImageBlob: Blob) => {
    setRoomUploadingImages(true);
    try {
      if (!croppedImageBlob) {
        toast.error("No cropped image data to upload.");
        return;
      }

      if (selectedRoomIndexForImage === null) {
        toast.error("No room selected for image upload.");
        return;
      }

      const blobType = (croppedImageBlob.type || '').toLowerCase()
      const isPng = blobType === 'image/png'
      const targetType = isPng ? 'image/png' : 'image/jpeg'
      const targetExtension = isPng ? 'png' : 'jpg'

      const croppedFile = new File([croppedImageBlob], `room_image.${targetExtension}`, { type: targetType })

      const compressionOptions = {
        maxSizeMB: 1.5,
        useWebWorker: true,
        fileType: targetType,
        initialQuality: 0.8,
        maxIteration: 10
      }

      const compressedFile = await imageCompression(croppedFile, compressionOptions)
      const fileToUpload =
        compressedFile instanceof File
          ? compressedFile
          : new File([compressedFile], `room_image.${targetExtension}`, { type: targetType })

      if (fileToUpload.size > 1.5 * 1024 * 1024) {
        toast.warning("Compressed image exceeds 1.5 MB. Please crop a smaller area or choose a different image.")
        return
      }

      const uploadResult = await uploadRoomImage(fileToUpload);

      if (uploadResult && uploadResult.id) {
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
  }, [setRooms, setRoomCropImage, uploadRoomImage, selectedRoomIndexForImage]);


  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handlePropertyImageCategoryChange = async (index: number, newCategory: string) => {
    const image = images[index]
    if (!image) {
      return
    }

    const previousCategoryId = image.categoryId ?? null
    const newCategoryId =
      newCategory === UNCATEGORIZED_IMAGE_CATEGORY ? null : Number(newCategory)

    if (previousCategoryId === newCategoryId) {
      return
    }

    setImages(prev =>
      prev.map((img, i) =>
        i === index ? { ...img, categoryId: newCategoryId } : img
      )
    )

    try {
      await updatePropertyImage(Number(image.id), { category: newCategoryId })
      toast.success("Image category updated")
    } catch (error: any) {
      console.error("Failed to update image category:", error)
      toast.error(error?.message || "Failed to update image category")
      setImages(prev =>
        prev.map((img, i) =>
          i === index ? { ...img, categoryId: previousCategoryId } : img
        )
      )
    }
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

    if (cropImage) {
      toast.info('Please complete image cropping before submitting.');
      return;
    }
    
    if (roomCropImage) {
      toast.info('Please complete room image cropping before submitting.');
      return;
    }

    if (images.length === 0) {
      toast.warning('Please add at least one property image');
      return;
    }

    if (rooms.length === 0) {
      toast.warning('Please add at least one room');
      return;
    }

    if (!name || !location.address || !city || !state || !description) {
      toast.warning('Please fill all required fields');
      return;
    }

    const hasIncompleteNearbyPlaces = nearbyPlaces.some((place) => {
      const nameValue = place.name.trim()
      const categoryValue = place.category.trim()
      const distanceValue = place.distance.trim()
      const filledValues = [nameValue, categoryValue, distanceValue].filter(Boolean).length
      return filledValues > 0 && filledValues < 3
    })

    if (hasIncompleteNearbyPlaces) {
      toast.warning('Please complete all fields for each nearby place or remove incomplete entries.')
      return
    }

    const formattedNearbyPlaces = nearbyPlaces
      .map((place, index) => ({
        name: place.name.trim(),
        category: place.category.trim(),
        distance: place.distance.trim(),
        sort_order: index,
      }))
      .filter((place) => place.name && place.category && place.distance)

    setLoading(true);
    try {
      const preparedRooms = rooms.map(room => {
      return {
        ...room,
          amenities: room.amenities,
        images: room.roomImages.map(img => Number(img.id)), // Convert to image IDs
      };
    });
  
    const propertyData: PropertyApiData = {
      name,
      property_type: propertyType,
      location: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      images: images.map(img => Number(img.id)), // Send image IDs
      amenities: selectedAmenities,
      rules: selectedPolicies,
      documentation: selectedDocumentation,
      nearby_places: formattedNearbyPlaces,
      rooms: preparedRooms,
      description,
      city,
      state,
      country,
      area,
      ...(propertyType === 'hostel' && genderType && { gender_type: genderType }),
    };

      console.log('Creating new property:', name);
      await createProperty(propertyData as any);
      toast.success('Property created successfully');
      router.push('/admin/properties');
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error('Failed to create property. Please check if all required fields are filled.');
    } finally {
      setLoading(false);
    }
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
        yearly_rate: '',
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
        gender_type: null,
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
      const fileType = file.type.toLowerCase();
      if (!ACCEPTED_IMAGE_TYPES.includes(fileType)) {
        toast.error('Please select a JPEG or PNG image');
        if (event.target) event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const triggerRoomFileInput = (index: number) => {
    console.log(`triggerRoomFileInput called for room index: ${index}`);
    setSelectedRoomIndexForImage(index);
    console.log(`roomFileInputRef exists: ${!!roomFileInputRef.current}`);
    roomFileInputRef.current?.click();
  };

  const handleRoomFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`handleRoomFileChange called, files selected: ${event.target.files?.length}`);
    console.log(`selectedRoomIndexForImage: ${selectedRoomIndexForImage}`);
    
    // Check if a room was selected for the image
    if (selectedRoomIndexForImage === null) {
      console.error('No room selected for image upload');
      toast.error('Please select a room before uploading an image');
      // Reset the file input
      if (event.target) event.target.value = '';
      return;
    }
    
    const file = event.target.files?.[0];
    if (file) {
      console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
      
      // Validate file type
      const fileType = file.type.toLowerCase();
      if (!ACCEPTED_IMAGE_TYPES.includes(fileType)) {
        console.error('Invalid file type selected');
        toast.error('Please select a JPEG or PNG image');
        if (event.target) event.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('FileReader completed reading the file');
        setRoomCropImage(reader.result as string);
      };
      reader.onerror = () => {
        console.error('FileReader error');
        toast.error('Failed to read the selected image');
        if (event.target) event.target.value = '';
      };
      reader.readAsDataURL(file);
    } else {
      console.error('No file selected');
      toast.error('No file selected');
    }
    
    // Always reset the file input for future uploads
    if (event.target) event.target.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Note about required fields */}
      <div className="text-sm  text-gray-500 mb-4">
  <div className="flex items-center">
    <span className="text-blue-500 mr-1">*</span> Required Fields for Hotel
  </div>
  <div className="flex items-center">
    <span className="text-green-500 mr-1">*</span> Required Fields for Hostel
  </div>
  <div className="flex items-center">
    <span className="text-red-500 mr-1">*</span> Required fields
  </div>
</div>


      {/* Hidden file inputs for image uploads */}
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        aria-label="Upload property image"
      />
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={handleRoomFileChange}
        ref={roomFileInputRef}
        aria-label="Upload room image"
      />

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
              <RequiredLabel>
                <Label htmlFor="name">Property Name</Label>
              </RequiredLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter property name"
                required
              />
            </div>
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="address">Full Address</Label>
              </RequiredLabel>
              <Input
                id="address"
                value={location.address}
                onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address"
                required
              />
            </div>
            <div className="space-y-2 relative">
              <RequiredLabel>
                <Label htmlFor="city">City</Label>
              </RequiredLabel>
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
                  required
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
              <RequiredLabel>
                <Label htmlFor="state">State</Label>
              </RequiredLabel>
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
            {propertyType === 'hostel' && (
              <div className="space-y-2">
                <RequiredHostelLabel>
                  <Label htmlFor="genderType">Gender Type</Label>
                </RequiredHostelLabel>
                <Select
                  value={genderType}
                  onValueChange={(value) => setGenderType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_TYPE_CHOICES.map((genderTypeOption) => (
                      <SelectItem key={genderTypeOption.value} value={genderTypeOption.value}>
                        {genderTypeOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="latitude">Latitude : Upto 6 digit decimal</Label>
              </RequiredLabel>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={location.latitude}
                onChange={(e) => {
                  const value = e.target.value;
                  const lat = parseFloat(value);
                  
                  // Basic validation for latitude (-90 to 90)
                  if (value === '' || (!isNaN(lat) && lat >= -90 && lat <= 90)) {
                    setLocation(prev => ({ ...prev, latitude: value }));
                  }
                }}
                placeholder="Enter latitude (-90 to 90)"
              />
            </div>
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="longitude">Longitude : Upto 6 digit decimal</Label>
              </RequiredLabel>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={location.longitude}
                onChange={(e) => {
                  const value = e.target.value;
                  const lng = parseFloat(value);
                  
                  // Basic validation for longitude (-180 to 180)
                  if (value === '' || (!isNaN(lng) && lng >= -180 && lng <= 180)) {
                    setLocation(prev => ({ ...prev, longitude: value }));
                  }
                }}
                placeholder="Enter longitude (-180 to 180)"
              />
            </div>
          </div>
          
          {/* Map directly embedded in the form */}
          <PropertyMapSection location={location} setLocation={setLocation} />
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Description</h3>
          <RequiredLabel>
            <Label htmlFor="description">Property Description</Label>
          </RequiredLabel>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter property description"
            rows={4}
            required
          />
        </CardContent>
      </Card>

      {/* Nearby Places */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold">Nearby Places</h3>
              <p className="text-sm text-gray-500">
                Add nearby attractions, transit points, or landmarks with their approximate distance.
              </p>
            </div>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={addNearbyPlace}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Add Place
            </Button>
          </div>

          {nearbyPlaces.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-500 bg-gray-50">
              <p className="mb-2">No nearby places added yet.</p>
              <p className="text-sm">Use the &quot;Add Place&quot; button to include nearby points of interest.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nearbyPlaces.map((place, index) => (
                <div
                  key={place.id}
                  className="border border-dashed rounded-lg p-4 bg-gray-50 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-base text-gray-700">Place {index + 1}</h4>
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeNearbyPlace(index)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`nearby-place-name-${place.id}`}>Name</Label>
                      <Input
                        id={`nearby-place-name-${place.id}`}
                        value={place.name}
                        onChange={(e) => updateNearbyPlace(index, 'name', e.target.value)}
                        placeholder="Phoenix Market City Mall"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`nearby-place-category-${place.id}`}>Category</Label>
                      <Input
                        id={`nearby-place-category-${place.id}`}
                        value={place.category}
                        onChange={(e) => updateNearbyPlace(index, 'category', e.target.value)}
                        placeholder="Shopping"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`nearby-place-distance-${place.id}`}>Distance</Label>
                      <Input
                        id={`nearby-place-distance-${place.id}`}
                        value={place.distance}
                        onChange={(e) => updateNearbyPlace(index, 'distance', e.target.value)}
                        placeholder="1.5 km"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              <RequiredLabel>Property Images</RequiredLabel>
            </h3>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setManageImageCategoriesOpen(true)}
            >
              Manage Categories
            </Button>
          </div>
          <div className="mb-4">
            <Label htmlFor="image-category">Select Category for Next Image</Label>
            <Select
              value={selectedImageCategoryId}
              onValueChange={(value) => setSelectedImageCategoryId(value)}
              disabled={imageCategories.length === 0}
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value={UNCATEGORIZED_IMAGE_CATEGORY}>Uncategorized</SelectItem>
                {imageCategories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {imageCategories.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No categories available yet. Click &quot;Manage Categories&quot; to add one.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="space-y-2">
                <div className="relative aspect-[4/3]">
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
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {imageCategories.find(cat => cat.id === image.categoryId)?.name || 'Uncategorized'}
                  </div>
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
                <Select
                  value={image.categoryId != null ? String(image.categoryId) : UNCATEGORIZED_IMAGE_CATEGORY}
                  onValueChange={(value) => handlePropertyImageCategoryChange(index, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNCATEGORIZED_IMAGE_CATEGORY}>Uncategorized</SelectItem>
                    {imageCategories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <label className="border-2 border-dashed rounded-lg aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload Image</span>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Display loading state */}
          {uploadingImages && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#B11E43] mr-2"></div>
              <span>Uploading image...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Cropper */}
      {cropImage && (
        <ImageCropper
          image={cropImage}
          aspectRatio={4/3}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImage(null)}
        />
      )}

      {/* Room Cropper */}
      {roomCropImage && (
        <ImageCropper
          image={roomCropImage}
          aspectRatio={4/3}
          onCropComplete={handleRoomCropComplete}
          onCancel={() => setRoomCropImage(null)}
        />
      )}

      {/* Amenities */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Amenities</h3>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setManageAmenitiesOpen(true)}
            >
              Manage
            </Button>
          </div>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Hotel Policies</h3>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setManagePoliciesOpen(true)}
            >
              Manage
            </Button>
          </div>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Documentation</h3>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setManageDocumentationOpen(true)}
            >
              Manage
            </Button>
          </div>
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              <RequiredLabel>Rooms</RequiredLabel>
            </h3>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={addRoom}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Room
            </Button>
          </div>
          
          {rooms.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-gray-500 mb-4">No rooms added yet</p>
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={addRoom}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" /> Add Your First Room
              </Button>
            </div>
          ) : (
            rooms.map((room, index) => (
              <div key={room.id} className="mb-6 p-6 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-lg">{room.name || `Room ${index + 1}`}</h4>
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={() => removeRoom(index)}
                    className="text-red-500"
                  >
                    <Trash className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <RequiredLabel>
                      <Label htmlFor={`room-name-${index}`}>Room Name</Label>
                    </RequiredLabel>
                    <Input
                      id={`room-name-${index}`}
                      value={room.name}
                      onChange={(e) => updateRoom(index, { name: e.target.value })}
                      placeholder="Enter room name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                      <RequiredHotelLabel>
                        <Label htmlFor={`room-hourly-rate-${index}`}>Hourly Rate</Label>
                      </RequiredHotelLabel>
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
                      <RequiredHotelLabel>
                        <Label htmlFor={`room-daily-rate-${index}`}>Daily Rate</Label>
                      </RequiredHotelLabel>
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
                      <RequiredHostelLabel>
                        <Label htmlFor={`room-monthly-rate-${index}`}>Monthly Rate</Label>
                      </RequiredHostelLabel>
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
                      <RequiredHostelLabel>
                        <Label htmlFor={`room-yearly-rate-${index}`}>Yearly Rate</Label>
                      </RequiredHostelLabel>
                    <Input
                      id={`room-yearly-rate-${index}`}
                      type="number"
                      step="0.01"
                      value={room.yearly_rate || ''}
                      onChange={(e) => updateRoom(index, { yearly_rate: e.target.value })}
                      placeholder="Enter yearly rate"
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
                    <RequiredLabel>
                      <Label htmlFor={`room-maxoccupancy-${index}`}>Max Occupancy</Label>
                    </RequiredLabel>
                    <Input
                      id={`room-maxoccupancy-${index}`}
                      type="number"
                      value={room.maxoccupancy || ''}
                      onChange={(e) => updateRoom(index, { maxoccupancy: parseInt(e.target.value) })}
                      placeholder="Enter max occupancy"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <RequiredLabel>
                      <Label htmlFor={`room-numberofrooms-${index}`}>Number of Rooms</Label>
                    </RequiredLabel>
                    <Input
                      id={`room-numberofrooms-${index}`}
                      type="number"
                      value={room.number_of_rooms || ''}
                      onChange={(e) => updateRoom(index, { number_of_rooms: parseInt(e.target.value) })}
                      placeholder="Enter number of rooms"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <RequiredLabel>
                      <Label htmlFor={`room-bedtype-${index}`}>Bed Type</Label>
                    </RequiredLabel>
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`room-privatebathroom-${index}`}
                        checked={room.private_bathroom || false}
                        onCheckedChange={(checked) => updateRoom(index, { private_bathroom: !!checked })}
                      />
                      <Label htmlFor={`room-privatebathroom-${index}`}>Private Bathroom</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`room-smoking-${index}`}
                        checked={room.smoking || false}
                        onCheckedChange={(checked) => updateRoom(index, { smoking: !!checked })}
                      />
                      <Label htmlFor={`room-smoking-${index}`}>Smoking Allowed</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`room-securitydeposit-${index}`}
                        checked={room.security_deposit || false}
                        onCheckedChange={(checked) => updateRoom(index, { security_deposit: !!checked })}
                      />
                      <Label htmlFor={`room-securitydeposit-${index}`}>Security Deposit</Label>
                    </div>
                  </div>
                </div>
                
                {/* Room Images Section */}
                <div className="mt-6 border-t pt-4">
                  <h5 className="font-medium mb-3">Room Images</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {room.roomImages && room.roomImages.map((image, imageIndex) => (
                      <div key={imageIndex} className="relative aspect-[4/3]">
                        <img
                          src={image.image_url}
                          alt={`Room ${index + 1} Image ${imageIndex + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                          }}
                          loading="lazy"
                        />
                        <Button
                          type="button"
                          variant="neutral"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeRoomImage(index, imageIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <label 
                      className="border-2 border-dashed rounded-lg aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
                      onClick={() => triggerRoomFileInput(index)}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add Room Image</span>
                    </label>
                  </div>
                </div>
                
                {/* Room Amenities */}
                <div className="mt-6 border-t pt-4">
                  <h5 className="font-medium mb-3">Room Amenities</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
            ))
          )}
          
          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              className="bg-[#B11E43] hover:bg-[#8f1836]"
              disabled={loading}
            >
              {loading ? 'Creating Property...' : 'Create Property'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <ManageConfigModal
        title="Amenities"
        isOpen={manageAmenitiesOpen}
        onClose={() => setManageAmenitiesOpen(false)}
        items={amenities.map((amenity) => ({
          id: Number(amenity.id),
          name: amenity.name,
        }))}
        onCreate={handleCreateAmenity}
        onUpdate={handleUpdateAmenity}
        onDelete={handleDeleteAmenity}
      />
      <ManageConfigModal
        title="Hotel Policies"
        isOpen={managePoliciesOpen}
        onClose={() => setManagePoliciesOpen(false)}
        items={rules.map((rule) => ({
          id: rule.id,
          name: rule.name,
        }))}
        onCreate={handleCreatePolicy}
        onUpdate={handleUpdatePolicy}
        onDelete={handleDeletePolicy}
      />
      <ManageConfigModal
        title="Documentation"
        isOpen={manageDocumentationOpen}
        onClose={() => setManageDocumentationOpen(false)}
        items={documentation.map((doc) => ({
          id: doc.id,
          name: doc.name,
        }))}
        onCreate={handleCreateDocumentation}
        onUpdate={handleUpdateDocumentation}
        onDelete={handleDeleteDocumentation}
      />
      <ManageConfigModal
        title="Image Categories"
        isOpen={manageImageCategoriesOpen}
        onClose={() => setManageImageCategoriesOpen(false)}
        items={imageCategories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        onCreate={handleCreateImageCategory}
        onUpdate={handleUpdateImageCategoryName}
        onDelete={handleDeleteImageCategory}
      />
    </form>
  )
}