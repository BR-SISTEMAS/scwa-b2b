// Sistema de tema white-label - T2.003
// Permite customização completa do visual da aplicação

export interface WhiteLabelTheme {
  name: string
  logo?: string
  colors: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    muted: string
    mutedForeground: string
    border: string
    input: string
    ring: string
    destructive: string
    destructiveForeground: string
  }
  radius: {
    sm: string
    md: string
    lg: string
  }
  fonts?: {
    sans?: string
    mono?: string
  }
}

// Tema padrão
export const defaultTheme: WhiteLabelTheme = {
  name: "Default",
  colors: {
    primary: "222.2 47.4% 11.2%",
    primaryForeground: "210 40% 98%",
    secondary: "210 40% 96.1%",
    secondaryForeground: "222.2 47.4% 11.2%",
    background: "0 0% 100%",
    foreground: "222.2 47.4% 11.2%",
    card: "0 0% 100%",
    cardForeground: "222.2 47.4% 11.2%",
    popover: "0 0% 100%",
    popoverForeground: "222.2 47.4% 11.2%",
    muted: "210 40% 96.1%",
    mutedForeground: "215.4 16.3% 46.9%",
    border: "214.3 31.8% 91.4%",
    input: "214.3 31.8% 91.4%",
    ring: "222.2 84% 4.9%",
    destructive: "0 84.2% 60.2%",
    destructiveForeground: "210 40% 98%",
  },
  radius: {
    sm: "0.375rem",
    md: "0.625rem", 
    lg: "0.875rem"
  }
}

// Tema dark
export const darkTheme: WhiteLabelTheme = {
  name: "Dark",
  colors: {
    primary: "210 40% 98%",
    primaryForeground: "222.2 47.4% 11.2%",
    secondary: "217.2 32.6% 17.5%",
    secondaryForeground: "210 40% 98%",
    background: "222.2 84% 4.9%",
    foreground: "210 40% 98%",
    card: "222.2 84% 4.9%",
    cardForeground: "210 40% 98%",
    popover: "222.2 84% 4.9%",
    popoverForeground: "210 40% 98%",
    muted: "217.2 32.6% 17.5%",
    mutedForeground: "215 20.2% 65.1%",
    border: "217.2 32.6% 17.5%",
    input: "217.2 32.6% 17.5%",
    ring: "212.7 26.8% 83.9%",
    destructive: "0 62.8% 30.6%",
    destructiveForeground: "210 40% 98%",
  },
  radius: {
    sm: "0.375rem",
    md: "0.625rem",
    lg: "0.875rem"
  }
}

// Exemplo de tema customizado para empresa
export const corporateTheme: WhiteLabelTheme = {
  name: "Corporate Blue",
  colors: {
    primary: "213 94% 20%", // Azul corporativo
    primaryForeground: "0 0% 100%",
    secondary: "214 95% 93%",
    secondaryForeground: "213 94% 20%",
    background: "0 0% 100%",
    foreground: "222 47% 11%",
    card: "0 0% 100%",
    cardForeground: "222 47% 11%",
    popover: "0 0% 100%",
    popoverForeground: "222 47% 11%",
    muted: "210 40% 96%",
    mutedForeground: "215 16% 47%",
    border: "214 32% 91%",
    input: "214 32% 91%",
    ring: "213 94% 20%",
    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 98%",
  },
  radius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem"
  },
  fonts: {
    sans: "Inter, system-ui, sans-serif"
  }
}

// Função para aplicar tema
export function applyWhiteLabelTheme(theme: WhiteLabelTheme) {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  // Aplicar cores
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    root.style.setProperty(cssVar, value)
  })
  
  // Aplicar radius
  Object.entries(theme.radius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value)
  })
  
  // Aplicar fontes se especificadas
  if (theme.fonts?.sans) {
    root.style.setProperty('--font-sans', theme.fonts.sans)
  }
  if (theme.fonts?.mono) {
    root.style.setProperty('--font-mono', theme.fonts.mono)
  }
  
  // Salvar tema no localStorage
  localStorage.setItem('whitelabel-theme', JSON.stringify(theme))
}

// Função para carregar tema salvo
export function loadSavedTheme(): WhiteLabelTheme | null {
  if (typeof window === 'undefined') return null
  
  const saved = localStorage.getItem('whitelabel-theme')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return null
    }
  }
  return null
}
