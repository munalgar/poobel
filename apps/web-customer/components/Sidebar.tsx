'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Clock,
  Settings,
  MessageSquare,
  Bell,
  Trash2,
  LogOut,
} from 'lucide-react';
import { useCurrentCustomer } from '@poobel/shared-data';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Activity', href: '/activity', icon: Clock },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentCustomer = useCurrentCustomer();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-primary)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Poobel</h1>
            <p className="text-xs text-[var(--text-muted)]">Customer Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-[var(--border-primary)] space-y-1">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all w-full">
          <Bell className="w-5 h-5" />
          <span className="font-medium">Notifications</span>
          <span className="ml-auto bg-[var(--accent-danger)] text-white text-xs px-2 py-0.5 rounded-full">
            2
          </span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-danger)] transition-all w-full">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* User info */}
      {currentCustomer && (
        <div className="p-4 border-t border-[var(--border-primary)]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-info)] flex items-center justify-center text-white font-semibold">
              {currentCustomer.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {currentCustomer.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {currentCustomer.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

