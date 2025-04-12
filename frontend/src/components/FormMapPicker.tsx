'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the MapComponentInner to avoid SSR issues with Leaflet
const MapComponent = dynamic(
  () => import('./MapComponentInner').then(mod => ({ default: mod.MapComponentInner })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-100 h-full w-full flex items-center justify-center">Loading map...</div>
  }
)

// Default location (if none provided)
const DEFAULT_POSITION: [number, number] = [18.566516, 73.911047]

interface FormMapPickerProps {
  onLocationChange: (lat: number, lng: number) => void
  initialPosition?: [number, number]
  className?: string
}

export function FormMapPicker({
  onLocationChange,
  initialPosition = DEFAULT_POSITION,
  className = 'h-[400px] w-full rounded-md border border-input'
}: FormMapPickerProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  // Generate a stable instance ID that won't change on re-renders
  const instanceId = useRef(`map-${Math.random().toString(36).substring(2, 9)}`).current;
  
  // Store last coordinates to prevent unnecessary updates
  const lastCoordsRef = useRef<[number, number]>(initialPosition);
  
  // Memoize the location change handler to prevent it from causing re-renders
  const handleLocationChange = useCallback((lat: number, lng: number) => {
    const [lastLat, lastLng] = lastCoordsRef.current;
    
    // Only update if the coordinates have changed significantly
    if (Math.abs(lastLat - lat) > 0.0000001 || Math.abs(lastLng - lng) > 0.0000001) {
      lastCoordsRef.current = [lat, lng];
      onLocationChange(lat, lng);
    }
  }, [onLocationChange]);
  
  // Only hydrate the map component on the client side
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Show a loading state for SSR or before hydration
  if (!isMounted) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-gray-500">Map loading...</div>
      </div>
    )
  }

  return (
    <div className={className}>
      <MapComponent
        instanceId={instanceId}
        onLocationChange={handleLocationChange}
        initialPosition={initialPosition}
        onError={(error) => console.error('Map error:', error)}
      />
    </div>
  )
} 