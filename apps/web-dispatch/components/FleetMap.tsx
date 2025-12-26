'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Map, {
  Marker,
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
  Popup,
} from 'react-map-gl/mapbox';
import type { MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import type { Driver, Stop, Coordinates } from '@poobel/shared-data';
import { Truck, MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Demo token - for production, use your own Mapbox token via env variable
// Get a free token at https://account.mapbox.com/
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNqcjNqdHYwbDA2aXAzeW5yYmN0MDI5d3MifQ.8lJTM5ZqGV0of6WV9oI8tw';

// San Francisco center
const SF_CENTER = { lat: 37.7749, lng: -122.4194 };

const statusColors: Record<string, string> = {
  en_route: '#3b82f6',
  at_stop: '#f59e0b',
  completed: '#22c55e',
  available: '#a855f7',
  offline: '#71717a',
};

const stopStatusColors: Record<string, string> = {
  completed: '#22c55e',
  in_progress: '#f59e0b',
  pending: '#3a3a48',
  skipped: '#ef4444',
  problematic: '#ef4444',
};

interface FleetMapProps {
  drivers: Driver[];
  stops: Stop[];
  selectedDriverId: string | null;
  onDriverSelect: (driverId: string | null) => void;
  onStopSelect?: (stopId: string | null) => void;
  showRouteLines?: boolean;
  className?: string;
}

interface RouteLineData {
  type: 'Feature';
  properties: { driverId: string };
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export function FleetMap({
  drivers,
  stops,
  selectedDriverId,
  onDriverSelect,
  onStopSelect,
  showRouteLines = true,
  className = '',
}: FleetMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [hoveredDriver, setHoveredDriver] = useState<Driver | null>(null);
  const [hoveredStop, setHoveredStop] = useState<Stop | null>(null);
  const [viewState, setViewState] = useState({
    longitude: SF_CENTER.lng,
    latitude: SF_CENTER.lat,
    zoom: 12.5,
    pitch: 45,
    bearing: -15,
  });

  // Generate route line GeoJSON from stops
  const routeGeoJson = useCallback(() => {
    if (!showRouteLines || stops.length === 0) return null;

    // Group stops by routeId
    const routeStops = stops.reduce((acc, stop) => {
      if (!acc[stop.routeId]) acc[stop.routeId] = [];
      acc[stop.routeId].push(stop);
      return acc;
    }, {} as Record<string, Stop[]>);

    const features: RouteLineData[] = Object.entries(routeStops).map(([routeId, stopsInRoute]) => {
      const sortedStops = [...stopsInRoute].sort((a, b) => a.sequence - b.sequence);
      const coordinates = sortedStops.map((stop) => [
        stop.coordinates.lng,
        stop.coordinates.lat,
      ] as [number, number]);

      return {
        type: 'Feature' as const,
        properties: { driverId: routeId },
        geometry: {
          type: 'LineString' as const,
          coordinates,
        },
      };
    });

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  }, [stops, showRouteLines]);

  // Fly to selected driver
  useEffect(() => {
    if (selectedDriverId && mapRef.current) {
      const driver = drivers.find((d) => d.id === selectedDriverId);
      if (driver) {
        mapRef.current.flyTo({
          center: [driver.currentLocation.lng, driver.currentLocation.lat],
          zoom: 14,
          duration: 1000,
        });
      }
    }
  }, [selectedDriverId, drivers]);

  const handleViewStateChange = useCallback((e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  }, []);

  const geoJsonData = routeGeoJson();

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
        {/* Navigation controls */}
        <NavigationControl position="top-left" showCompass showZoom />
        <GeolocateControl position="top-left" />

        {/* Route lines */}
        {geoJsonData && (
          <Source id="routes" type="geojson" data={geoJsonData}>
            <Layer
              id="route-lines"
              type="line"
              paint={{
                'line-color': '#22c55e',
                'line-width': 3,
                'line-opacity': 0.6,
                'line-dasharray': [2, 1],
              }}
            />
            <Layer
              id="route-lines-glow"
              type="line"
              paint={{
                'line-color': '#22c55e',
                'line-width': 8,
                'line-opacity': 0.15,
                'line-blur': 3,
              }}
            />
          </Source>
        )}

        {/* Stop markers */}
        {stops.map((stop) => (
          <Marker
            key={stop.id}
            longitude={stop.coordinates.lng}
            latitude={stop.coordinates.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onStopSelect?.(stop.id);
            }}
          >
            <div
              className="relative cursor-pointer transition-transform hover:scale-125"
              onMouseEnter={() => setHoveredStop(stop)}
              onMouseLeave={() => setHoveredStop(null)}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white/20"
                style={{ backgroundColor: stopStatusColors[stop.status] }}
              >
                {stop.sequence}
              </div>
              {stop.status === 'in_progress' && (
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ backgroundColor: stopStatusColors[stop.status], opacity: 0.4 }}
                />
              )}
            </div>
          </Marker>
        ))}

        {/* Driver markers */}
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            longitude={driver.currentLocation.lng}
            latitude={driver.currentLocation.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onDriverSelect(driver.id === selectedDriverId ? null : driver.id);
            }}
          >
            <div
              className={`relative cursor-pointer transition-all duration-300 ${
                selectedDriverId === driver.id ? 'scale-125 z-50' : 'hover:scale-110'
              }`}
              onMouseEnter={() => setHoveredDriver(driver)}
              onMouseLeave={() => setHoveredDriver(null)}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg border-3 border-white/30"
                style={{
                  backgroundColor: statusColors[driver.status],
                  boxShadow: selectedDriverId === driver.id
                    ? `0 0 20px ${statusColors[driver.status]}80`
                    : `0 4px 12px ${statusColors[driver.status]}40`,
                }}
              >
                <Truck className="w-5 h-5" />
              </div>
              {driver.status !== 'offline' && (
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    backgroundColor: statusColors[driver.status],
                    opacity: 0.3,
                    animationDuration: '2s',
                  }}
                />
              )}
              {/* Driver name label */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-[#12121a]/95 rounded text-xs whitespace-nowrap border border-[#2a2a36] backdrop-blur-sm">
                <span className="text-[#f5f5f7]">{driver.name.split(' ')[0]}</span>
              </div>
            </div>
          </Marker>
        ))}

        {/* Driver hover popup */}
        {hoveredDriver && (
          <Popup
            longitude={hoveredDriver.currentLocation.lng}
            latitude={hoveredDriver.currentLocation.lat}
            anchor="bottom"
            offset={[0, -50] as [number, number]}
            closeButton={false}
            className="fleet-map-popup"
          >
            <div className="bg-[#12121a] border border-[#2a2a36] rounded-lg p-3 min-w-[180px]">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: statusColors[hoveredDriver.status] }}
                >
                  {hoveredDriver.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#f5f5f7]">{hoveredDriver.name}</p>
                  <p className="text-xs text-[#71717a]">{hoveredDriver.vehiclePlate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[#71717a]">Stops: </span>
                  <span className="text-[#f5f5f7]">{hoveredDriver.completedStops}/{hoveredDriver.totalStops}</span>
                </div>
                <div>
                  <span className="text-[#71717a]">On-time: </span>
                  <span className="text-[#22c55e]">{hoveredDriver.onTimeRate}%</span>
                </div>
              </div>
            </div>
          </Popup>
        )}

        {/* Stop hover popup */}
        {hoveredStop && !hoveredDriver && (
          <Popup
            longitude={hoveredStop.coordinates.lng}
            latitude={hoveredStop.coordinates.lat}
            anchor="bottom"
            offset={[0, -20] as [number, number]}
            closeButton={false}
            className="fleet-map-popup"
          >
            <div className="bg-[#12121a] border border-[#2a2a36] rounded-lg p-3 min-w-[200px]">
              <p className="text-sm font-medium text-[#f5f5f7] mb-1">
                {hoveredStop.address.split(',')[0]}
              </p>
              <p className="text-xs text-[#71717a] mb-2">
                {hoveredStop.address.split(',').slice(1).join(',')}
              </p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stopStatusColors[hoveredStop.status] }}
                  />
                  <span className="text-[#a1a1aa] capitalize">{hoveredStop.status.replace('_', ' ')}</span>
                </div>
                <span className="text-[#71717a]">•</span>
                <span className="text-[#f5f5f7]">{hoveredStop.scheduledTime}</span>
              </div>
              {hoveredStop.binLocation && (
                <p className="text-xs text-[#71717a] mt-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {hoveredStop.binLocation}
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Custom overlay styles */}
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
        .mapboxgl-ctrl-group button span {
          filter: invert(1) !important;
        }
        .mapboxgl-ctrl-geolocate {
          background: #12121a !important;
        }
        .mapboxgl-ctrl-icon {
          filter: invert(0.8) !important;
        }
      `}</style>
    </div>
  );
}

