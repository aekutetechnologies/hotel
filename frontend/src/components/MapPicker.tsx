'use client'

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const customIcon = new Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    ),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
})

interface Location {
  lat: number
  lng: number
}

function LocationMarker({ location, setLocation }: { location: Location; setLocation: (location: Location) => void }) {
  const map = useMap()

  useEffect(() => {
    try {
      map.flyTo([location.lat, location.lng], map.getZoom())
    } catch (error) {
      console.error("Error flying to location:", error)
    }
  }, [location, map])

  useMapEvents({
    click(e) {
      setLocation(e.latlng)
    },
  })

  return <Marker position={location} icon={customIcon} />
}

interface MapPickerProps {
  onLocationChange: (lat: number, lng: number) => void
  initialPosition?: [number, number]
}

export function MapPicker({ onLocationChange, initialPosition = [19.1194, 72.8468] }: MapPickerProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: initialPosition[0],
    lng: initialPosition[1],
  })
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate checking if map loaded correctly
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    
    return () => clearTimeout(timeout)
  }, [])

  const handleLocationChange = (newLocation: { lat: number; lng: number }) => {
    try {
      setLocation(newLocation)
      onLocationChange(newLocation.lat, newLocation.lng)
    } catch (error) {
      console.error("Error handling location change:", error)
      setMapError("Failed to update location. Please try again.")
    }
  }

  // Handle manual input of coordinates
  const handleManualCoordinates = (lat: string, lng: string) => {
    try {
      const numLat = parseFloat(lat)
      const numLng = parseFloat(lng)
      
      if (isNaN(numLat) || isNaN(numLng)) {
        setMapError("Please enter valid coordinates")
        return
      }
      
      const newLocation = { lat: numLat, lng: numLng }
      setLocation(newLocation)
      onLocationChange(numLat, numLng)
      setMapError(null)
    } catch (error) {
      console.error("Error setting manual coordinates:", error)
      setMapError("Failed to set coordinates. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️ {mapError}</div>
          <div className="mt-4">
            <p className="mb-2 text-sm">Or enter coordinates manually:</p>
            <div className="flex gap-2 justify-center">
              <input 
                type="text"
                placeholder="Latitude" 
                className="border p-2 rounded text-sm w-28"
                onChange={(e) => handleManualCoordinates(e.target.value, location.lng.toString())}
              />
              <input 
                type="text" 
                placeholder="Longitude" 
                className="border p-2 rounded text-sm w-28"
                onChange={(e) => handleManualCoordinates(location.lat.toString(), e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker location={location} setLocation={handleLocationChange} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 right-2 bg-white p-2 rounded shadow-md z-[1000] text-xs">
        <p>Click on the map to set location or enter coordinates:</p>
        <div className="flex gap-2 mt-1">
          <input 
            type="text"
            value={location.lat.toFixed(6)} 
            onChange={(e) => handleManualCoordinates(e.target.value, location.lng.toString())}
            className="border p-1 rounded flex-1"
          />
          <input 
            type="text" 
            value={location.lng.toFixed(6)}
            onChange={(e) => handleManualCoordinates(location.lat.toString(), e.target.value)}
            className="border p-1 rounded flex-1"
          />
        </div>
      </div>
    </div>
  )
} 