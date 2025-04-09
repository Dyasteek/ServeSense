'use client';

import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon, XMarkIcon, CheckIcon, PlayIcon } from '@heroicons/react/24/outline';

interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
}

interface Team {
  id: number;
  name: string;
  maxPlayers: number;
  color: string;
  players: Player[];
}

interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({});
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    maxPlayers: 6,
    color: '#000000'
  });
  const [newMatch, setNewMatch] = useState({
    opponentTeamId: '',
    isHomeTeam: true
  });
  const [opponentTeams, setOpponentTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeam();
    loadOpponentTeams();
  }, []);

  const loadOpponentTeams = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      setOpponentTeams(data.filter((t: Team) => t.id !== team?.id));
    } catch (error) {
      console.error('Error al cargar equipos contrincantes:', error);
      setOpponentTeams([]);
    }
  };

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/1`);
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
        setTeamName(data.name);
      } else if (response.status === 404) {
        setTeam(null);
      }
    } catch (error) {
      console.error('Error al cargar el equipo:', error);
      setError('Hubo un error al cargar el equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeam),
      });

      if (response.ok) {
        const data = await response.json();
        setTeam(data);
        setTeamName(data.name);
        setIsCreatingTeam(false);
        setNewTeam({
          name: '',
          maxPlayers: 6,
          color: '#000000'
        });
      }
    } catch (error) {
      console.error('Error al crear el equipo:', error);
      setError(error instanceof Error ? error.message : 'Hubo un error al crear el equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTeamName = async () => {
    if (!team) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${team.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: teamName }),
      });

      if (response.ok) {
        const updatedTeam = await response.json();
        setTeam(updatedTeam);
        setIsEditingTeamName(false);
      }
    } catch (error) {
      console.error('Error al guardar el nombre del equipo:', error);
      alert('Hubo un error al guardar el nombre del equipo');
    }
  };

  const handleSavePlayer = async (player: Player) => {
    if (!team) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/players/${player.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(player),
      });

      if (response.ok) {
        const updatedPlayer = await response.json();
        setTeam(prev => prev ? {
          ...prev,
          players: prev.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
        } : null);
        setEditingPlayer(null);
      }
    } catch (error) {
      console.error('Error al guardar el jugador:', error);
      alert('Hubo un error al guardar el jugador');
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name || !newPlayer.number || !newPlayer.position) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPlayer,
          teamId: team?.id
        }),
      });

      if (response.ok) {
        const createdPlayer = await response.json();
        setTeam(prev => prev ? {
          ...prev,
          players: [...prev.players, createdPlayer]
        } : null);
        setNewPlayer({});
      }
    } catch (error) {
      console.error('Error al agregar jugador:', error);
      alert('Hubo un error al agregar el jugador');
    }
  };

  const handleDeletePlayer = async (playerId: number) => {
    if (!team) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/players/${playerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTeam(prev => prev ? {
          ...prev,
          players: prev.players.filter(p => p.id !== playerId)
        } : null);
      }
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      alert('Hubo un error al eliminar el jugador');
    }
  };

  const handleCreateMatch = async () => {
    if (!team || !newMatch.opponentTeamId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeTeamId: newMatch.isHomeTeam ? team.id : newMatch.opponentTeamId,
          awayTeamId: newMatch.isHomeTeam ? newMatch.opponentTeamId : team.id,
          date: new Date().toISOString(),
          status: 'scheduled'
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const match = await response.json();
      setIsCreatingMatch(false);
      setNewMatch({
        opponentTeamId: '',
        isHomeTeam: true
      });
      window.location.href = `/matches/${match.id}`;
    } catch (error) {
      console.error('Error al crear el partido:', error);
      alert('Hubo un error al crear el partido. Por favor, intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={loadTeam}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {isCreatingTeam ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Crear Nuevo Equipo</h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                    Nombre del Equipo
                  </label>
                  <input
                    type="text"
                    id="teamName"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Ingresa el nombre del equipo"
                  />
                </div>

                <div>
                  <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700">
                    Cantidad de Jugadores
                  </label>
                  <input
                    type="number"
                    id="maxPlayers"
                    value={newTeam.maxPlayers}
                    onChange={(e) => setNewTeam({ ...newTeam, maxPlayers: parseInt(e.target.value) })}
                    min="6"
                    max="20"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Mínimo 6 jugadores, máximo 20 jugadores
                  </p>
                </div>

                <div>
                  <label htmlFor="teamColor" className="block text-sm font-medium text-gray-700">
                    Color del Equipo
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    <input
                      type="color"
                      id="teamColor"
                      value={newTeam.color}
                      onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
                      className="h-10 w-20 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">
                      {newTeam.color}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={() => {
                      setIsCreatingTeam(false);
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateTeam}
                    disabled={!newTeam.name.trim() || loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creando...' : 'Crear Equipo'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">No tienes un equipo creado</h1>
              <p className="text-gray-600 mb-8">
                Crea un nuevo equipo para comenzar a gestionar tus jugadores.
              </p>
              <button
                onClick={() => setIsCreatingTeam(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors mx-auto"
              >
                <PlusIcon className="h-5 w-5" />
                Crear Nuevo Equipo
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {isEditingTeamName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="text-3xl font-bold text-gray-900 border-b-2 border-primary-600 focus:outline-none"
              />
              <button
                onClick={handleSaveTeamName}
                className="text-primary-600 hover:text-primary-700"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">{teamName}</h1>
              <button
                onClick={() => setIsEditingTeamName(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCreatingMatch(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <PlayIcon className="h-5 w-5" />
          Comenzar Partido
        </button>
      </div>

      {isCreatingMatch && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Comenzar Nuevo Partido</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="opponentTeam" className="block text-sm font-medium text-gray-700">
                  Equipo Contrincante
                </label>
                <select
                  id="opponentTeam"
                  value={newMatch.opponentTeamId}
                  onChange={(e) => setNewMatch({ ...newMatch, opponentTeamId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Selecciona un equipo</option>
                  {opponentTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Partido
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={newMatch.isHomeTeam}
                      onChange={() => setNewMatch({ ...newMatch, isHomeTeam: true })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2">Local</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!newMatch.isHomeTeam}
                      onChange={() => setNewMatch({ ...newMatch, isHomeTeam: false })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2">Visitante</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setIsCreatingMatch(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateMatch}
                  disabled={!newMatch.opponentTeamId}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comenzar Partido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Lista de jugadores */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Jugadores
          </h2>
          <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
            {team.players.map((player) => (
              <div
                key={player.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                {editingPlayer?.id === player.id ? (
                  <div className="flex-1 flex items-center gap-4">
                    <input
                      type="text"
                      value={editingPlayer.name}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                      className="border rounded px-2 py-1"
                      placeholder="Nombre"
                    />
                    <input
                      type="number"
                      value={editingPlayer.number}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, number: parseInt(e.target.value) })}
                      className="border rounded px-2 py-1 w-20"
                      placeholder="Número"
                    />
                    <input
                      type="text"
                      value={editingPlayer.position}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, position: e.target.value })}
                      className="border rounded px-2 py-1 flex-1"
                      placeholder="Posición"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSavePlayer(player);
                      }}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {player.name}
                      </p>
                      <p className="text-sm text-gray-500">{player.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        #{player.number}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPlayer(player);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlayer(player.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Formulario para nuevo jugador */}
            <div className="p-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  className="border rounded px-2 py-1"
                  placeholder="Nombre"
                />
                <input
                  type="number"
                  value={newPlayer.number || ''}
                  onChange={(e) => setNewPlayer({ ...newPlayer, number: parseInt(e.target.value) })}
                  className="border rounded px-2 py-1 w-20"
                  placeholder="Número"
                />
                <input
                  type="text"
                  value={newPlayer.position}
                  onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Posición"
                />
                <button
                  onClick={handleAddPlayer}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                >
                  <PlusIcon className="h-5 w-5" />
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 