'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Map, {
  Marker,
  Source,
  Layer,
  NavigationControl,
  Popup,
} from 'react-map-gl/mapbox';
import type { MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import type { Coordinates, Driver } from '@poobel/shared-data';
import { Truck, Home, Navigation } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Demo token - for production, use your own Mapbox token via env variable
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNqcjNqdHYwbDA2aXAzeW5yYmN0MDI5d3MifQ.8lJTM5ZqGV0of6WV9oI8tw';

const statusColors: Record<string, string> = {
  en_route: '#3b82f6',
  at_stop: '#f59e0b',
  completed: '#22c55e',
  available: '#a855f7',
  offline: '#71717a',
};

interface TrackingMapProps {
  customerLocation: Coordinates;
  customerAddress: string;
  driver?: Driver;
  showDriver?: boolean;
  className?: string;
}

export function TrackingMap({
  customerLocation,
  customerAddress,
  driver,
  showDriver = true,
  className = '',
}: TrackingMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [showDriverPopup, setShowDriverPopup] = useState(false);
  
  // Calculate center between customer and driver, or just customer location
  const getCenter = () => {
    if (driver && showDriver) {
      return {
        lng: (customerLocation.lng + driver.currentLocation.lng) / 2,
        lat: (customerLocation.lat + driver.currentLocation.lat) / 2,
      };
    }
    return customerLocation;
  };

  const center = getCenter();
  
  const [viewState, setViewState] = useState({
    longitude: center.lng,
    latitude: center.lat,
    zoom: driver && showDriver ? 13 : 14.5,
    pitch: 40,
    bearing: 0,
  });

  // Create route line between driver and customer
  const routeGeoJson = driver && showDriver ? {
    type: 'FeatureCollection' as const,
    features: [{
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [driver.currentLocation.lng, driver.currentLocation.lat],
          [customerLocation.lng, customerLocation.lat],
        ],
      },
    }],
  } : null;

  // Fit bounds when driver is present
  useEffect(() => {
    if (driver && showDriver && mapRef.current) {
      const bounds: [[number, number], [number, number]] = [
        [
          Math.min(customerLocation.lng, driver.currentLocation.lng) - 0.01,
          Math.min(customerLocation.lat, driver.currentLocation.lat) - 0.01,
        ],
        [
          Math.max(customerLocation.lng, driver.currentLocation.lng) + 0.01,
          Math.max(customerLocation.lat, driver.currentLocation.lat) + 0.01,
        ],
      ];
      
      mapRef.current.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        duration: 1000,
      });
    }
  }, [driver?.id, showDriver]);

  const handleViewStateChange = useCallback((e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleViewStateChange}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        fog={{
          range: [0.8, 8],
          color: '#0a0a0f',
          'horizon-blend': 0.5,
          'high-color': '#0a0a0f',
          'space-color': '#0a0a0f',
          'star-intensity': 0,
        }}
      >
        <NavigationControl position="top-right" showCompass showZoom visualizePitch />

        {/* Route line from driver to customer */}
        {routeGeoJson && (
          <Source id="route" type="geojson" data={routeGeoJson}>
            {/* Animated dashed line */}
            <Layer
              id="route-line-bg"
              type="line"
              paint={{
                'line-color': '#22c55e',
                'line-width': 4,
                'line-opacity': 0.3,
              }}
            />
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#22c55e',
                'line-width': 3,
                'line-dasharray': [2, 2],
              }}
            />
            {/* Glow effect */}
            <Layer
              id="route-glow"
              type="line"
              paint={{
                'line-color': '#22c55e',
                'line-width': 12,
                'line-opacity': 0.15,
                'line-blur': 4,
              }}
            />
          </Source>
        )}

        {/* Customer location marker */}
        <Marker
          longitude={customerLocation.lng}
          latitude={customerLocation.lat}
          anchor="center"
        >
          <div className="relative">
            {/* Outer ring pulse */}
            <div className="absolute inset-0 w-14 h-14 -m-2 rounded-full bg-[#22c55e] opacity-20 animate-ping" />
            {/* Inner marker */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center shadow-lg border-2 border-white/30">
              <Home className="w-5 h-5 text-white" />
            </div>
            {/* Label */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#12121a]/95 rounded-lg text-xs whitespace-nowrap border border-[#2a2a36] backdrop-blur-sm">
              <span className="text-[#f5f5f7] font-medium">Your Location</span>
            </div>
          </div>
        </Marker>

        {/* Driver marker */}
        {driver && showDriver && (
          <Marker
            longitude={driver.currentLocation.lng}
            latitude={driver.currentLocation.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setShowDriverPopup(!showDriverPopup);
            }}
          >
            <div className="relative cursor-pointer group">
              {/* Pulse animation for en_route */}
              {driver.status === 'en_route' && (
                <div
                  className="absolute inset-0 w-14 h-14 -m-2 rounded-full animate-ping"
                  style={{ backgroundColor: statusColors[driver.status], opacity: 0.3 }}
                />
              )}
              {/* Driver icon */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl border-3 border-white/40 transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: statusColors[driver.status],
                  boxShadow: `0 4px 20px ${statusColors[driver.status]}60`,
                }}
              >
                <Truck className="w-6 h-6" />
              </div>
              {/* Direction indicator */}
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md"
                style={{ transform: 'rotate(45deg)' }}
              >
                <Navigation className="w-3 h-3 text-[#3b82f6]" style={{ transform: 'rotate(-45deg)' }} />
              </div>
            </div>
          </Marker>
        )}

        {/* Driver popup */}
        {driver && showDriver && showDriverPopup && (
          <Popup
            longitude={driver.currentLocation.lng}
            latitude={driver.currentLocation.lat}
            anchor="bottom"
            offset={[0, -55] as [number, number]}
            closeButton={false}
            onClose={() => setShowDriverPopup(false)}
          >
            <div className="bg-[#12121a] border border-[#2a2a36] rounded-xl p-4 min-w-[220px]">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: statusColors[driver.status] }}
                >
                  {driver.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-[#f5f5f7]">{driver.name}</p>
                  <p className="text-sm text-[#71717a]">{driver.vehiclePlate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-[#f59e0b]">★</span>
                  <span className="text-[#f5f5f7]">{driver.rating}</span>
                </div>
                <span className="text-[#3a3a48]">•</span>
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColors[driver.status] }}
                  />
                  <span className="text-[#a1a1aa] capitalize">
                    {driver.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Status overlay */}
      {driver && showDriver && (
        <div className="absolute bottom-4 left-4 right-4 bg-[#12121a]/95 backdrop-blur-sm border border-[#2a2a36] rounded-xl p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: statusColors[driver.status] }}
              >
                {driver.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-[#f5f5f7]">{driver.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div
                    className={`w-2 h-2 rounded-full ${driver.status === 'en_route' ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: statusColors[driver.status] }}
                  />
                  <span className="text-sm text-[#a1a1aa]">
                    {driver.status === 'en_route'
                      ? 'On the way to you'
                      : driver.status === 'at_stop'
                      ? 'At previous stop'
                      : 'Scheduled'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#71717a]">Rating</p>
              <p className="text-lg font-bold text-[#f5f5f7] flex items-center gap-1">
                <span className="text-[#f59e0b]">★</span> {driver.rating}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map styles */}
      <style jsx global>{`
        .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
        }
        .mapboxgl-popup-tip {
          display: none !important;
        }
        .mapboxgl-ctrl-group {
          background: #12121a !important;
          border: 1px solid #2a2a36 !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .mapboxgl-ctrl-group button {
          background: #12121a !important;
          border-color: #2a2a36 !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background: #1a1a24 !important;
        }
        .mapboxgl-ctrl-icon {
          filter: invert(0.8) !important;
        }
      `}</style>
    </div>
  );
}

