'use client';

import { useState } from 'react';
import { usePoobelStore, type Stop, type ServiceType } from '@poobel/shared-data';
import {
  Plus,
  Trash2,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  GripVertical,
  Edit2,
  X,
  User,
} from 'lucide-react';

export default function RoutesPage() {
  const routes = usePoobelStore((state) => state.routes);
  const stops = usePoobelStore((state) => state.stops);
  const drivers = usePoobelStore((state) => state.drivers);
  const customers = usePoobelStore((state) => state.customers);
  const addStop = usePoobelStore((state) => state.addStop);
  const removeStop = usePoobelStore((state) => state.removeStop);
  const updateStopStatus = usePoobelStore((state) => state.updateStopStatus);

  const [selectedRoute, setSelectedRoute] = useState<string | null>(routes[0]?.id || null);
  const [showAddStop, setShowAddStop] = useState(false);
  const [newStop, setNewStop] = useState({
    customerId: '',
    address: '',
    scheduledTime: '',
    serviceType: 'residential' as ServiceType,
    notes: '',
    binLocation: '',
    accessCode: '',
  });

  const selectedRouteData = routes.find((r) => r.id === selectedRoute);
  const routeStops = stops.filter((s) => s.routeId === selectedRoute);
  const routeDriver = drivers.find((d) => d.id === selectedRouteData?.driverId);

  const statusColors: Record<string, string> = {
    pending: 'var(--text-muted)',
    in_progress: 'var(--accent-warning)',
    completed: 'var(--accent-primary)',
    skipped: 'var(--accent-danger)',
    problematic: 'var(--accent-danger)',
  };

  const handleAddStop = () => {
    if (!selectedRoute || !newStop.address || !newStop.scheduledTime) return;

    const customer = customers.find((c) => c.id === newStop.customerId);
    
    addStop({
      routeId: selectedRoute,
      customerId: newStop.customerId || 'customer-1',
      address: newStop.address || customer?.address || '',
      coordinates: customer?.coordinates || { lat: 37.7749, lng: -122.4194 },
      scheduledTime: newStop.scheduledTime,
      status: 'pending',
      serviceType: newStop.serviceType,
      notes: newStop.notes || undefined,
      binLocation: newStop.binLocation || customer?.binLocation || undefined,
      accessCode: newStop.accessCode || customer?.accessCode || undefined,
      sequence: routeStops.length + 1,
    });

    setShowAddStop(false);
    setNewStop({
      customerId: '',
      address: '',
      scheduledTime: '',
      serviceType: 'residential',
      notes: '',
      binLocation: '',
      accessCode: '',
    });
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setNewStop({
        ...newStop,
        customerId,
        address: customer.address,
        binLocation: customer.binLocation,
        accessCode: customer.accessCode || '',
        serviceType: customer.serviceType,
      });
    }
  };

  return (
    <div className="flex h-screen">
      {/* Route List */}
      <div className="w-80 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] flex flex-col">
        <div className="p-6 border-b border-[var(--border-primary)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Routes</h1>
              <p className="text-sm text-[var(--text-muted)]">{routes.length} routes</p>
            </div>
            <button className="btn-primary text-sm">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {routes.map((route) => {
            const driver = drivers.find((d) => d.id === route.driverId);
            const completed = route.stops.filter((s) => s.status === 'completed').length;
            
            return (
              <div
                key={route.id}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedRoute === route.id
                    ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]'
                    : 'bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-secondary)]'
                }`}
                onClick={() => setSelectedRoute(route.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-[var(--text-primary)]">{route.name}</p>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      route.status === 'completed'
                        ? 'badge-success'
                        : route.status === 'in_progress'
                        ? 'badge-warning'
                        : 'badge-info'
                    }`}
                  >
                    {route.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <User className="w-3 h-3" />
                  <span>{driver?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[var(--text-muted)]">
                    {completed}/{route.stops.length} stops
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {route.totalDistance} mi
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
                    style={{ width: `${(completed / Math.max(route.stops.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Route Details */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedRouteData ? (
          <>
            {/* Route Header */}
            <div className="p-6 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    {selectedRouteData.name}
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {routeDriver?.name || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {selectedRouteData.startTime} - {selectedRouteData.endTime || 'In Progress'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {selectedRouteData.totalDistance} miles
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="btn-primary flex items-center gap-2"
                  onClick={() => setShowAddStop(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Stop
                </button>
              </div>
            </div>

            {/* Stops List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {routeStops.length > 0 ? (
                  routeStops
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((stop, index) => (
                      <div
                        key={stop.id}
                        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 card-hover animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: statusColors[stop.status] }}
                            >
                              {stop.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                stop.sequence
                              )}
                            </div>
                            {index < routeStops.length - 1 && (
                              <div className="w-0.5 h-8 bg-[var(--border-primary)] mt-2" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-[var(--text-primary)]">
                                  {stop.address}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm text-[var(--text-muted)]">
                                    {stop.scheduledTime}
                                  </span>
                                  {stop.actualTime && (
                                    <span className="text-sm text-[var(--accent-primary)]">
                                      Completed: {stop.actualTime}
                                    </span>
                                  )}
                                  <span className={`badge ${
                                    stop.serviceType === 'residential'
                                      ? 'badge-info'
                                      : stop.serviceType === 'commercial'
                                      ? 'badge-purple'
                                      : 'badge-success'
                                  }`}>
                                    {stop.serviceType}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                  onClick={() => removeStop(stop.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {(stop.binLocation || stop.accessCode || stop.notes) && (
                              <div className="mt-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                                {stop.binLocation && (
                                  <p className="text-sm text-[var(--text-secondary)]">
                                    <span className="text-[var(--text-muted)]">Bin:</span> {stop.binLocation}
                                  </p>
                                )}
                                {stop.accessCode && (
                                  <p className="text-sm text-[var(--text-secondary)]">
                                    <span className="text-[var(--text-muted)]">Access Code:</span> {stop.accessCode}
                                  </p>
                                )}
                                {stop.notes && (
                                  <p className="text-sm text-[var(--text-secondary)]">
                                    <span className="text-[var(--text-muted)]">Notes:</span> {stop.notes}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <p className="text-[var(--text-secondary)]">No stops in this route</p>
                    <button
                      className="btn-primary mt-4"
                      onClick={() => setShowAddStop(true)}
                    >
                      Add First Stop
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">Select a route to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Stop Modal */}
      {showAddStop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Add New Stop</h3>
              <button
                className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
                onClick={() => setShowAddStop(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Select Customer
                </label>
                <select
                  value={newStop.customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full"
                >
                  <option value="">Select a customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={newStop.address}
                  onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
                  placeholder="Enter address"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={newStop.scheduledTime}
                    onChange={(e) => setNewStop({ ...newStop, scheduledTime: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Service Type
                  </label>
                  <select
                    value={newStop.serviceType}
                    onChange={(e) => setNewStop({ ...newStop, serviceType: e.target.value as ServiceType })}
                    className="w-full"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="recycling">Recycling</option>
                    <option value="bulk">Bulk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Bin Location
                </label>
                <input
                  type="text"
                  value={newStop.binLocation}
                  onChange={(e) => setNewStop({ ...newStop, binLocation: e.target.value })}
                  placeholder="e.g., Left side of driveway"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Access Code (optional)
                </label>
                <input
                  type="text"
                  value={newStop.accessCode}
                  onChange={(e) => setNewStop({ ...newStop, accessCode: e.target.value })}
                  placeholder="Gate code if needed"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={newStop.notes}
                  onChange={(e) => setNewStop({ ...newStop, notes: e.target.value })}
                  placeholder="Special instructions..."
                  className="w-full h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                className="btn-secondary flex-1"
                onClick={() => setShowAddStop(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary flex-1"
                onClick={handleAddStop}
                disabled={!newStop.address || !newStop.scheduledTime}
              >
                Add Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

