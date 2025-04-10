'use client';

import { useEffect, useState } from 'react';
import { localStorageService } from '@/services/localStorage';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  senadeExpiration: string;
  healthCardExpiration: string;
  yellowCards: number;
  redCards: number;
  contactNumber: string;
  emergencyContact: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
  division: string;
  players: Player[];
  isOpponent: boolean;
}

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({
    name: '',
    number: 0,
    position: '',
    senadeExpiration: '',
    healthCardExpiration: '',
    yellowCards: 0,
    redCards: 0,
    contactNumber: '',
    emergencyContact: ''
  });
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const teams = await localStorageService.getTeams();
      const localTeam = teams.find(t => !t.isOpponent);
      if (localTeam) {
        const teamWithDivision = {
          ...localTeam,
          division: (localTeam as any).division || ''
        } as Team;
        setTeam(teamWithDivision);
      } else {
        setTeam(null);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar el equipo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!team) return;

    try {
      const newPlayerWithId = {
        ...newPlayer,
        id: crypto.randomUUID()
      };

      const updatedTeam = {
        ...team,
        players: [...team.players, newPlayerWithId]
      };

      await localStorageService.updateTeam(updatedTeam);
      setTeam(updatedTeam);
      setNewPlayer({
        name: '',
        number: 0,
        position: '',
        senadeExpiration: '',
        healthCardExpiration: '',
        yellowCards: 0,
        redCards: 0,
        contactNumber: '',
        emergencyContact: ''
      });
    } catch (err) {
      setError('Error al agregar el jugador');
      console.error(err);
    }
  };

  const handleUpdatePlayer = async () => {
    if (!team || !editingPlayer) return;

    try {
      const updatedTeam = {
        ...team,
        players: team.players.map(p => 
          p.id === editingPlayer.id ? editingPlayer : p
        )
      };

      await localStorageService.updateTeam(updatedTeam);
      setTeam(updatedTeam);
      setEditingPlayer(null);
    } catch (err) {
      setError('Error al actualizar el jugador');
      console.error(err);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!team) return;

    try {
      const updatedTeam = {
        ...team,
        players: team.players.filter(p => p.id !== playerId)
      };

      await localStorageService.updateTeam(updatedTeam);
      setTeam(updatedTeam);
    } catch (err) {
      setError('Error al eliminar el jugador');
      console.error(err);
    }
  };

  const isDocumentExpired = (date: string) => {
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#59c0d9]"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">No hay equipo local</h1>
                <p className="text-gray-600 mb-6">Crea un equipo local para comenzar a gestionar tus jugadores.</p>
                <button
                  onClick={() => setEditingPlayer({
                    id: crypto.randomUUID(),
                    name: '',
                    number: 0,
                    position: '',
                    senadeExpiration: '',
                    healthCardExpiration: '',
                    yellowCards: 0,
                    redCards: 0,
                    contactNumber: '',
                    emergencyContact: ''
                  })}
                  className="inline-flex items-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Crear Equipo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                  <p className="text-white/80">{team.division}</p>
                </div>
                <button
                  onClick={() => setEditingPlayer({
                    id: crypto.randomUUID(),
                    name: '',
                    number: 0,
                    position: '',
                    senadeExpiration: '',
                    healthCardExpiration: '',
                    yellowCards: 0,
                    redCards: 0,
                    contactNumber: '',
                    emergencyContact: ''
                  })}
                  className="text-white hover:text-white/80"
                >
                  <PlusIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-4">Nombre</th>
                      <th className="pb-4">Número</th>
                      <th className="pb-4">Posición</th>
                      <th className="pb-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.players.map(player => (
                      <tr key={player.id} className="border-t border-gray-100">
                        <td className="py-4">
                          <button
                            onClick={() => {
                              setSelectedPlayer(player);
                              setShowModal(true);
                            }}
                            className="text-gray-900 hover:text-[#59c0d9] transition-colors"
                          >
                            {player.name}
                          </button>
                        </td>
                        <td className="py-4 text-gray-600">#{player.number}</td>
                        <td className="py-4 text-gray-600">{player.position}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingPlayer(player)}
                              className="text-gray-400 hover:text-[#59c0d9] transition-colors"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(player.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles del Jugador */}
      {showModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Detalles del Jugador</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-white/80"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedPlayer.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-600">#{selectedPlayer.number}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">{selectedPlayer.position}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentación</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Vencimiento SENADE</p>
                        <p className={`font-medium ${
                          isDocumentExpired(selectedPlayer.senadeExpiration) 
                            ? 'text-red-600' 
                            : 'text-gray-900'
                        }`}>
                          {new Date(selectedPlayer.senadeExpiration).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vencimiento Carnet de Salud</p>
                        <p className={`font-medium ${
                          isDocumentExpired(selectedPlayer.healthCardExpiration) 
                            ? 'text-red-600' 
                            : 'text-gray-900'
                        }`}>
                          {new Date(selectedPlayer.healthCardExpiration).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarjetas</h3>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Amarillas</p>
                        <p className="text-2xl font-bold text-yellow-500">{selectedPlayer.yellowCards}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rojas</p>
                        <p className="text-2xl font-bold text-red-500">{selectedPlayer.redCards}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contactos</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-medium text-gray-900">{selectedPlayer.contactNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contacto de Emergencia</p>
                        <p className="font-medium text-gray-900">{selectedPlayer.emergencyContact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición/Agregar Jugador */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingPlayer.id ? 'Editar Jugador' : 'Agregar Jugador'}
                </h2>
                <button
                  onClick={() => setEditingPlayer(null)}
                  className="text-white hover:text-white/80"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingPlayer.id) {
                  handleUpdatePlayer();
                } else {
                  handleAddPlayer();
                }
              }}
              className="p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={editingPlayer.name}
                      onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      type="number"
                      value={editingPlayer.number}
                      onChange={e => setEditingPlayer({ ...editingPlayer, number: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posición
                    </label>
                    <input
                      type="text"
                      value={editingPlayer.position}
                      onChange={e => setEditingPlayer({ ...editingPlayer, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vencimiento SENADE
                    </label>
                    <input
                      type="date"
                      value={editingPlayer.senadeExpiration}
                      onChange={e => setEditingPlayer({ ...editingPlayer, senadeExpiration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vencimiento Carnet de Salud
                    </label>
                    <input
                      type="date"
                      value={editingPlayer.healthCardExpiration}
                      onChange={e => setEditingPlayer({ ...editingPlayer, healthCardExpiration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tarjetas Amarillas
                    </label>
                    <input
                      type="number"
                      value={editingPlayer.yellowCards}
                      onChange={e => setEditingPlayer({ ...editingPlayer, yellowCards: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tarjetas Rojas
                    </label>
                    <input
                      type="number"
                      value={editingPlayer.redCards}
                      onChange={e => setEditingPlayer({ ...editingPlayer, redCards: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={editingPlayer.contactNumber}
                      onChange={e => setEditingPlayer({ ...editingPlayer, contactNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contacto de Emergencia
                    </label>
                    <input
                      type="text"
                      value={editingPlayer.emergencyContact}
                      onChange={e => setEditingPlayer({ ...editingPlayer, emergencyContact: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
                >
                  {editingPlayer.id ? 'Guardar Cambios' : 'Agregar Jugador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 