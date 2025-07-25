'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { SessionProvider } from 'next-auth/react'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  // Si estamos en /login o /admin, no mostrar la navbar
  const hideNavbar = pathname === '/login' || pathname.startsWith('/admin');

  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProvider>
          {!hideNavbar && <Navigation />}
          <main className={`min-h-screen bg-gray-50 ${!hideNavbar ? 'pt-16' : ''}`}>
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
} 