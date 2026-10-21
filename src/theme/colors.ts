export const Colors = {
  // Backgrounds
  background: '#0F172A',      // Głęboki grafit / ciemny granat (slate-900)
  cardBackground: '#1E293B',  // Grafitowy panel (slate-800)
  cardBorder: '#334155',      // Obramowanie kart (slate-700)
  surfaceHighlight: '#334155',

  // Accents (Sporty Neon / Athletic Energy)
  primary: '#F59E0B',         // Neonowy bursztyn / dynamiczny żółty siatkarski (amber-500)
  primaryHover: '#D97706',
  primaryGlow: 'rgba(245, 158, 11, 0.25)',
  
  secondary: '#EF4444',       // Elektryczny czerwony / sportowy akcent (red-500)
  secondaryGlow: 'rgba(239, 68, 68, 0.2)',

  accentGreen: '#10B981',     // Zielony sukcesu / odnowy (emerald-500)
  accentBlue: '#38BDF8',      // Błękit analityczny (sky-400)

  // Typography
  textPrimary: '#FFFFFF',     // Główny tekst
  textSecondary: '#94A3B8',   // Podtytuły, etykiety (slate-400)
  textMuted: '#64748B',       // Mniej istotne teksty (slate-500)

  // System
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  black: '#000000',
  white: '#FFFFFF',

  // Gradients (Linear gradient arrays)
  gradientHero: ['#0F172A', '#1E293B', '#0F172A'] as const,
  gradientAccent: ['#F59E0B', '#EF4444'] as const,
  gradientCard: ['#1E293B', '#0F172A'] as const,
  gradientGold: ['#FBBF24', '#D97706'] as const,
};
