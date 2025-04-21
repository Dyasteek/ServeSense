'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerData: Omit<Player, 'id'>) => void;
  player: Player | null;
}

const POSITIONS = [
  'Armador',
  'Central',
  'Punta',
  'Opuesto',
  'Libero',
  'Líbero'
];

export default function EditPlayerModal({ isOpen, onClose, onSubmit, player }: EditPlayerModalProps) {
  const [name, setName] = useState(player?.name || '');
  const [number, setNumber] = useState(player?.number || 0);
  const [position, setPosition] = useState(player?.position || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !number || !position) {
      setError('Por favor completa todos los campos');
      return;
    }

    onSubmit({
      name,
      number,
      position
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Editar Jugador</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-white/80 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
                placeholder="Nombre del jugador"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Número
              </label>
              <input
                type="number"
                value={number || ''}
                onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
                placeholder="Número"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Posición
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
              >
                <option value="">Selecciona una posición</option>
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#59c0d9]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md text-white bg-[#59c0d9] hover:bg-[#59c0d9]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#59c0d9]"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 