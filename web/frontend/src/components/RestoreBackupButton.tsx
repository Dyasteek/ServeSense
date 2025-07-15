"use client";

import { useSession } from 'next-auth/react';
import { saveLocalBackup } from '../utils/localBackup';

export default function RestoreBackupButton() {
  const { data: session } = useSession();

  const handleRestore = async () => {
    const userId = session?.user?.id;
    if (!userId) return alert('No autenticado');

    const res = await fetch('/api/backup/last', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) return alert('No se pudo recuperar el respaldo');

    const { backup } = await res.json();
    if (!backup) return alert('No hay respaldo disponible');

    saveLocalBackup(userId, backup);
    alert('Respaldo restaurado en tu dispositivo');
  };

  return (
    <button
      onClick={handleRestore}
      className="bg-secondary-600 text-white px-4 py-2 rounded-lg hover:bg-secondary-700"
    >
      Restaurar mi respaldo
    </button>
  );
} 