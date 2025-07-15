"use client";

import { useSession } from 'next-auth/react';
import { getLocalBackup } from '../utils/localBackup';

export default function BackupButton() {
  const { data: session } = useSession();

  const handleBackup = async () => {
    const userId = session?.user?.id;
    if (!userId) return alert('No autenticado');

    const backup = getLocalBackup(userId);
    if (!backup) return alert('No hay datos para respaldar');

    const res = await fetch('/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backup }),
      credentials: 'include'
    });

    if (res.ok) {
      alert('Respaldo subido correctamente');
    } else {
      alert('Error al subir el respaldo');
    }
  };

  return (
    <button
      onClick={handleBackup}
      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
    >
      Respaldar mis datos en la nube
    </button>
  );
} 