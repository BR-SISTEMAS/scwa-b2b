"use client"

import React from "react"

interface LayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
}

export default function Layout_T2_003({ 
  children, 
  showHeader = true,
  showFooter = false 
}: LayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      {showHeader && (
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Support Chat B2B</h1>
            </div>
            <nav className="flex items-center gap-6">
              <button 
                className="text-sm font-medium hover:text-primary transition-colors"
                aria-label="Toggle theme"
              >
                🌓
              </button>
            </nav>
          </div>
        </header>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && (
        <footer className="border-t border-border bg-muted/10">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            © 2025 Support Chat B2B - Todos os direitos reservados
          </div>
        </footer>
      )}
    </div>
  )
}
