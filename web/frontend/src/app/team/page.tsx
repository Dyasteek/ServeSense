'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import CreateTeamModal from '@/components/CreateTeamModal';
import EditPlayerModal from '@/components/EditPlayerModal';
import { Player as PlayerType } from '@/types/team';
import { useSession } from 'next-auth/react';
import { getLocalBackup, saveLocalBackup } from '@/utils/localBackup';

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

// Tipos para partido y estadística
interface Match {
  id: string;
  date: string;
  opponent: string;
  result: string;
  score: string;
}

interface Estadistica {
  id: string;
  descripcion: string;
  valor: number;
}

const defaultPlayerFields = {
  stats: {
    aces: 0,
    servicios: 0,
    ataques: 0,
    bloqueos: 0,
    defensas: 0,
    recepciones: 0,
    colocaciones: 0,
    errores: 0
  },
  senadeExpiration: '',
  healthCardExpiration: '',
  yellowCards: 0,
  redCards: 0,
  emergencyContact: '',
  contactNumber: ''
};

export default function TeamPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    loadTeam();
    // eslint-disable-next-line
  }, [session]);

  const loadTeam = () => {
    setLoading(true);
    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('No autenticado');
      const backup = getLocalBackup(userId);
      if (backup && backup.equipos.length > 0) {
        setTeam(backup.equipos[0]);
      } else {
        setTeam(null);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar el equipo');
      setTeam(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (teamData: { name: string; division: string }) => {
    try {
      // Guardar en localStorage
      const userId = session?.user?.id;
      if (!userId) throw new Error('No autenticado');
      const backup = getLocalBackup(userId) || {
        equipos: [],
        jugadores: [],
        partidos: [],
        estadisticas: [],
        datosPersonales: {}
      };
      const newTeam = {
        id: crypto.randomUUID(),
        name: teamData.name,
        division: teamData.division,
        players: [],
        isOpponent: false,
        color: '#59c0d9',
        position: 0,
        points: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        setsWon: 0,
        setsLost: 0
      };
      backup.equipos.push(newTeam);
      saveLocalBackup(userId, backup);
      setTeam(newTeam);
      setShowCreateModal(false);
    } catch (err) {
      setError('Error al crear el equipo localmente');
      console.error(err);
    }
  };

  const handleEditPlayer = async (playerData: Omit<Player, 'id'>) => {
    if (!team || !selectedPlayer) return;
    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('No autenticado');
      const backup = getLocalBackup(userId);
      if (!backup) throw new Error('No hay backup local');
      const updatedPlayers = team.players.map(player =>
        player.id === selectedPlayer.id
          ? { ...player, ...playerData, ...defaultPlayerFields }
          : player
      );
      const updatedTeam = { ...team, players: updatedPlayers };
      backup.equipos = backup.equipos.map(eq => eq.id === team.id ? updatedTeam : eq);
      saveLocalBackup(userId, backup);
      setTeam(updatedTeam);
      setShowEditModal(false);
      setSelectedPlayer(null);
    } catch (err) {
      setError('Error al actualizar el jugador localmente');
      console.error(err);
    }
  };

  const handleAddPlayer = async (playerData: Omit<Player, 'id'>) => {
    if (!team) return;
    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('No autenticado');
      const backup = getLocalBackup(userId);
      if (!backup) throw new Error('No hay backup local');
      const newPlayer: PlayerType = {
        ...playerData,
        ...defaultPlayerFields,
        id: crypto.randomUUID()
      };
      const updatedTeam = { ...team, players: [...team.players, newPlayer] };
      backup.equipos = backup.equipos.map(eq => eq.id === team.id ? updatedTeam : eq);
      saveLocalBackup(userId, backup);
      setTeam(updatedTeam);
      setShowEditModal(false);
      setSelectedPlayer(null);
    } catch (err) {
      setError('Error al agregar el jugador localmente');
      console.error(err);
    }
  };

  const handlePlayerClick = (playerId: string) => {
    router.push(`/team/${playerId}`);
  };

  const getFullPlayer = (player: any): PlayerType => ({
    ...defaultPlayerFields,
    ...player
  });

  // Función para agregar un partido localmente
  const handleAddMatch = (matchData: Omit<Match, 'id'>) => {
    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('No autenticado');
      const backup = getLocalBackup(userId);
      if (!backup) throw new Error('No hay backup local');
      const newMatch: Match = { ...matchData, id: crypto.randomUUID() };
      backup.partidos.push(newMatch);
      saveLocalBackup(userId, backup);
      // Si quieres mostrar los partidos en la UI, puedes usar un estado para partidos y actualizarlo aquí
    } catch (err) {
      setError('Error al agregar el partido localmente');
      console.error(err);
    }
  };

  // Función para agregar o actualizar una estadística localmente
  const handleAddOrUpdateStat = (statData: Omit<Estadistica, 'id'>, statId?: string) => {
    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('No autenticado');
      const backup = getLocalBackup(userId);
      if (!backup) throw new Error('No hay backup local');
      if (statId) {
        // Actualizar
        backup.estadisticas = backup.estadisticas.map(est => est.id === statId ? { ...est, ...statData } : est);
      } else {
        // Agregar
        const newStat: Estadistica = { ...statData, id: crypto.randomUUID() };
        backup.estadisticas.push(newStat);
      }
      saveLocalBackup(userId, backup);
      // Si quieres mostrar las estadísticas en la UI, puedes usar un estado para estadisticas y actualizarlo aquí
    } catch (err) {
      setError('Error al guardar la estadística localmente');
      console.error(err);
    }
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
        player={selectedPlayer ? getFullPlayer(selectedPlayer) : undefined}
        isNewPlayer={!selectedPlayer}
      />
    </div>
  );
} 