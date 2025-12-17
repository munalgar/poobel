'use client';

import { useState } from 'react';
import { usePoobelStore } from '@poobel/shared-data';
import {
  MapPin,
  Navigation,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  Locate,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

type FilterStatus = 'all' | 'en_route' | 'at_stop' | 'completed' | 'available';

export default function MapPage() {
  const drivers = usePoobelStore((state) => state.drivers);
  const stops = usePoobelStore((state) => state.stops);
  const routes = usePoobelStore((state) => state.routes);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const filteredDrivers =
    filterStatus === 'all'
      ? drivers
      : drivers.filter((d) => d.status === filterStatus);

  const selectedDriverData = drivers.find((d) => d.id === selectedDriver);
  const selectedDriverRoute = routes.find(
    (r) => r.driverId === selectedDriver && r.status === 'in_progress'
  );

  const statusColors: Record<string, string> = {
    en_route: '#3b82f6',
    at_stop: '#f59e0b',
    completed: '#22c55e',
    available: '#a855f7',
    offline: '#71717a',
  };

  const statusLabels: Record<string, string> = {
    en_route: 'En Route',
    at_stop: 'At Stop',
    completed: 'Completed',
    available: 'Available',
    offline: 'Offline',
  };

  return (
    <div className="h-screen flex">
      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Map Container */}
        <div className="absolute inset-0 map-placeholder">
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2020h40M20%200v40%22%20stroke%3D%22%232a2a36%22%20stroke-width%3D%220.5%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
          
          {/* Route lines simulation */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d="M 200 300 Q 300 200, 400 250 T 600 300 T 750 200"
              stroke="var(--accent-primary)"
              strokeWidth="3"
              strokeDasharray="8 4"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 100 400 Q 250 350, 350 400 T 500 380"
              stroke="var(--accent-info)"
              strokeWidth="3"
              strokeDasharray="8 4"
              fill="none"
              opacity="0.6"
            />
          </svg>

          {/* Stop markers */}
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${15 + (index * 12) % 70}%`,
                top: `${20 + (index * 15) % 60}%`,
              }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform hover:scale-125 ${
                  stop.status === 'completed'
                    ? 'bg-[var(--accent-primary)]'
                    : stop.status === 'in_progress'
                    ? 'bg-[var(--accent-warning)]'
                    : 'bg-[var(--bg-tertiary)] border-2 border-[var(--border-secondary)]'
                }`}
              >
                {stop.sequence}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <p className="text-sm font-medium text-[var(--text-primary)]">{stop.address.split(',')[0]}</p>
                <p className="text-xs text-[var(--text-muted)]">{stop.scheduledTime}</p>
              </div>
            </div>
          ))}

          {/* Driver markers */}
          {filteredDrivers.map((driver, index) => (
            <div
              key={driver.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                selectedDriver === driver.id ? 'z-30 scale-125' : 'z-20'
              }`}
              style={{
                left: `${25 + (index * 18) % 60}%`,
                top: `${30 + (index * 20) % 50}%`,
              }}
              onClick={() => setSelectedDriver(driver.id === selectedDriver ? null : driver.id)}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-3 border-white"
                style={{ backgroundColor: statusColors[driver.status] }}
              >
                <Truck className="w-5 h-5" />
              </div>
              {/* Pulse effect for active drivers */}
              {driver.status !== 'offline' && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: statusColors[driver.status] }}
                />
              )}
              {/* Driver name label */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-[var(--bg-primary)]/90 px-2 py-1 rounded text-xs whitespace-nowrap border border-[var(--border-primary)]">
                {driver.name.split(' ')[0]}
              </div>
            </div>
          ))}
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 left-4 space-y-2 z-40">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-1 flex flex-col gap-1">
            <button className="p-2 hover:bg-[var(--bg-hover)] rounded transition-colors">
              <ZoomIn className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <button className="p-2 hover:bg-[var(--bg-hover)] rounded transition-colors">
              <ZoomOut className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <div className="h-px bg-[var(--border-primary)] mx-2" />
            <button className="p-2 hover:bg-[var(--bg-hover)] rounded transition-colors">
              <Locate className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-1">
            <button className="p-2 hover:bg-[var(--bg-hover)] rounded transition-colors">
              <Layers className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="absolute top-4 right-4 left-auto z-40 mr-80">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-2 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--text-muted)]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="bg-transparent text-sm text-[var(--text-primary)] border-none focus:outline-none cursor-pointer"
            >
              <option value="all">All Drivers</option>
              <option value="en_route">En Route</option>
              <option value="at_stop">At Stop</option>
              <option value="completed">Completed</option>
              <option value="available">Available</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 z-40">
          <p className="text-xs font-medium text-[var(--text-muted)] mb-3">DRIVER STATUS</p>
          <div className="space-y-2">
            {Object.entries(statusLabels).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: statusColors[status] }}
                />
                <span className="text-sm text-[var(--text-secondary)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-[var(--bg-secondary)] border-l border-[var(--border-primary)] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-primary)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Fleet Tracking</h2>
          <p className="text-sm text-[var(--text-muted)]">{drivers.length} vehicles</p>
        </div>

        {/* Selected Driver Details */}
        {selectedDriverData && (
          <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: statusColors[selectedDriverData.status] }}
              >
                {selectedDriverData.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[var(--text-primary)]">{selectedDriverData.name}</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColors[selectedDriverData.status] }}
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {statusLabels[selectedDriverData.status]}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-muted)]">Completed</p>
                <p className="text-lg font-bold text-[var(--accent-primary)]">
                  {selectedDriverData.completedStops}
                </p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-muted)]">On-Time</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {selectedDriverData.onTimeRate}%
                </p>
              </div>
            </div>

            {selectedDriverRoute && (
              <div className="mt-4">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">CURRENT ROUTE</p>
                <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                  <p className="font-medium text-[var(--text-primary)]">{selectedDriverRoute.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {selectedDriverRoute.stops.filter((s) => s.status === 'completed').length}/{selectedDriverRoute.stops.length} stops
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Driver List */}
        <div className="p-4">
          <p className="text-xs font-medium text-[var(--text-muted)] mb-3">ALL DRIVERS</p>
          <div className="space-y-2">
            {filteredDrivers.map((driver) => (
              <div
                key={driver.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedDriver === driver.id
                    ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]'
                    : 'bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-secondary)]'
                }`}
                onClick={() => setSelectedDriver(driver.id === selectedDriver ? null : driver.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: statusColors[driver.status] }}
                  >
                    {driver.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {driver.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{driver.vehiclePlate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--text-primary)]">
                      {driver.completedStops}/{driver.totalStops}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">stops</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

