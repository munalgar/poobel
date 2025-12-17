import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Driver,
  Customer,
  Route,
  Stop,
  Review,
  Message,
  Notification,
  Alert,
  ChatThread,
  StopStatus,
  DriverStatus,
} from './types';
import {
  mockDrivers,
  mockCustomers,
  mockRoutes,
  mockStops,
  mockReviews,
  mockMessages,
  mockNotifications,
  mockAlerts,
  mockChatThreads,
  generateId,
} from './mock-data';

interface PoobelState {
  // Data
  drivers: Driver[];
  customers: Customer[];
  routes: Route[];
  stops: Stop[];
  reviews: Review[];
  messages: Message[];
  notifications: Notification[];
  alerts: Alert[];
  chatThreads: ChatThread[];

  // Current user context (for demo switching)
  currentDriverId: string | null;
  currentCustomerId: string | null;

  // Actions - Stops
  addStop: (stop: Omit<Stop, 'id'>) => Stop;
  removeStop: (stopId: string) => void;
  updateStopStatus: (stopId: string, status: StopStatus, notes?: string) => void;
  completeStop: (stopId: string, photoUrl?: string) => void;

  // Actions - Drivers
  updateDriverStatus: (driverId: string, status: DriverStatus) => void;
  updateDriverLocation: (driverId: string, lat: number, lng: number) => void;

  // Actions - Reviews
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Review;

  // Actions - Messages
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => Message;
  markMessageRead: (messageId: string) => void;

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Notification;
  markNotificationRead: (notificationId: string) => void;

  // Actions - Alerts
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>) => Alert;
  resolveAlert: (alertId: string) => void;

  // Actions - Chat
  createChatThread: (customerId: string, title: string) => ChatThread;
  addChatMessage: (threadId: string, role: 'user' | 'assistant', content: string) => void;

  // Actions - Routes
  assignRoute: (routeId: string, driverId: string) => void;
  updateRouteStatus: (routeId: string, status: Route['status']) => void;

  // Context setters
  setCurrentDriver: (driverId: string | null) => void;
  setCurrentCustomer: (customerId: string | null) => void;

  // Reset to mock data
  resetData: () => void;
}

export const usePoobelStore = create<PoobelState>()(
  persist(
    (set, get) => ({
      // Initial data from mocks
      drivers: mockDrivers,
      customers: mockCustomers,
      routes: mockRoutes,
      stops: mockStops,
      reviews: mockReviews,
      messages: mockMessages,
      notifications: mockNotifications,
      alerts: mockAlerts,
      chatThreads: mockChatThreads,
      currentDriverId: 'driver-1',
      currentCustomerId: 'customer-2',

      // Stop actions
      addStop: (stopData) => {
        const stop: Stop = {
          ...stopData,
          id: `stop-${generateId()}`,
        };
        set((state) => ({
          stops: [...state.stops, stop],
          routes: state.routes.map((route) =>
            route.id === stop.routeId
              ? { ...route, stops: [...route.stops, stop] }
              : route
          ),
        }));

        // Add notification for the customer
        const customer = get().customers.find((c) => c.id === stopData.customerId);
        if (customer) {
          get().addNotification({
            userId: customer.id,
            type: 'route_change',
            title: 'New Pickup Added',
            message: `A new pickup has been scheduled at your address`,
          });
        }

        // Add message for the driver
        const route = get().routes.find((r) => r.id === stopData.routeId);
        if (route) {
          get().sendMessage({
            senderId: 'dispatch',
            senderType: 'dispatch',
            receiverId: route.driverId,
            receiverType: 'driver',
            content: `New stop added to your route: ${stopData.address}`,
          });
        }

        return stop;
      },

      removeStop: (stopId) => {
        const stop = get().stops.find((s) => s.id === stopId);
        if (!stop) return;

        set((state) => ({
          stops: state.stops.filter((s) => s.id !== stopId),
          routes: state.routes.map((route) =>
            route.id === stop.routeId
              ? { ...route, stops: route.stops.filter((s) => s.id !== stopId) }
              : route
          ),
        }));

        // Notify driver
        const route = get().routes.find((r) => r.id === stop.routeId);
        if (route) {
          get().sendMessage({
            senderId: 'dispatch',
            senderType: 'dispatch',
            receiverId: route.driverId,
            receiverType: 'driver',
            content: `Stop removed from your route: ${stop.address}`,
          });
        }
      },

      updateStopStatus: (stopId, status, notes) => {
        set((state) => ({
          stops: state.stops.map((stop) =>
            stop.id === stopId
              ? { ...stop, status, issueNote: notes || stop.issueNote }
              : stop
          ),
          routes: state.routes.map((route) => ({
            ...route,
            stops: route.stops.map((stop) =>
              stop.id === stopId
                ? { ...stop, status, issueNote: notes || stop.issueNote }
                : stop
            ),
          })),
        }));
      },

      completeStop: (stopId, photoUrl) => {
        const stop = get().stops.find((s) => s.id === stopId);
        if (!stop) return;

        const actualTime = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        set((state) => ({
          stops: state.stops.map((s) =>
            s.id === stopId
              ? { ...s, status: 'completed' as StopStatus, actualTime, photoUrl }
              : s
          ),
          routes: state.routes.map((route) => ({
            ...route,
            stops: route.stops.map((s) =>
              s.id === stopId
                ? { ...s, status: 'completed' as StopStatus, actualTime, photoUrl }
                : s
            ),
          })),
        }));

        // Update driver stats
        const route = get().routes.find((r) => r.id === stop.routeId);
        if (route) {
          set((state) => ({
            drivers: state.drivers.map((driver) =>
              driver.id === route.driverId
                ? { ...driver, completedStops: driver.completedStops + 1 }
                : driver
            ),
          }));
        }

        // Notify customer
        get().addNotification({
          userId: stop.customerId,
          type: 'completed',
          title: 'Pickup Completed',
          message: `Your waste pickup at ${stop.address} has been completed`,
          data: { stopId, canReview: true },
        });
      },

      // Driver actions
      updateDriverStatus: (driverId, status) => {
        set((state) => ({
          drivers: state.drivers.map((driver) =>
            driver.id === driverId ? { ...driver, status } : driver
          ),
        }));
      },

      updateDriverLocation: (driverId, lat, lng) => {
        set((state) => ({
          drivers: state.drivers.map((driver) =>
            driver.id === driverId
              ? { ...driver, currentLocation: { lat, lng } }
              : driver
          ),
        }));
      },

      // Review actions
      addReview: (reviewData) => {
        const review: Review = {
          ...reviewData,
          id: `review-${generateId()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          // Update driver rating
          const existingReviews = state.reviews.filter(
            (r) => r.driverId === review.driverId
          );
          const totalRatings = existingReviews.length + 1;
          const avgRating =
            (existingReviews.reduce((sum, r) => sum + r.rating, 0) + review.rating) /
            totalRatings;

          return {
            reviews: [...state.reviews, review],
            drivers: state.drivers.map((driver) =>
              driver.id === review.driverId
                ? {
                    ...driver,
                    rating: Math.round(avgRating * 10) / 10,
                    totalRatings,
                  }
                : driver
            ),
          };
        });
        return review;
      },

      // Message actions
      sendMessage: (messageData) => {
        const message: Message = {
          ...messageData,
          id: `msg-${generateId()}`,
          timestamp: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          messages: [...state.messages, message],
        }));
        return message;
      },

      markMessageRead: (messageId) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, read: true } : msg
          ),
        }));
      },

      // Notification actions
      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notif-${generateId()}`,
          timestamp: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [...state.notifications, notification],
        }));
        return notification;
      },

      markNotificationRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          ),
        }));
      },

      // Alert actions
      addAlert: (alertData) => {
        const alert: Alert = {
          ...alertData,
          id: `alert-${generateId()}`,
          timestamp: new Date().toISOString(),
          resolved: false,
        };
        set((state) => ({
          alerts: [...state.alerts, alert],
        }));
        return alert;
      },

      resolveAlert: (alertId) => {
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, resolved: true } : alert
          ),
        }));
      },

      // Chat actions
      createChatThread: (customerId, title) => {
        const thread: ChatThread = {
          id: `chat-${generateId()}`,
          customerId,
          title,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          chatThreads: [...state.chatThreads, thread],
        }));
        return thread;
      },

      addChatMessage: (threadId, role, content) => {
        set((state) => ({
          chatThreads: state.chatThreads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: [
                    ...thread.messages,
                    {
                      id: `chat-msg-${generateId()}`,
                      role,
                      content,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : thread
          ),
        }));
      },

      // Route actions
      assignRoute: (routeId, driverId) => {
        set((state) => ({
          routes: state.routes.map((route) =>
            route.id === routeId ? { ...route, driverId } : route
          ),
        }));
      },

      updateRouteStatus: (routeId, status) => {
        set((state) => ({
          routes: state.routes.map((route) =>
            route.id === routeId ? { ...route, status } : route
          ),
        }));
      },

      // Context setters
      setCurrentDriver: (driverId) => {
        set({ currentDriverId: driverId });
      },

      setCurrentCustomer: (customerId) => {
        set({ currentCustomerId: customerId });
      },

      // Reset data
      resetData: () => {
        set({
          drivers: mockDrivers,
          customers: mockCustomers,
          routes: mockRoutes,
          stops: mockStops,
          reviews: mockReviews,
          messages: mockMessages,
          notifications: mockNotifications,
          alerts: mockAlerts,
          chatThreads: mockChatThreads,
        });
      },
    }),
    {
      name: 'poobel-storage',
    }
  )
);

// Selector hooks for convenience
export const useDrivers = () => usePoobelStore((state) => state.drivers);
export const useCurrentDriver = () => {
  const driverId = usePoobelStore((state) => state.currentDriverId);
  const drivers = usePoobelStore((state) => state.drivers);
  return drivers.find((d) => d.id === driverId) || null;
};

export const useCurrentCustomer = () => {
  const customerId = usePoobelStore((state) => state.currentCustomerId);
  const customers = usePoobelStore((state) => state.customers);
  return customers.find((c) => c.id === customerId) || null;
};

export const useDriverRoutes = (driverId: string) => {
  const routes = usePoobelStore((state) => state.routes);
  return routes.filter((r) => r.driverId === driverId);
};

export const useCustomerNotifications = (customerId: string) => {
  const notifications = usePoobelStore((state) => state.notifications);
  return notifications.filter((n) => n.userId === customerId);
};

export const useDriverMessages = (driverId: string) => {
  const messages = usePoobelStore((state) => state.messages);
  return messages.filter(
    (m) => m.receiverId === driverId || m.senderId === driverId
  );
};

export const useDriverReviews = (driverId: string) => {
  const reviews = usePoobelStore((state) => state.reviews);
  return reviews.filter((r) => r.driverId === driverId);
};

