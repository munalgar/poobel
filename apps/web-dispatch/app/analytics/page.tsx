'use client';

import { usePoobelStore, mockPerformanceMetrics } from '@poobel/shared-data';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  MapPin,
  Star,
} from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];

function StatCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  change?: number;
  positive?: boolean;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">{title}</p>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {positive ? (
                <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[var(--accent-danger)]" />
              )}
              <span
                className={`text-sm font-medium ${
                  positive ? 'text-[var(--accent-primary)]' : 'text-[var(--accent-danger)]'
                }`}
              >
                {positive ? '+' : ''}{change}%
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

export default function AnalyticsPage() {
  const drivers = usePoobelStore((state) => state.drivers);
  const stops = usePoobelStore((state) => state.stops);
  const reviews = usePoobelStore((state) => state.reviews);

  const totalStops = stops.length;
  const completedStops = stops.filter((s) => s.status === 'completed').length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 'N/A';

  const performanceData = mockPerformanceMetrics;

  // Service type distribution
  const serviceTypeData = [
    { name: 'Residential', value: stops.filter((s) => s.serviceType === 'residential').length },
    { name: 'Commercial', value: stops.filter((s) => s.serviceType === 'commercial').length },
    { name: 'Recycling', value: stops.filter((s) => s.serviceType === 'recycling').length },
    { name: 'Bulk', value: stops.filter((s) => s.serviceType === 'bulk').length },
  ].filter((d) => d.value > 0);

  // Driver performance data
  const driverPerformanceData = drivers.map((d) => ({
    name: d.name.split(' ')[0],
    onTime: d.onTimeRate,
    completed: d.completedStops,
    rating: d.rating,
  }));

  // Rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating}★`,
    count: reviews.filter((r) => r.rating === rating).length,
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Analytics</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Performance metrics and operational insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Stops Today"
          value={totalStops}
          change={8}
          positive={true}
          icon={MapPin}
          color="var(--accent-primary)"
        />
        <StatCard
          title="Completion Rate"
          value={`${totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0}%`}
          change={2.3}
          positive={true}
          icon={CheckCircle}
          color="var(--accent-info)"
        />
        <StatCard
          title="Avg. Completion Time"
          value="4.2 min"
          change={-5}
          positive={true}
          icon={Clock}
          color="var(--accent-warning)"
        />
        <StatCard
          title="Avg. Rating"
          value={avgRating}
          icon={Star}
          color="var(--accent-purple)"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Performance */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Weekly Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorStops" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="completedStops"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStops)"
                  name="Completed Stops"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* On-Time Rate Trend */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">On-Time Rate Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[85, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="onTimeRate"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  name="On-Time %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Type Distribution */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Service Type Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {serviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {serviceTypeData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-[var(--text-secondary)]">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Performance Comparison */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Driver On-Time Rate</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driverPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} domain={[80, 100]} />
                <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="onTime" fill="#a855f7" radius={[0, 4, 4, 0]} name="On-Time %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Rating Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis dataKey="rating" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Reviews" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Top Performers</h3>
          <div className="space-y-4">
            {drivers
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 4)
              .map((driver, index) => (
                <div key={driver.id} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'bg-[var(--accent-warning)] text-black'
                        : index === 1
                        ? 'bg-gray-400 text-black'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{driver.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{driver.completedStops} stops</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-[var(--accent-warning)] fill-[var(--accent-warning)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">{driver.rating}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Quick Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-sm font-medium text-[var(--accent-primary)]">Performance Up</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                On-time rate improved by 2.3% this week
              </p>
            </div>
            <div className="p-4 bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-[var(--accent-info)]" />
                <span className="text-sm font-medium text-[var(--accent-info)]">Fleet Efficiency</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                87% fleet utilization rate today
              </p>
            </div>
            <div className="p-4 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-[var(--accent-warning)]" />
                <span className="text-sm font-medium text-[var(--accent-warning)]">Attention</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Route 3 showing higher than average delays
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

