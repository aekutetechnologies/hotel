// components/ShowMap.tsx
'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

interface ShowMapProps {
  latitude: number
  longitude: number
}

// Dynamically load the map component with no SSR
// This solves both the "Map container is already initialized" error and the type issues
const MapComponent = dynamic(
  () => import('./Map').then(mod => mod.default),
  { 
    loading: () => <div className="h-96 w-full bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>,
    ssr: false // This is the key - never render on server
  }
)

export default function ShowMap({ latitude, longitude }: ShowMapProps) {
  const [mountKey, setMountKey] = useState(Date.now())
  
  // Force remount when navigating between pages
  useEffect(() => {
    setMountKey(Date.now())
  }, [])

  if (!latitude || !longitude) {
    return (
      <div className="h-96 w-full bg-gray-100 rounded-lg flex items-center justify-center">
        No location data available
      </div>
    )
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden relative" style={{ zIndex: 0 }}>
      <MapComponent key={mountKey} latitude={latitude} longitude={longitude} />
    </div>
  )
}