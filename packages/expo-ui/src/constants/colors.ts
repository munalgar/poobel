// Shared color palette for Poobel apps
export const BrandColors = {
  primary: '#22c55e',
  primaryDark: '#16a34a',
  secondary: '#3b82f6',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',

  dark: {
    background: '#0a0a0f',
    card: '#12121a',
    cardAlt: '#1a1a24',
    border: '#2a2a36',
    borderSecondary: '#3a3a48',
    text: '#f5f5f7',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
  },

  light: {
    background: '#f5f5f7',
    card: '#ffffff',
    cardAlt: '#f0f0f2',
    border: '#e5e5e7',
    borderSecondary: '#d1d1d6',
    text: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#999999',
  },
};

export const StatusColors: Record<string, string> = {
  en_route: BrandColors.secondary,
  at_stop: BrandColors.warning,
  completed: BrandColors.primary,
  available: BrandColors.purple,
  offline: BrandColors.dark.textMuted,
  pending: BrandColors.dark.textMuted,
  in_progress: BrandColors.warning,
  skipped: BrandColors.danger,
  problematic: BrandColors.danger,
};

