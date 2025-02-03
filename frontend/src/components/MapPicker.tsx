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
    map.flyTo([location.lat, location.lng], map.getZoom())
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

  const handleLocationChange = (newLocation: { lat: number; lng: number }) => {
    setLocation(newLocation)
    onLocationChange(newLocation.lat, newLocation.lng)
  }

  return (
    <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker location={location} setLocation={handleLocationChange} />
    </MapContainer>
  )
} 