// components/ShowMap.tsx
'use client'

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import React from 'react'

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

interface ShowMapProps {
  latitude: number
  longitude: number
}

function LocationMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], map.getZoom())
    }
  }, [lat, lng, map])

  return lat && lng ? <Marker position={[lat, lng]} icon={customIcon} /> : null
}

export default React.memo(function ShowMap({ latitude, longitude }: ShowMapProps) {
  const [isClient, setIsClient] = useState(false)
  
  // Ensure we're on client side before rendering map
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !latitude || !longitude) return null

  return (
    <>
    {console.log("ShowMap Render", { latitude, longitude })}

    <div className="h-96 w-full rounded-lg overflow-hidden">
      <MapContainer 
        center={[latitude, longitude]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker lat={latitude} lng={longitude} />
      </MapContainer>
    </div>
    </>
  )
})