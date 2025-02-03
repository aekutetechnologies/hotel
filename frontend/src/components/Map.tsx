'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    initMap: () => void;
    googleMapsLoaded: boolean;
  }
}

interface MapProps {
  location: string;
}

export function Map({ location }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current) {
      // Only load script if not already loaded
      if (!window.googleMapsLoaded) {
        window.googleMapsLoaded = true;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.id = 'google-maps-script';

        window.initMap = () => {
          const map = new google.maps.Map(mapRef.current!, {
            center: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
            zoom: 12,
          });

          new google.maps.Marker({
            position: { lat: 19.0760, lng: 72.8777 },
            map: map,
            title: location,
          });
        };

        document.head.appendChild(script);
      } else {
        // If script already loaded, just initialize the map
        window.initMap();
      }

      return () => {
        // Only remove script and cleanup if component is last user
        const script = document.getElementById('google-maps-script');
        if (script && !document.querySelector('[data-map-instance]')) {
          document.head.removeChild(script);
          delete window.initMap;
          window.googleMapsLoaded = false;
        }
      };
    }
  }, [location]);

  return <div ref={mapRef} data-map-instance style={{ width: '100%', height: '400px' }} />;
}

