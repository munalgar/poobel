// CSS Variables as TypeScript constants for type-safety
export const cssVars = {
  // Backgrounds
  bgPrimary: 'var(--bg-primary)',
  bgSecondary: 'var(--bg-secondary)',
  bgTertiary: 'var(--bg-tertiary)',
  bgHover: 'var(--bg-hover)',

  // Borders
  borderPrimary: 'var(--border-primary)',
  borderSecondary: 'var(--border-secondary)',

  // Text
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',

  // Accents
  accentPrimary: 'var(--accent-primary)',
  accentSecondary: 'var(--accent-secondary)',
  accentWarning: 'var(--accent-warning)',
  accentDanger: 'var(--accent-danger)',
  accentInfo: 'var(--accent-info)',
  accentPurple: 'var(--accent-purple)',
} as const;

// Raw color values for programmatic use
export const colors = {
  bgPrimary: '#0a0a0f',
  bgSecondary: '#12121a',
  bgTertiary: '#1a1a24',
  bgHover: '#22222e',
  borderPrimary: '#2a2a36',
  borderSecondary: '#3a3a48',
  textPrimary: '#f5f5f7',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  accentPrimary: '#22c55e',
  accentSecondary: '#16a34a',
  accentWarning: '#f59e0b',
  accentDanger: '#ef4444',
  accentInfo: '#3b82f6',
  accentPurple: '#a855f7',
} as const;

// Status colors mapped to semantic names
export const statusColors = {
  en_route: colors.accentInfo,
  at_stop: colors.accentWarning,
  completed: colors.accentPrimary,
  available: colors.accentPurple,
  offline: colors.textMuted,
  pending: colors.textMuted,
  in_progress: colors.accentWarning,
  skipped: colors.accentDanger,
  problematic: colors.accentDanger,
} as const;

export type StatusType = keyof typeof statusColors;

