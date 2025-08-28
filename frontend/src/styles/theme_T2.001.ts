// Theme tokens - T2.001
// Centraliza tokens de tema para white-label (cores, espaçamentos, tipografia, bordas)
// Observação: Para Tailwind v4, preferimos CSS Variables em globals.css e utilizamos estes tokens como fonte única de verdade
// para compor estilos em componentes JS/TS quando necessário.

export const themeTokens = {
  colors: {
    primary: {
      DEFAULT: '#0EA5E9', // sky-500
      foreground: '#FFFFFF',
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#0EA5E9',
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
    },
    secondary: {
      DEFAULT: '#A78BFA', // violet-400
      foreground: '#111827',
    },
    success: {
      DEFAULT: '#22C55E', // green-500
      foreground: '#052e16',
    },
    warning: {
      DEFAULT: '#F59E0B', // amber-500
      foreground: '#111827',
    },
    danger: {
      DEFAULT: '#EF4444', // red-500
      foreground: '#FEF2F2',
    },
    background: '#0a0a0a',
    foreground: '#ededed',
    muted: '#9CA3AF',
    border: '#e5e7eb',
  },
  radius: {
    none: '0px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    full: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  typography: {
    fontFamilySans: 'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    fontFamilyMono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    baseSize: '16px',
  },
} as const

export type ThemeTokens = typeof themeTokens

export function applyThemeToDocument(tokens: ThemeTokens = themeTokens) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--background', tokens.colors.background)
  root.style.setProperty('--foreground', tokens.colors.foreground)
  root.style.setProperty('--radius-md', tokens.radius.md)
  root.style.setProperty('--radius-lg', tokens.radius.lg)
  root.style.setProperty('--radius-full', tokens.radius.full)
}

