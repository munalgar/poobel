'use client';

import { useState } from 'react';
import { usePoobelStore } from '@poobel/shared-data';
import {
  Star,
  Phone,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default function DriversPage() {
  const drivers = usePoobelStore((state) => state.drivers);
  const reviews = usePoobelStore((state) => state.reviews);
  const routes = usePoobelStore((state) => state.routes);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDriverData = drivers.find((d) => d.id === selectedDriver);
  const driverReviews = selectedDriver
    ? reviews.filter((r) => r.driverId === selectedDriver)
    : [];
  const driverRoutes = selectedDriver
    ? routes.filter((r) => r.driverId === selectedDriver)
    : [];

  const statusColors: Record<string, string> = {
    en_route: 'var(--accent-info)',
    at_stop: 'var(--accent-warning)',
    completed: 'var(--accent-primary)',
    available: 'var(--accent-purple)',
    offline: 'var(--text-muted)',
  };

  const statusLabels: Record<string, string> = {
    en_route: 'En Route',
    at_stop: 'At Stop',
    completed: 'Completed',
    available: 'Available',
    offline: 'Offline',
  };

  return (
    <div className="flex h-screen">
      {/* Driver List */}
      <div className="w-96 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-primary)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Drivers</h1>
              <p className="text-sm text-[var(--text-muted)]">{drivers.length} total drivers</p>
            </div>
            <button className="btn-primary">Add Driver</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5"
            />
          </div>
        </div>

        {/* Driver List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                selectedDriver === driver.id
                  ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]'
                  : 'bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-secondary)]'
              }`}
              onClick={() => setSelectedDriver(driver.id)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-info)] to-[var(--accent-purple)] flex items-center justify-center text-white font-semibold">
                    {driver.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--bg-tertiary)]"
                    style={{ backgroundColor: statusColors[driver.status] }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] truncate">{driver.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[var(--accent-warning)] fill-[var(--accent-warning)]" />
                      <span className="text-sm text-[var(--text-secondary)]">{driver.rating}</span>
                    </div>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="text-sm text-[var(--text-muted)]">{statusLabels[driver.status]}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Details */}
      <div className="flex-1 overflow-y-auto">
        {selectedDriverData ? (
          <div className="p-8">
            {/* Driver Header */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-info)] to-[var(--accent-purple)] flex items-center justify-center text-white text-2xl font-bold">
                    {selectedDriverData.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                      {selectedDriverData.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${statusColors[selectedDriverData.status]}20`,
                          color: statusColors[selectedDriverData.status],
                        }}
                      >
                        {statusLabels[selectedDriverData.status]}
                      </span>
                      <span className="text-sm text-[var(--text-muted)]">
                        {selectedDriverData.vehiclePlate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                  <button className="btn-primary flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--border-primary)]">
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Email</p>
                  <p className="text-sm text-[var(--text-primary)]">{selectedDriverData.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Phone</p>
                  <p className="text-sm text-[var(--text-primary)]">{selectedDriverData.phone}</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-[var(--accent-warning)]" />
                  <span className="text-sm text-[var(--text-muted)]">Rating</span>
                </div>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{selectedDriverData.rating}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{selectedDriverData.totalRatings} reviews</p>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span className="text-sm text-[var(--text-muted)]">Completed</span>
                </div>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{selectedDriverData.completedStops}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">of {selectedDriverData.totalStops} stops</p>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[var(--accent-info)]" />
                  <span className="text-sm text-[var(--text-muted)]">On-Time</span>
                </div>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{selectedDriverData.onTimeRate}%</p>
                <p className="text-xs text-[var(--accent-primary)] mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +2.1% this week
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-[var(--accent-danger)]" />
                  <span className="text-sm text-[var(--text-muted)]">Missed</span>
                </div>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{selectedDriverData.missedCount}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">total missed stops</p>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Performance Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[var(--text-secondary)]">Early Pickups</span>
                      <span className="text-sm font-medium text-[var(--accent-primary)]">{selectedDriverData.earlyCount}</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-primary)] rounded-full"
                        style={{ width: `${(selectedDriverData.earlyCount / selectedDriverData.totalStops) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[var(--text-secondary)]">On-Time Pickups</span>
                      <span className="text-sm font-medium text-[var(--accent-info)]">
                        {selectedDriverData.completedStops - selectedDriverData.earlyCount - selectedDriverData.lateCount}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-info)] rounded-full"
                        style={{
                          width: `${((selectedDriverData.completedStops - selectedDriverData.earlyCount - selectedDriverData.lateCount) / selectedDriverData.totalStops) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[var(--text-secondary)]">Late Pickups</span>
                      <span className="text-sm font-medium text-[var(--accent-warning)]">{selectedDriverData.lateCount}</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-warning)] rounded-full"
                        style={{ width: `${(selectedDriverData.lateCount / selectedDriverData.totalStops) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[var(--text-secondary)]">Missed Pickups</span>
                      <span className="text-sm font-medium text-[var(--accent-danger)]">{selectedDriverData.missedCount}</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-danger)] rounded-full"
                        style={{ width: `${(selectedDriverData.missedCount / selectedDriverData.totalStops) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {driverReviews.length > 0 ? (
                    driverReviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-[var(--accent-warning)] fill-[var(--accent-warning)]'
                                  : 'text-[var(--text-muted)]'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-[var(--text-muted)] ml-auto">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-[var(--text-secondary)]">{review.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-[var(--text-muted)] py-8">No reviews yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Current/Recent Routes */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Routes</h3>
              <div className="space-y-3">
                {driverRoutes.length > 0 ? (
                  driverRoutes.map((route) => (
                    <div
                      key={route.id}
                      className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{route.name}</p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {route.stops.length} stops · {route.totalDistance} mi
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                  ))
                ) : (
                  <p className="text-center text-[var(--text-muted)] py-8">No routes assigned</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <p className="text-[var(--text-secondary)]">Select a driver to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

