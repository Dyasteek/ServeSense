'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Player, PlayerStats } from '@/types/team';
import { teamService } from '@/services/teamService';

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

const initialPlayerStats: PlayerStats = {
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
  const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({
    name: '',
    number: 0,
    position: '',
    stats: initialPlayerStats,
    senadeExpiration: '',
    healthCardExpiration: '',
    yellowCards: 0,
    redCards: 0,
    emergencyContact: '',
    contactNumber: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleAddPlayer = () => {
    if (!newPlayer.name || !newPlayer.number || !newPlayer.position) {
      setError('Por favor completa todos los campos del jugador');
      return;
    }

    if (!newPlayer.senadeExpiration || !newPlayer.healthCardExpiration) {
      setError('Por favor ingresa las fechas de vencimiento de SENADE y Ficha Médica');
      return;
    }

    if (!newPlayer.emergencyContact || !newPlayer.contactNumber) {
      setError('Por favor ingresa los números de contacto');
      return;
    }

    const playerWithId = {
      ...newPlayer,
      id: crypto.randomUUID()
    };

    setPlayers([...players, playerWithId]);
    setNewPlayer({
      name: '',
      number: 0,
      position: '',
      stats: initialPlayerStats,
      senadeExpiration: '',
      healthCardExpiration: '',
      yellowCards: 0,
      redCards: 0,
      emergencyContact: '',
      contactNumber: ''
    });
    setError(null);
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

    try {
      const teamData = {
        id: crypto.randomUUID(),
        name,
        division,
        players: players.map(player => ({
          ...player,
          stats: {
            aces: 0,
            servicios: 0,
            ataques: 0,
            bloqueos: 0,
            defensas: 0,
            recepciones: 0,
            colocaciones: 0,
            errores: 0
          }
        })),
        position: 0,
        points: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        setsWon: 0,
        setsLost: 0,
        color: '#59c0d9',
        isOpponent: false
      };

      console.log('Intentando crear equipo con datos:', teamData);
      const createdTeam = await teamService.createTeam(teamData);
      
      console.log('Equipo creado:', createdTeam);
      onSubmit({ name, division, players });
      onClose();
    } catch (error: any) {
      console.error('Error al crear equipo:', error);
      setError(error.message || 'Error al crear el equipo');
    }
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
            <h3 className="text-lg font-medium text-gray-900">Jugadores</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
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
                  value={newPlayer.number || ''}
                  onChange={(e) => setNewPlayer({ ...newPlayer, number: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
                  placeholder="Número"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Posición
                </label>
                <select
                  value={newPlayer.position}
                  onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
                >
                  <option value="">Selecciona una posición</option>
                  {POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vencimiento SENADE
                </label>
                <input
                  type="date"
                  value={newPlayer.senadeExpiration}
                  onChange={(e) => setNewPlayer({ ...newPlayer, senadeExpiration: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vencimiento Ficha Médica
                </label>
                <input
                  type="date"
                  value={newPlayer.healthCardExpiration}
                  onChange={(e) => setNewPlayer({ ...newPlayer, healthCardExpiration: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contacto de Emergencia
                </label>
                <input
                  type="tel"
                  value={newPlayer.emergencyContact}
                  onChange={(e) => setNewPlayer({ ...newPlayer, emergencyContact: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
                  placeholder="Número de emergencia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número de Contacto
                </label>
                <input
                  type="tel"
                  value={newPlayer.contactNumber}
                  onChange={(e) => setNewPlayer({ ...newPlayer, contactNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
                  placeholder="Número de contacto"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddPlayer}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#59c0d9] hover:bg-[#59c0d9]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#59c0d9]"
            >
              Agregar Jugador
            </button>
          </div>

          {players.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Jugadores Agregados</h4>
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
          )}

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