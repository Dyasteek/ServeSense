'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  HomeIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  TrophyIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import BackupButton from './BackupButton';

const navigation = [
  { name: 'Inicio', href: '/', icon: HomeIcon },
  { name: 'Mi Equipo', href: '/team', icon: UserGroupIcon },
  { name: 'Estadísticas', href: '/stats', icon: ChartBarIcon },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo y enlaces principales */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              ServeSense
            </Link>
            {status === 'authenticated' && (
              <div className="hidden md:flex items-center ml-8 space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                ))}
                {/* Botón Dashboard solo para admin */}
                {session?.user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/admin'
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Botones de autenticación */}
          <div className="hidden md:flex items-center">
            {status === 'authenticated' ? (
              <div className="flex items-center gap-3">
                <span className="hidden md:inline text-gray-700 font-medium max-w-xs truncate" title={session?.user?.name ?? ''}>{session?.user?.name ?? ''}</span>
                <BackupButton />
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                  title="Cerrar sesión"
                >
                  <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Botón de menú móvil */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isOpen && status === 'authenticated' && (
        <div className="md:hidden bg-white shadow-lg z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
            {/* Botón Dashboard solo para admin en móvil */}
            {session?.user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/admin'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
            )}
            {status === 'authenticated' && (
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-gray-700 font-medium max-w-xs truncate" title={session?.user?.name ?? ''}>{session?.user?.name ?? ''}</span>
                <BackupButton />
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 