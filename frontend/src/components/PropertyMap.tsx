'use client'

import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { Icon, LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Property } from '@/types/property'
import Link from 'next/link'
import { LatLngBounds } from 'leaflet';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi'


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


interface PropertyMapProps {
  properties: Property[]
}


function FitToBounds({ properties }: { properties: Property[] }) {
  const map = useMap();

  useEffect(() => {
    if (!properties || properties.length === 0) return;

    const bounds = new LatLngBounds([]);
    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        bounds.extend([parseFloat(property.latitude), parseFloat(property.longitude)] as LatLngExpression);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [properties, map]);

  return null;
}


export function PropertyMap({ properties }: PropertyMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!properties || properties.length === 0) {
    return <p>No properties to display on map.</p>; // Or a default map view
  }

  return (
    <MapContainer style={{ height: '100%', width: '100%' }} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 z-10"
        aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
      </button>
      <div className={`transition-all duration-300 ${isFullscreen ? 'fixed top-0 left-0 w-full h-full z-50' : 'relative h-full w-full'}`}>
        <FitToBounds properties={properties} />
        {properties.map(property => (
          property.latitude && property.longitude ? (
            <Marker
              key={property.id}
              position={[parseFloat(property.latitude), parseFloat(property.longitude)]}
              icon={customIcon}
            >
              <Popup>
                <div className="p-2">
                  <Link href={`/property/${property.id}`}>
                    <h3 className="font-semibold">{property.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500">{property.location}</p>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </div>
    </MapContainer>
  )
} 