'use client'

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  latitude: number
  longitude: number
}

// Define the icon outside the component to avoid recreation on every render
const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#B11E43" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    ),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
})

const Map: React.FC<MapProps> = ({ latitude, longitude }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // If there's an existing map instance, remove it first
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Create a new map instance
    const map = L.map(mapRef.current).setView([latitude, longitude], 13);
    mapInstanceRef.current = map;

    // Add the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker
    L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

    // Set z-index for all leaflet containers to be lower
    document.querySelectorAll('.leaflet-pane').forEach((el) => {
      (el as HTMLElement).style.zIndex = '0';
    });
    
    document.querySelectorAll('.leaflet-control-container').forEach((el) => {
      (el as HTMLElement).style.zIndex = '1';
    });

    // Clean up function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude]); // Re-create map when coordinates change

  return <div ref={mapRef} id="map" style={{ height: '100%', width: '100%' }} />;
};

export default Map;

