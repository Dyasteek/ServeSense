import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export default function AccesoRestringidoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center">
        <LockClosedIcon className="h-16 w-16 text-red-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Acceso Restringido</h1>
        <p className="text-gray-600 mb-6 text-center max-w-xs">
          No tienes permisos para acceder a esta sección. Si crees que esto es un error, contacta con el administrador.
        </p>
        <Link href="/" className="px-6 py-2 bg-[#59c0d9] text-white rounded-lg font-semibold hover:bg-[#59c0d9]/90 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
} 