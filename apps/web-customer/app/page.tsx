'use client';

import { useState } from 'react';
import { usePoobelStore, useCurrentCustomer, useCustomerNotifications } from '@poobel/shared-data';
import { TrackingMap } from '../components/TrackingMap';
import {
  MapPin,
  Clock,
  Star,
  Phone,
  MessageSquare,
  Calendar,
  Truck,
  CheckCircle,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const currentCustomer = useCurrentCustomer();
  const notifications = currentCustomer
    ? useCustomerNotifications(currentCustomer.id)
    : [];
  const drivers = usePoobelStore((state) => state.drivers);
  const stops = usePoobelStore((state) => state.stops);
  const addReview = usePoobelStore((state) => state.addReview);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const assignedDriver = drivers.find((d) => d.id === currentCustomer?.assignedDriverId);

  const activeStop = stops.find(
    (s) =>
      s.customerId === currentCustomer?.id &&
      (s.status === 'pending' || s.status === 'in_progress')
  );

  const completedStop = stops.find(
    (s) => s.customerId === currentCustomer?.id && s.status === 'completed'
  );

  const handleSubmitReview = () => {
    if (reviewRating === 0 || !currentCustomer || !assignedDriver || !completedStop) return;

    addReview({
      customerId: currentCustomer.id,
      driverId: assignedDriver.id,
      stopId: completedStop.id,
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
    });

    setShowReviewModal(false);
    setReviewRating(0);
    setReviewComment('');
  };

  const getETA = () => {
    if (!activeStop) return null;
    const [hours, minutes] = activeStop.scheduledTime.split(':').map(Number);
    const eta = new Date();
    eta.setHours(hours, minutes);
    return eta;
  };

  const eta = getETA();

  if (!currentCustomer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Not Logged In</h2>
          <p className="text-[var(--text-muted)] mt-2">Please sign in to access your account</p>
          <button className="btn-primary mt-4 px-8 py-3">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Welcome back, {currentCustomer.name.split(' ')[0]}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Track your service and manage your account
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking Card */}
          {activeStop && assignedDriver ? (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-[var(--border-primary)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-info)] flex items-center justify-center text-white text-xl font-bold">
                      {assignedDriver.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        {assignedDriver.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-[var(--accent-warning)] fill-[var(--accent-warning)]" />
                          <span className="text-sm text-[var(--text-secondary)]">
                            {assignedDriver.rating}
                          </span>
                        </div>
                        <span className="text-[var(--text-muted)]">•</span>
                        <span className="text-sm text-[var(--text-muted)]">
                          {assignedDriver.vehiclePlate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-secondary p-3 rounded-full">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="btn-secondary p-3 rounded-full">
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Tracking Map */}
              <div className="h-72 relative overflow-hidden">
                <TrackingMap
                  customerLocation={currentCustomer.coordinates}
                  customerAddress={currentCustomer.address}
                  driver={assignedDriver}
                  showDriver={true}
                />
              </div>

              {/* ETA */}
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Estimated Arrival</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {eta?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      assignedDriver.status === 'en_route'
                        ? 'bg-[var(--accent-info)] animate-pulse-dot'
                        : assignedDriver.status === 'at_stop'
                        ? 'bg-[var(--accent-warning)]'
                        : 'bg-[var(--text-muted)]'
                    }`}
                  />
                  <span className="text-[var(--text-secondary)]">
                    {assignedDriver.status === 'en_route'
                      ? 'Driver is on the way'
                      : assignedDriver.status === 'at_stop'
                      ? 'At previous stop'
                      : 'Scheduled'}
                  </span>
                </div>
              </div>
            </div>
          ) : completedStop ? (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-8 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-[rgba(34,197,94,0.15)] flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                Pickup Completed!
              </h3>
              <p className="text-[var(--text-muted)] mt-2">
                Your waste was collected at {completedStop.actualTime}
              </p>
              <button
                className="btn-primary mt-6 px-8 py-3 inline-flex items-center gap-2"
                onClick={() => setShowReviewModal(true)}
              >
                <Star className="w-5 h-5" />
                Rate Your Driver
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-8 text-center">
              <Calendar className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                No Upcoming Service
              </h3>
              <p className="text-[var(--text-muted)] mt-2">
                Your next pickup is scheduled for {currentCustomer.nextPickupDate}
              </p>
            </div>
          )}

          {/* Service Details */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Your Service
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-muted)]">Service Address</p>
                  <p className="text-[var(--text-primary)]">{currentCustomer.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.15)] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[var(--accent-info)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-muted)]">Schedule</p>
                  <p className="text-[var(--text-primary)]">
                    {currentCustomer.scheduleDays.join(' & ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-[rgba(168,85,247,0.15)] flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-[var(--accent-purple)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-muted)]">Bin Location</p>
                  <p className="text-[var(--text-primary)]">{currentCustomer.binLocation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary flex items-center gap-3 px-4 py-3 text-left">
                <Calendar className="w-5 h-5 text-[var(--accent-info)]" />
                Reschedule Pickup
              </button>
              <button className="w-full btn-secondary flex items-center gap-3 px-4 py-3 text-left">
                <AlertCircle className="w-5 h-5 text-[var(--accent-warning)]" />
                Hold Service
              </button>
              <Link
                href="/chat"
                className="w-full btn-secondary flex items-center gap-3 px-4 py-3 text-left"
              >
                <MessageSquare className="w-5 h-5 text-[var(--accent-primary)]" />
                AI Assistant
              </Link>
              <button className="w-full btn-secondary flex items-center gap-3 px-4 py-3 text-left">
                <Phone className="w-5 h-5 text-[var(--accent-purple)]" />
                Contact Support
              </button>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Notifications
              </h3>
              <Link href="/activity" className="text-sm text-[var(--accent-primary)]">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg ${
                      !notif.read
                        ? 'bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)]'
                        : 'bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {notif.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-[var(--text-muted)] py-4">No notifications</p>
              )}
            </div>
          </div>

          {/* Next Pickup */}
          <div className="bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-xl p-6 text-white">
            <p className="text-sm opacity-80">Next Scheduled Pickup</p>
            <p className="text-2xl font-bold mt-1">{currentCustomer.nextPickupDate}</p>
            <p className="text-sm opacity-80 mt-2">
              {currentCustomer.scheduleDays[0]} Morning
            </p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-[var(--text-primary)] text-center mb-6">
              Rate Your Driver
            </h3>

            {assignedDriver && (
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-info)] flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                  {assignedDriver.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <p className="font-medium text-[var(--text-primary)]">{assignedDriver.name}</p>
              </div>
            )}

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= reviewRating
                        ? 'text-[var(--accent-warning)] fill-[var(--accent-warning)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Add a comment (optional)..."
              className="w-full h-24 resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1 py-3"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary flex-1 py-3"
                onClick={handleSubmitReview}
                disabled={reviewRating === 0}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
