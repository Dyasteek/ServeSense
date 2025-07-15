'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Team, Player } from '@/types/team';
import PlayerForm from './PlayerForm';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamData: { name: string; division: string; players: Player[] }) => void;
}

const POSITIONS = [
  'Armador',
  'Central',
  'Punta',
  'Opuesto',
  'Libero',
  'Líbero'
];

const initialPlayerStats = {
  aces: 0,
  servicios: 0,
  ataques: 0,
  bloqueos: 0,
  defensas: 0,
  recepciones: 0,
  colocaciones: 0,
  errores: 0
};

export default function CreateTeamModal({ isOpen, onClose, onSubmit }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPlayer = (playerData: Omit<Player, 'id'>) => {
    const playerWithId = {
      ...playerData,
      id: crypto.randomUUID()
    };

    setPlayers([...players, playerWithId]);
    setShowPlayerForm(false);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(player => player.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !division || players.length === 0) {
      setError('Por favor completa todos los campos');
      return;
    }

    onSubmit({ name, division, players });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Crear Nuevo Equipo</h2>
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
                Nombre del Equipo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
                placeholder="Ej: Los Halcones"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                División
              </label>
              <input
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
                placeholder="Ej: Primera División"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Jugadores</h3>
              <button
                type="button"
                onClick={() => setShowPlayerForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#59c0d9] hover:bg-[#59c0d9]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#59c0d9]"
              >
                Agregar Jugador
              </button>
            </div>

            {showPlayerForm && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <PlayerForm
                  onSubmit={handleAddPlayer}
                  onCancel={() => setShowPlayerForm(false)}
                  submitButtonText="Agregar Jugador"
                />
              </div>
            )}

            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-gray-500">
                      #{player.number} - {player.position}
                    </p>
                    <p className="text-xs text-gray-400">
                      SENADE: {player.senadeExpiration} | Ficha Médica: {player.healthCardExpiration}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(player.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
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
              Crear Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 