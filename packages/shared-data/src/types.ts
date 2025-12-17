// Core Types for Poobel System

export type DriverStatus = 'available' | 'en_route' | 'at_stop' | 'completed' | 'offline';
export type StopStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'problematic';
export type ServiceType = 'residential' | 'commercial' | 'recycling' | 'bulk';
export type NotificationType = 'approaching' | 'completed' | 'delayed' | 'route_change' | 'message';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  vehicleId: string;
  vehiclePlate: string;
  status: DriverStatus;
  currentLocation: Coordinates;
  rating: number;
  totalRatings: number;
  completedStops: number;
  totalStops: number;
  onTimeRate: number;
  earlyCount: number;
  lateCount: number;
  missedCount: number;
}

export interface Stop {
  id: string;
  routeId: string;
  customerId: string;
  address: string;
  coordinates: Coordinates;
  scheduledTime: string;
  actualTime?: string;
  status: StopStatus;
  serviceType: ServiceType;
  notes?: string;
  binLocation?: string;
  accessCode?: string;
  photoUrl?: string;
  issueNote?: string;
  sequence: number;
}

export interface Route {
  id: string;
  name: string;
  driverId: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  stops: Stop[];
  totalDistance: number;
  estimatedDuration: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  coordinates: Coordinates;
  serviceType: ServiceType;
  binLocation: string;
  accessCode?: string;
  notes?: string;
  scheduleDays: string[];
  nextPickupDate: string;
  assignedDriverId?: string;
}

export interface Review {
  id: string;
  customerId: string;
  driverId: string;
  stopId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderType: 'dispatch' | 'driver' | 'customer';
  receiverId: string;
  receiverType: 'dispatch' | 'driver' | 'customer';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, unknown>;
}

export interface Alert {
  id: string;
  type: 'deviation' | 'delay' | 'missed' | 'incident' | 'info';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  driverId?: string;
  routeId?: string;
  timestamp: string;
  resolved: boolean;
}

export interface ChatThread {
  id: string;
  customerId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PerformanceMetrics {
  date: string;
  completedStops: number;
  totalStops: number;
  onTimeRate: number;
  avgCompletionTime: number;
  distance: number;
}

