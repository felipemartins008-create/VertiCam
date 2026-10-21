export const Colors = {
  // Backgrounds - High-Tech Deep Slate & Charcoal
  background: '#080C14',      // Deep space navy / black slate
  cardBackground: '#0F1726',  // Elevated tech card background
  cardBorder: '#1E293B',      // Crisp border
  surfaceHighlight: '#1E2D44', // Active / highlighted surface

  // Brand Accents - VertiCam Cyan & Mint Neon
  primary: '#00E5FF',         // Electric Cyan / Neon Blue (matching 'cam' in logo)
  primaryHover: '#00B4D8',    // Deepened Cyan
  primaryGlow: 'rgba(0, 229, 255, 0.22)',
  
  secondary: '#10B981',       // High-Tech Mint / Neon Emerald
  secondaryGlow: 'rgba(16, 185, 129, 0.20)',

  accentCyan: '#00E5FF',      // Electric Cyan
  accentMint: '#10B981',      // Mint Neon
  accentGreen: '#10B981',     // Green / Ready / Success
  accentBlue: '#00B4D8',      // Sky analytical blue
  accentPurple: '#8B5CF6',    // Optional accent

  // Typography
  textPrimary: '#FFFFFF',     // Crisp white
  textSecondary: '#94A3B8',   // Slate 400 for secondary text
  textMuted: '#64748B',       // Slate 500 for captions / placeholders

  // System
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  black: '#000000',
  white: '#FFFFFF',

  // Gradients (Linear gradient arrays)
  gradientHero: ['#080C14', '#0F1726', '#080C14'] as const,
  gradientAccent: ['#00E5FF', '#10B981'] as const, // VertiCam signature Cyan-to-Mint gradient
  gradientCard: ['#0F1726', '#080C14'] as const,
  gradientCyan: ['#00E5FF', '#00B4D8'] as const,
  gradientMint: ['#2DD4BF', '#10B981'] as const,
  gradientGold: ['#FBBF24', '#D97706'] as const,
};
