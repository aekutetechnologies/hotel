'use client'

import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix for the missing icon issue in Leaflet
const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Set the default icon for all markers
L.Marker.prototype.options.icon = DefaultIcon

// Component for handling map clicks to update marker position
function LocationMarker({ 
  position, 
  setPosition 
}: { 
  position: [number, number] 
  setPosition: (pos: [number, number]) => void 
}) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])
    }
  })

  // Store previous position to avoid unnecessary updates
  const prevPositionRef = useRef<[number, number]>(position);

  useEffect(() => {
    // Only fly to the position if it actually changed significantly
    // This prevents unnecessary updates and infinite loops
    const [prevLat, prevLng] = prevPositionRef.current;
    const [newLat, newLng] = position;
    
    const latChanged = Math.abs(prevLat - newLat) > 0.0000001;
    const lngChanged = Math.abs(prevLng - newLng) > 0.0000001;
    
    if (latChanged || lngChanged) {
      prevPositionRef.current = position;
      map.flyTo(position, map.getZoom());
    }
  }, [map, position]);

  return <Marker position={position} />
}

// Props for the MapComponentInner component
interface MapComponentInnerProps {
  instanceId: string
  onLocationChange: (lat: number, lng: number) => void
  initialPosition: [number, number]
  onError?: (error: Error) => void
}

export function MapComponentInner({
  instanceId,
  onLocationChange,
  initialPosition,
  onError
}: MapComponentInnerProps) {
  // Use a ref to track initialPosition changes to avoid unnecessary state updates
  const initialPositionRef = useRef<[number, number]>(initialPosition);
  const [position, setPosition] = useState<[number, number]>(initialPosition);

  // Update position if initialPosition changes significantly
  useEffect(() => {
    const [currentLat, currentLng] = initialPositionRef.current;
    const [newLat, newLng] = initialPosition;
    
    const hasChangedSignificantly = 
      Math.abs(currentLat - newLat) > 0.0001 || 
      Math.abs(currentLng - newLng) > 0.0001;
    
    if (hasChangedSignificantly) {
      initialPositionRef.current = initialPosition;
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  // Handle position changes with debouncing to prevent rapid updates
  useEffect(() => {
    // Don't call onLocationChange during the initial render or if initialPosition just changed
    if (position !== initialPositionRef.current) {
      onLocationChange(position[0], position[1]);
    }
  }, [position, onLocationChange]);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  )
} 