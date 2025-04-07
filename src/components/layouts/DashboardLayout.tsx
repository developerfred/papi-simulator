'use client'

import React, { ReactNode } from 'react'
import ThemeToggle from '../ui/ThemeToggle'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  description?: string
}

export default function DashboardLayout({ 
  children,
  title,
  description
}: DashboardLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="text-sm opacity-70">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://papi.how/getting-started/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-primary-400 transition-colors"
            >
              Documentation
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 p-4 text-sm">
        <div className="container mx-auto flex justify-between">
          <span>Polkadot API Playground</span>
          <div className="flex gap-4">
            <a 
              href="https://github.com/polkadot-api/polkadot-api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              GitHub
            </a>
            <a 
              href="https://polkadot.network/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Polkadot
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}