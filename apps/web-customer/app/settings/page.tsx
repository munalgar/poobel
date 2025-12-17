'use client';

import { usePoobelStore, useCurrentCustomer } from '@poobel/shared-data';
import {
  User,
  MapPin,
  Calendar,
  Bell,
  Mail,
  Phone,
  CreditCard,
  HelpCircle,
  FileText,
  RefreshCw,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';

export default function SettingsPage() {
  const currentCustomer = useCurrentCustomer();
  const resetData = usePoobelStore((state) => state.resetData);

  if (!currentCustomer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Not Logged In</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-info)] flex items-center justify-center text-white text-2xl font-bold">
            {currentCustomer.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {currentCustomer.name}
            </h2>
            <p className="text-[var(--text-secondary)]">{currentCustomer.email}</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">{currentCustomer.phone}</p>
          </div>
          <button className="btn-secondary">Edit Profile</button>
        </div>
      </div>

      {/* Service Settings */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Service Settings
        </h3>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl divide-y divide-[var(--border-primary)]">
          <button className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-[var(--text-primary)]">Service Address</p>
              <p className="text-sm text-[var(--text-muted)]">{currentCustomer.address}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <button className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.15)] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[var(--accent-info)]" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-[var(--text-primary)]">Collection Schedule</p>
              <p className="text-sm text-[var(--text-muted)]">
                {currentCustomer.scheduleDays.join(' & ')}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <button className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[rgba(168,85,247,0.15)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[var(--accent-purple)]" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-[var(--text-primary)]">Service Type</p>
              <p className="text-sm text-[var(--text-muted)] capitalize">
                {currentCustomer.serviceType}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Notifications
        </h3>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl divide-y divide-[var(--border-primary)]">
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.15)] flex items-center justify-center">
              <Bell className="w-5 h-5 text-[var(--accent-info)]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)]">Push Notifications</p>
              <p className="text-sm text-[var(--text-muted)]">Get alerts about your service</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
            </label>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-lg bg-[rgba(245,158,11,0.15)] flex items-center justify-center">
              <Mail className="w-5 h-5 text-[var(--accent-warning)]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)]">Email Notifications</p>
              <p className="text-sm text-[var(--text-muted)]">Service updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
            </label>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
              <Phone className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)]">SMS Notifications</p>
              <p className="text-sm text-[var(--text-muted)]">Text alerts when driver is near</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Support
        </h3>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl divide-y divide-[var(--border-primary)]">
          <button className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <span className="font-medium text-[var(--text-primary)]">Help Center</span>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] ml-auto" />
          </button>
          <button className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.15)] flex items-center justify-center">
              <Phone className="w-5 h-5 text-[var(--accent-info)]" />
            </div>
            <span className="font-medium text-[var(--text-primary)]">Contact Support</span>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] ml-auto" />
          </button>
          <button className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[rgba(245,158,11,0.15)] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--accent-warning)]" />
            </div>
            <span className="font-medium text-[var(--text-primary)]">Terms of Service</span>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] ml-auto" />
          </button>
        </div>
      </div>

      {/* Demo & Account */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Demo
        </h3>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl divide-y divide-[var(--border-primary)]">
          <button
            onClick={resetData}
            className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-[rgba(239,68,68,0.15)] flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[var(--accent-danger)]" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-[var(--accent-danger)]">Reset Demo Data</p>
              <p className="text-sm text-[var(--text-muted)]">
                Restore all mock data to initial state
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <button className="w-full flex items-center justify-center gap-2 p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--accent-danger)]">
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </button>

      {/* Version */}
      <p className="text-center text-sm text-[var(--text-muted)] mt-6">
        Poobel Customer Portal v1.0.0 • Demo Mode
      </p>
    </div>
  );
}

