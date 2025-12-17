'use client';

import { usePoobelStore } from '@poobel/shared-data';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Route as RouteIcon,
} from 'lucide-react';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  color: string;
}) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 card-hover animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-1">{title}</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
          {subtitle && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp
                className={`w-4 h-4 ${
                  trend.positive ? 'text-[var(--accent-primary)]' : 'text-[var(--accent-danger)]'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  trend.positive ? 'text-[var(--accent-primary)]' : 'text-[var(--accent-danger)]'
                }`}
              >
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-[var(--text-muted)]">vs last week</span>
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function DriverStatusCard({
  driver,
}: {
  driver: {
    id: string;
    name: string;
    status: string;
    currentLocation: { lat: number; lng: number };
    completedStops: number;
    totalStops: number;
  };
}) {
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
    <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)] card-hover">
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
        <p className="text-sm text-[var(--text-muted)]">{statusLabels[driver.status]}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {driver.completedStops}/{driver.totalStops}
        </p>
        <p className="text-xs text-[var(--text-muted)]">stops</p>
      </div>
    </div>
  );
}

function AlertCard({
  alert,
}: {
  alert: {
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    timestamp: string;
  };
}) {
  const severityColors: Record<string, string> = {
    low: 'var(--accent-info)',
    medium: 'var(--accent-warning)',
    high: 'var(--accent-danger)',
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)]">
      <div
        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
        style={{ backgroundColor: severityColors[alert.severity] }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--text-primary)] text-sm">{alert.title}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{alert.message}</p>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          {new Date(alert.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

function RecentActivity() {
  const stops = usePoobelStore((state) => state.stops);
  const completedStops = stops.filter((s) => s.status === 'completed').slice(-5);

  return (
    <div className="space-y-3">
      {completedStops.map((stop, index) => (
        <div
          key={stop.id}
          className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg animate-slide-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="w-8 h-8 rounded-lg bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--text-primary)] truncate">{stop.address}</p>
            <p className="text-xs text-[var(--text-muted)]">
              Completed at {stop.actualTime || 'N/A'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const drivers = usePoobelStore((state) => state.drivers);
  const routes = usePoobelStore((state) => state.routes);
  const stops = usePoobelStore((state) => state.stops);
  const alerts = usePoobelStore((state) => state.alerts);

  const activeDrivers = drivers.filter((d) => d.status !== 'offline').length;
  const completedStops = stops.filter((s) => s.status === 'completed').length;
  const pendingStops = stops.filter((s) => s.status === 'pending').length;
  const activeRoutes = routes.filter((r) => r.status === 'in_progress').length;
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Real-time overview of waste collection operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Drivers"
          value={activeDrivers}
          subtitle={`${drivers.length} total drivers`}
          icon={Users}
          trend={{ value: 12, positive: true }}
          color="var(--accent-info)"
        />
        <StatCard
          title="Active Routes"
          value={activeRoutes}
          subtitle={`${routes.length} total routes`}
          icon={RouteIcon}
          color="var(--accent-purple)"
        />
        <StatCard
          title="Completed Stops"
          value={completedStops}
          subtitle={`${pendingStops} pending`}
          icon={CheckCircle}
          trend={{ value: 8, positive: true }}
          color="var(--accent-primary)"
        />
        <StatCard
          title="Active Alerts"
          value={unresolvedAlerts.length}
          icon={AlertTriangle}
          color="var(--accent-warning)"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Overview */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Fleet Overview</h2>
            <button className="btn-secondary text-sm">View All</button>
          </div>
          <div className="map-placeholder rounded-lg h-64 mb-6 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-[var(--accent-primary)] animate-pulse" />
            </div>
            {/* Driver markers simulation */}
            {drivers.slice(0, 4).map((driver, index) => (
              <div
                key={driver.id}
                className="absolute w-4 h-4 bg-[var(--accent-primary)] rounded-full border-2 border-white shadow-lg"
                style={{
                  left: `${20 + index * 20}%`,
                  top: `${30 + (index % 2) * 30}%`,
                }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-primary)] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                  {driver.name}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {drivers.slice(0, 4).map((driver) => (
              <DriverStatusCard key={driver.id} driver={driver} />
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Active Alerts</h2>
              <span className="badge badge-warning">{unresolvedAlerts.length}</span>
            </div>
            <div className="space-y-3">
              {unresolvedAlerts.length > 0 ? (
                unresolvedAlerts.slice(0, 3).map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))
              ) : (
                <p className="text-center text-[var(--text-muted)] py-4">No active alerts</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h2>
            </div>
            <RecentActivity />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Avg. Completion Time</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">4.2 min</p>
            </div>
          </div>
          <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full" />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">Target: 5 min</p>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.15)] flex items-center justify-center">
              <Truck className="w-5 h-5 text-[var(--accent-info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Fleet Utilization</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">87%</p>
            </div>
          </div>
          <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div className="h-full w-[87%] bg-gradient-to-r from-[var(--accent-info)] to-[var(--accent-purple)] rounded-full" />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">{activeDrivers} of {drivers.length} vehicles active</p>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[rgba(168,85,247,0.15)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--accent-purple)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">On-Time Rate</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">94.5%</p>
            </div>
          </div>
          <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div className="h-full w-[94.5%] bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-primary)] rounded-full" />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">+2.3% from last week</p>
        </div>
      </div>
    </div>
  );
}
