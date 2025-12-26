'use client';

import { useState } from 'react';
import { usePoobelStore } from '@poobel/shared-data';
import { FleetMap } from '../../components/FleetMap';
import {
  Filter,
  Layers,
  Truck,
  Navigation,
  Clock,
  MapPin,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

type FilterStatus = 'all' | 'en_route' | 'at_stop' | 'completed' | 'available';

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

export default function MapPage() {
  const drivers = usePoobelStore((state) => state.drivers);
  const stops = usePoobelStore((state) => state.stops);
  const routes = usePoobelStore((state) => state.routes);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');

  const filteredDrivers =
    filterStatus === 'all'
      ? drivers
      : drivers.filter((d) => d.status === filterStatus);

  const selectedDriverData = drivers.find((d) => d.id === selectedDriver);
  const selectedDriverRoute = routes.find(
    (r) => r.driverId === selectedDriver && r.status === 'in_progress'
  );

  // Get stops for the selected driver's route
  const selectedDriverStops = selectedDriverRoute
    ? stops.filter((s) => s.routeId === selectedDriverRoute.id)
    : stops;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Map Component */}
        <FleetMap
          drivers={filteredDrivers}
          stops={selectedDriver ? selectedDriverStops : stops}
          selectedDriverId={selectedDriver}
          onDriverSelect={setSelectedDriver}
          showRouteLines={true}
          className="absolute inset-0"
        />

        {/* Filter Bar */}
        <div className="absolute top-4 left-20 z-10">
          <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-sm border border-[var(--border-primary)] rounded-lg p-2 flex items-center gap-3 shadow-xl">
            <Filter className="w-4 h-4 text-[var(--text-muted)]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="bg-transparent text-sm text-[var(--text-primary)] border-none focus:outline-none cursor-pointer pr-6"
            >
              <option value="all">All Drivers ({drivers.length})</option>
              <option value="en_route">En Route ({drivers.filter(d => d.status === 'en_route').length})</option>
              <option value="at_stop">At Stop ({drivers.filter(d => d.status === 'at_stop').length})</option>
              <option value="completed">Completed ({drivers.filter(d => d.status === 'completed').length})</option>
              <option value="available">Available ({drivers.filter(d => d.status === 'available').length})</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-[var(--bg-secondary)]/95 backdrop-blur-sm border border-[var(--border-primary)] rounded-lg p-4 z-10 shadow-xl">
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
          <div className="mt-4 pt-3 border-t border-[var(--border-primary)]">
            <p className="text-xs font-medium text-[var(--text-muted)] mb-2">STOP STATUS</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="text-xs text-[var(--text-secondary)]">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <span className="text-xs text-[var(--text-secondary)]">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3a3a48] border border-[#5a5a68]" />
                <span className="text-xs text-[var(--text-secondary)]">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapse/Expand Panel Button */}
        <button
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          className={`absolute top-1/2 -translate-y-1/2 z-20 bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-2 rounded-l-lg transition-all duration-300 hover:bg-[var(--bg-hover)] ${
            isPanelCollapsed ? 'right-0' : 'right-80'
          }`}
        >
          <ChevronRight
            className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${
              isPanelCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Right Panel */}
      <div
        className={`bg-[var(--bg-secondary)] border-l border-[var(--border-primary)] overflow-y-auto transition-all duration-300 ${
          isPanelCollapsed ? 'w-0 opacity-0' : 'w-80 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Fleet Tracking</h2>
              <p className="text-sm text-[var(--text-muted)]">
                {filteredDrivers.length} vehicle{filteredDrivers.length !== 1 ? 's' : ''} • {stops.length} stops
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-info)] flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Selected Driver Details */}
        {selectedDriverData && (
          <div className="p-4 border-b border-[var(--border-primary)] bg-gradient-to-b from-[var(--bg-tertiary)] to-[var(--bg-secondary)]">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{
                  backgroundColor: statusColors[selectedDriverData.status],
                  boxShadow: `0 4px 20px ${statusColors[selectedDriverData.status]}40`,
                }}
              >
                {selectedDriverData.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-primary)]">{selectedDriverData.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: statusColors[selectedDriverData.status] }}
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {statusLabels[selectedDriverData.status]}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">{selectedDriverData.vehiclePlate}</p>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-primary)]/50 rounded-lg p-3 border border-[var(--border-primary)]">
                <p className="text-xs text-[var(--text-muted)]">Completed</p>
                <p className="text-xl font-bold text-[var(--accent-primary)]">
                  {selectedDriverData.completedStops}
                </p>
                <p className="text-xs text-[var(--text-muted)]">of {selectedDriverData.totalStops} stops</p>
              </div>
              <div className="bg-[var(--bg-primary)]/50 rounded-lg p-3 border border-[var(--border-primary)]">
                <p className="text-xs text-[var(--text-muted)]">On-Time Rate</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {selectedDriverData.onTimeRate}%
                </p>
                <div className="h-1 bg-[var(--bg-tertiary)] rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-info)] rounded-full"
                    style={{ width: `${selectedDriverData.onTimeRate}%` }}
                  />
                </div>
              </div>
            </div>

            {selectedDriverRoute && (
              <div className="mt-4">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">CURRENT ROUTE</p>
                <div className="bg-[var(--bg-primary)]/50 rounded-lg p-3 border border-[var(--border-primary)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{selectedDriverRoute.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {selectedDriverRoute.stops.filter((s) => s.status === 'completed').length}/{selectedDriverRoute.stops.length} stops completed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-muted)]">Distance</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{selectedDriverRoute.totalDistance} mi</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full transition-all duration-500"
                      style={{
                        width: `${(selectedDriverRoute.stops.filter((s) => s.status === 'completed').length / selectedDriverRoute.stops.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stop List for Selected Driver */}
            {selectedDriverStops.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">ROUTE STOPS</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedDriverStops.sort((a, b) => a.sequence - b.sequence).map((stop) => (
                    <div
                      key={stop.id}
                      className="flex items-center gap-3 p-2 bg-[var(--bg-primary)]/30 rounded-lg border border-[var(--border-primary)]/50"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          stop.status === 'completed'
                            ? 'bg-[var(--accent-primary)] text-white'
                            : stop.status === 'in_progress'
                            ? 'bg-[var(--accent-warning)] text-white'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-secondary)]'
                        }`}
                      >
                        {stop.sequence}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--text-primary)] truncate">{stop.address.split(',')[0]}</p>
                        <p className="text-xs text-[var(--text-muted)]">{stop.scheduledTime}</p>
                      </div>
                      {stop.status === 'completed' && stop.actualTime && (
                        <span className="text-xs text-[var(--accent-primary)]">{stop.actualTime}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Driver List */}
        <div className="p-4">
          <p className="text-xs font-medium text-[var(--text-muted)] mb-3">
            {selectedDriver ? 'OTHER DRIVERS' : 'ALL DRIVERS'}
          </p>
          <div className="space-y-2">
            {filteredDrivers
              .filter((d) => d.id !== selectedDriver)
              .map((driver) => (
                <div
                  key={driver.id}
                  className="p-3 rounded-lg cursor-pointer transition-all bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-secondary)] hover:bg-[var(--bg-hover)]"
                  onClick={() => setSelectedDriver(driver.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: statusColors[driver.status] }}
                      >
                        {driver.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      {driver.status !== 'offline' && (
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-tertiary)]"
                          style={{ backgroundColor: statusColors[driver.status] }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {driver.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{driver.vehiclePlate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
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
