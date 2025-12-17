# Poobel - Waste Collection Management System

A comprehensive demo of a waste collection management system with three interconnected applications that share real-time data synchronization.

## 🏗️ Architecture

- **Turborepo** - Monorepo management
- **pnpm** - Package manager
- **Next.js** - Web applications (Dispatch Dashboard, Customer Portal)
- **React Native + Expo** - Mobile applications (Driver App, Customer App)
- **Zustand** - State management with localStorage persistence

## 📦 Applications

### 1. Dispatch Dashboard (`apps/web-dispatch`)
The operational command center for managing waste collection operations.

**Features:**
- Real-time fleet tracking with map view
- Route management (add/remove stops dynamically)
- Driver profiles with ratings and performance metrics
- Performance analytics with charts
- Direct messaging with drivers
- Alert system for route issues

**Pages:** Dashboard, Map, Drivers, Routes, Analytics, Messages

### 2. Driver Mobile App (`apps/expo-driver`)
Mobile application for waste collection drivers.

**Features:**
- Turn-by-turn navigation to stops
- Stop sequence with customer notes
- Mark stops as completed/skipped/problematic
- Real-time route updates from dispatch
- Performance feedback and ratings
- Messaging with dispatch and customers

**Pages:** Home, Schedule, Ratings, Messages, Settings

### 3. Customer Mobile App (`apps/expo-customer`)
Mobile application for customers to track their service.

**Features:**
- Live driver tracking with ETA
- Service notifications
- Service history
- Rate drivers after completion
- AI chat assistant
- Schedule management

**Pages:** Home, Activity, Settings, AI Chat, Review

### 4. Customer Web Portal (`apps/web-customer`)
Web portal for customers to manage their service.

**Features:**
- Same features as mobile app
- AI chat assistant
- Service settings management

**Pages:** Home, Activity, AI Chat, Settings

## 🔗 Shared Data Package (`packages/shared-data`)

Contains:
- TypeScript types for all entities
- Mock data for demo
- Zustand store with actions for real-time sync
- All apps share the same state via localStorage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install
```

### Running the Demo

**Run all web apps:**
```bash
pnpm dev:web
```

**Run individual apps:**
```bash
# Dispatch Dashboard (http://localhost:3000)
pnpm dev:dispatch

# Customer Web Portal (http://localhost:3001)
pnpm dev:customer-web

# Driver Mobile App (Expo)
cd apps/expo-driver && pnpm start

# Customer Mobile App (Expo)
cd apps/expo-customer && pnpm start
```

## 🎯 Demo Flow

The demo showcases the complete workflow:

1. **Dispatch adds a stop** → Routes page → Add Stop button
2. **Driver sees new stop** → Home page shows updated route
3. **Driver completes stop** → Complete button → Customer notified
4. **Customer reviews driver** → Rate Your Driver modal
5. **Review appears** → Dispatch Drivers page & Driver Ratings page

### Testing Real-Time Sync

1. Open Dispatch Dashboard in one browser tab
2. Open Customer Portal in another browser tab
3. In Dispatch, go to Routes and add a new stop
4. Customer sees notification about the new pickup
5. In Driver app (or simulate), complete the stop
6. Customer gets completion notification and can leave review
7. Review appears in Dispatch drivers page

## 🎨 Design System

- Dark theme with green accent (#22c55e)
- Consistent color variables across all apps
- Responsive layouts
- Smooth animations and transitions

## 📁 Project Structure

```
poobel/
├── apps/
│   ├── web-dispatch/     # Next.js - Dispatch Dashboard
│   ├── web-customer/     # Next.js - Customer Portal
│   ├── expo-driver/      # Expo - Driver App
│   └── expo-customer/    # Expo - Customer App
├── packages/
│   ├── shared-data/      # Types, mock data, Zustand store
│   ├── eslint-config/    # Shared ESLint config
│   ├── typescript-config/ # Shared TS config
│   └── ui/               # Shared UI components
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 🔧 Technologies

- **Frontend:** React 19, Next.js 16, React Native 0.81
- **State:** Zustand with persist middleware
- **Styling:** Tailwind CSS (web), StyleSheet (mobile)
- **Charts:** Recharts
- **Icons:** Lucide React (web), Expo Vector Icons (mobile)
- **Build:** Turborepo, TypeScript 5.9
