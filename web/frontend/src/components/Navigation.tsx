'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

const navigation = [
  { name: 'Inicio', href: '/', icon: HomeIcon },
  { name: 'Mi Equipo', href: '/team', icon: UserGroupIcon },
  { name: 'Partidos', href: '/matches', icon: CalendarIcon },
  { name: 'Liga', href: '/league', icon: TrophyIcon },
  { name: 'Estadísticas', href: '/stats', icon: ChartBarIcon },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Eliminar la cookie de autenticación
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
    router.refresh(); // Forzar actualización de la página
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo y enlaces principales */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              ServeSense
            </Link>
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
            </div>
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
      {isOpen && (
        <div className="md:hidden">
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
          </div>
        </div>
      )}
    </nav>
  );
} 