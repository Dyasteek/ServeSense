'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import CreateTeamModal from '@/components/CreateTeamModal';
import EditPlayerModal from '@/components/EditPlayerModal';
import { localStorageService } from '@/services/localStorage';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

interface Team {
  id: string;
  name: string;
  division: string;
  players: Player[];
  isOpponent: boolean;
  color: string;
  position: number;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
}

export default function TeamPage() {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const teams = await localStorageService.getTeams();
      const localTeam = teams.find(t => !t.isOpponent);
      if (localTeam) {
        setTeam(localTeam as Team);
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

  const handleCreateTeam = async (teamData: { name: string; division: string; players: Player[] }) => {
    try {
      const newTeam = await localStorageService.addTeam({
        name: teamData.name,
        division: teamData.division,
        players: teamData.players,
        isOpponent: false,
        color: '#59c0d9',
        position: 0,
        points: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        setsWon: 0,
        setsLost: 0
      });
      setTeam(newTeam);
      setShowCreateModal(false);
    } catch (err) {
      setError('Error al crear el equipo');
      console.error(err);
    }
  };

  const handleEditPlayer = async (playerData: Omit<Player, 'id'>) => {
    if (!team || !selectedPlayer) return;

    try {
      const updatedPlayers = team.players.map(player => 
        player.id === selectedPlayer.id 
          ? { ...player, ...playerData }
          : player
      );

      const updatedTeam = await localStorageService.updateTeam(team.id, {
        ...team,
        players: updatedPlayers
      });

      setTeam(updatedTeam);
      setShowEditModal(false);
      setSelectedPlayer(null);
    } catch (err) {
      setError('Error al actualizar el jugador');
      console.error(err);
    }
  };

  const handleAddPlayer = async (playerData: Omit<Player, 'id'>) => {
    if (!team) return;

    try {
      const newPlayer = {
        ...playerData,
        id: crypto.randomUUID()
      };

      const updatedTeam = await localStorageService.updateTeam(team.id, {
        ...team,
        players: [...team.players, newPlayer]
      });

      setTeam(updatedTeam);
      setShowEditModal(false);
      setSelectedPlayer(null);
    } catch (err) {
      setError('Error al agregar el jugador');
      console.error(err);
    }
  };

  const handlePlayerClick = (playerId: string) => {
    router.push(`/team/${playerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#59c0d9]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {!team ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-white">No tienes un equipo creado</h1>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 bg-white text-[#59c0d9] px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Crear Equipo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                    <p className="text-white/80">{team.division}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlayer(null);
                      setShowEditModal(true);
                    }}
                    className="inline-flex items-center gap-2 bg-white text-[#59c0d9] px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Agregar Jugador
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {team.players.map((player) => (
                    <div key={player.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Nombre</p>
                        <button
                          onClick={() => handlePlayerClick(player.id)}
                          className="text-[#59c0d9] hover:text-[#59c0d9]/80 transition-colors"
                        >
                          {player.name}
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Número</p>
                        <p className="text-gray-900">{player.number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Posición</p>
                        <p className="text-gray-900">{player.position}</p>
                      </div>
                      <div className="flex items-end justify-end">
                        <button
                          onClick={() => {
                            setSelectedPlayer(player);
                            setShowEditModal(true);
                          }}
                          className="text-gray-600 hover:text-[#59c0d9] transition-colors"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTeam}
      />

      <EditPlayerModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPlayer(null);
        }}
        onSubmit={selectedPlayer ? handleEditPlayer : handleAddPlayer}
        player={selectedPlayer}
      />
    </div>
  );
} 