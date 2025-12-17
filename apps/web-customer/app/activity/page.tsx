'use client';

import { useState } from 'react';
import { usePoobelStore, useCurrentCustomer, useCustomerNotifications } from '@poobel/shared-data';
import {
  Clock,
  Bell,
  CheckCircle,
  AlertCircle,
  Car,
  RotateCw,
  MessageSquare,
} from 'lucide-react';

type TabType = 'history' | 'notifications';

export default function ActivityPage() {
  const currentCustomer = useCurrentCustomer();
  const notifications = currentCustomer
    ? useCustomerNotifications(currentCustomer.id)
    : [];
  const stops = usePoobelStore((state) => state.stops);
  const drivers = usePoobelStore((state) => state.drivers);
  const markNotificationRead = usePoobelStore((state) => state.markNotificationRead);
  const [activeTab, setActiveTab] = useState<TabType>('history');

  const customerStops = stops.filter((s) => s.customerId === currentCustomer?.id);
  const completedStops = customerStops.filter((s) => s.status === 'completed');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approaching':
        return { icon: Car, color: 'var(--accent-info)' };
      case 'completed':
        return { icon: CheckCircle, color: 'var(--accent-primary)' };
      case 'delayed':
        return { icon: Clock, color: 'var(--accent-warning)' };
      case 'route_change':
        return { icon: RotateCw, color: 'var(--accent-purple)' };
      case 'message':
        return { icon: MessageSquare, color: 'var(--accent-info)' };
      default:
        return { icon: Bell, color: 'var(--text-muted)' };
    }
  };

  if (!currentCustomer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Not Logged In</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Activity</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Your service history and notifications
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-[var(--accent-primary)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
          onClick={() => setActiveTab('history')}
        >
          <Clock className="w-5 h-5" />
          Service History
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'notifications'
              ? 'bg-[var(--accent-primary)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell className="w-5 h-5" />
          Notifications
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="bg-[var(--accent-danger)] text-white text-xs px-2 py-0.5 rounded-full">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'history' ? (
        <div className="space-y-4">
          {completedStops.length > 0 ? (
            completedStops.map((stop, index) => (
              <div
                key={stop.id}
                className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 animate-fade-in card-hover"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-[var(--accent-primary)]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">
                          Pickup Completed
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          {stop.address}
                        </p>
                      </div>
                      <span className="text-sm text-[var(--text-muted)]">
                        {stop.actualTime || stop.scheduledTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="badge badge-success">{stop.serviceType}</span>
                      <span className="text-sm text-[var(--text-muted)]">
                        Driver: {drivers[0]?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-12 text-center">
              <Clock className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                No Service History
              </h3>
              <p className="text-[var(--text-muted)] mt-2">
                Your completed pickups will appear here
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((notification, index) => {
                const { icon: Icon, color } = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`bg-[var(--bg-secondary)] border rounded-xl p-6 cursor-pointer transition-all animate-fade-in ${
                      !notification.read
                        ? 'border-[var(--accent-primary)]/30 bg-[rgba(34,197,94,0.05)]'
                        : 'border-[var(--border-primary)]'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[var(--text-primary)]">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                              )}
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-sm text-[var(--text-muted)]">
                            {new Date(notification.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-12 text-center">
              <Bell className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                No Notifications
              </h3>
              <p className="text-[var(--text-muted)] mt-2">
                You'll be notified about your service here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

