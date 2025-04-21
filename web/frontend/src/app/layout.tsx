'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProvider>
          <Navigation />
          <main className="min-h-screen bg-gray-50 pt-16">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
} 