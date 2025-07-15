'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ShieldCheckIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';

// SVG de caballo
function HorseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="32" cy="56" rx="18" ry="4" fill="#000" fillOpacity=".15" />
      <path d="M54 36c2-2 2-6-2-8l-2-1c-1-6-4-12-10-15-4-2-8-2-12 0-6 3-9 9-10 15l-2 1c-4 2-4 6-2 8l2 2c-2 2-2 6 2 8l2 1c1 6 4 12 10 15 4 2 8 2 12 0 6-3 9-9 10-15l2-1c4-2 4-6 2-8l-2-2z" fill="#fff" stroke="#222" strokeWidth="2" />
      <path d="M24 24c0-4 8-4 8 0" stroke="#222" strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="32" r="2" fill="#222" />
      <circle cx="38" cy="32" r="2" fill="#222" />
      <path d="M32 40c2 0 4-2 4-4" stroke="#222" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 40c-2 0-4-2-4-4" stroke="#222" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 18c-2-4-6-6-10-6 2 2 2 6 6 8" stroke="#222" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 18c2-4 6-6 10-6-2 2-2 6-6 8" stroke="#222" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RegisterModalWithRole({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('coach');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error al registrar usuario.');
      } else {
        setSuccess('Usuario creado exitosamente.');
        setTimeout(() => {
          setSuccess('');
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError('Error de red. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Crear usuario</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" placeholder="Tu nombre" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" placeholder="tu@email.com" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" placeholder="••••••••" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" placeholder="••••••••" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" disabled={isLoading}>
              <option value="coach">Coach</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">{success}</div>}
          <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-[#59c0d9] text-white rounded-md font-semibold hover:bg-[#59c0d9]/90 transition-colors disabled:bg-gray-400">
            {isLoading ? 'Creando usuario...' : 'Crear usuario'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Redirección automática según rol tras login
  useEffect(() => {
    if (status === 'loading') return; // Espera a que la sesión esté lista
    if (status === 'authenticated' && session?.user?.role) {
      if (session.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/'); // Redirige a inicio en vez de /matches
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email o contraseña incorrectos. Por favor, inténtelo de nuevo.');
      } else if (result?.ok) {
        // La redirección ahora la maneja el useEffect según el rol
      } else {
        setError('Error desconocido al iniciar sesión. Por favor, contacte a soporte.');
      }
    } catch (err) {
      console.error('Error en el login:', err);
      setError('Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center">
          <div className="animate-float mb-2">
            <img src="/logoss.png" alt="Logo ServeSense" className="h-24 w-24 drop-shadow-xl" />
          </div>
          <ShieldCheckIcon className="h-10 w-10 text-[#59c0d9] mb-2" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
          Bienvenido a ServeSense
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Gestiona tus equipos y partidos con facilidad.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 bg-opacity-50 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Correo electrónico
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full bg-gray-700 border border-gray-600 rounded-md py-3 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-[#59c0d9] focus:border-[#59c0d9] sm:text-sm"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full bg-gray-700 border border-gray-600 rounded-md py-3 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-[#59c0d9] focus:border-[#59c0d9] sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-300 px-4 py-3 rounded-md text-sm">
                <p>{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#59c0d9] hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#59c0d9] focus:ring-offset-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Iniciar sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="mt-4">
      </div>
    </div>
  );
} 