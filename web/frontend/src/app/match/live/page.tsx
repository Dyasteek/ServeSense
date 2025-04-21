'use client';

import { useState, useEffect } from 'react';
import { localStorageService } from '@/services/localStorage';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Team, Player, PlayerStats } from '@/types/team';

interface Stat {
  id: keyof PlayerStats;
  name: string;
  type: 'number' | 'boolean';
  positions: string[];
}

const STATS: Stat[] = [
  { id: 'aces', name: 'Aces', type: 'number', positions: ['Armador', 'Opuesto', 'Punta', 'Central', 'Libero'] },
  { id: 'servicios', name: 'Servicios', type: 'number', positions: ['Armador', 'Opuesto', 'Punta', 'Central', 'Libero'] },
  { id: 'ataques', name: 'Ataques', type: 'number', positions: ['Opuesto', 'Punta', 'Central'] },
  { id: 'bloqueos', name: 'Bloqueos', type: 'number', positions: ['Opuesto', 'Punta', 'Central'] },
  { id: 'defensas', name: 'Defensas', type: 'number', positions: ['Opuesto', 'Punta', 'Central', 'Libero'] },
  { id: 'recepciones', name: 'Recepciones', type: 'number', positions: ['Opuesto', 'Punta', 'Libero'] },
  { id: 'colocaciones', name: 'Colocaciones', type: 'number', positions: ['Armador'] },
  { id: 'errores', name: 'Errores', type: 'number', positions: ['Armador', 'Opuesto', 'Punta', 'Central', 'Libero'] },
];

export default function LiveMatchPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courtPlayers, setCourtPlayers] = useState<Player[]>([]);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [selectedCourtPlayer, setSelectedCourtPlayer] = useState<Player | null>(null);
  const [selectedBenchPlayer, setSelectedBenchPlayer] = useState<Player | null>(null);
  const [showInitialPlayersModal, setShowInitialPlayersModal] = useState(true);
  const [selectedInitialPlayers, setSelectedInitialPlayers] = useState<Player[]>([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const teams = await localStorageService.getTeams();
      const localTeam = teams.find(t => !t.isOpponent);
      if (localTeam) {
        const teamWithStats: Team = {
          ...localTeam,
          players: localTeam.players.map(player => ({
            ...player,
            stats: player.stats || {
              aces: 0,
              servicios: 0,
              ataques: 0,
              bloqueos: 0,
              defensas: 0,
              recepciones: 0,
              colocaciones: 0,
              errores: 0
            },
            senadeExpiration: player.senadeExpiration || '',
            healthCardExpiration: player.healthCardExpiration || '',
            yellowCards: player.yellowCards || 0,
            redCards: player.redCards || 0,
            emergencyContact: player.emergencyContact || '',
            contactNumber: player.contactNumber || ''
          }))
        };
        setTeam(teamWithStats);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar el equipo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndMatch = async () => {
    if (team) {
      try {
        const updatedTeam: Team = {
          ...team,
          position: team.position || 0,
          points: team.points || 0,
          matchesPlayed: (team.matchesPlayed || 0) + 1,
          matchesWon: team.matchesWon || 0,
          matchesLost: team.matchesLost || 0,
          setsWon: team.setsWon || 0,
          setsLost: team.setsLost || 0,
          color: team.color || '',
          division: team.division || '',
          isOpponent: team.isOpponent || false,
          players: team.players.map(player => ({
            ...player,
            stats: {
              aces: player.stats?.aces || 0,
              servicios: player.stats?.servicios || 0,
              ataques: player.stats?.ataques || 0,
              bloqueos: player.stats?.bloqueos || 0,
              defensas: player.stats?.defensas || 0,
              recepciones: player.stats?.recepciones || 0,
              colocaciones: player.stats?.colocaciones || 0,
              errores: player.stats?.errores || 0
            },
            senadeExpiration: player.senadeExpiration || '',
            healthCardExpiration: player.healthCardExpiration || '',
            yellowCards: player.yellowCards || 0,
            redCards: player.redCards || 0,
            emergencyContact: player.emergencyContact || '',
            contactNumber: player.contactNumber || ''
          }))
        };
        
        await localStorageService.updateTeamStats(updatedTeam);
        router.push('/stats');
      } catch (error) {
        console.error('Error al guardar las estadísticas:', error);
      }
    }
  };

  const handleSubstitution = () => {
    setShowSubstitutionModal(true);
  };

  const handleConfirmSubstitution = () => {
    if (selectedCourtPlayer && selectedBenchPlayer) {
      setCourtPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const courtPlayerIndex = newPlayers.findIndex(p => p.id === selectedCourtPlayer.id);
        newPlayers[courtPlayerIndex] = selectedBenchPlayer;
        return newPlayers;
      });
      setShowSubstitutionModal(false);
      setSelectedCourtPlayer(null);
      setSelectedBenchPlayer(null);
    }
  };

  const handleCancelSubstitution = () => {
    setShowSubstitutionModal(false);
    setSelectedCourtPlayer(null);
    setSelectedBenchPlayer(null);
  };

  const handleRotation = () => {
    setCourtPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const lastPlayer = newPlayers[newPlayers.length - 1];
      for (let i = newPlayers.length - 1; i > 0; i--) {
        newPlayers[i] = newPlayers[i - 1];
      }
      newPlayers[0] = lastPlayer;
      return newPlayers;
    });
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedInitialPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else if (prev.length < 6) {
        return [...prev, player];
      }
      return prev;
    });
  };

  const handleConfirmInitialPlayers = () => {
    if (selectedInitialPlayers.length === 6) {
      setCourtPlayers(selectedInitialPlayers);
      setShowInitialPlayersModal(false);
    }
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowStatsModal(true);
  };

  const handleStatChange = (statId: keyof PlayerStats, value: number) => {
    if (selectedPlayer && team) {
      setTeam(prevTeam => {
        if (!prevTeam) return null;
        const updatedPlayers = prevTeam.players.map(p => {
          if (p.id === selectedPlayer.id) {
            return {
              ...p,
              stats: {
                ...p.stats,
                [statId]: (p.stats[statId] || 0) + value
              }
            };
          }
          return p;
        });
        return { ...prevTeam, players: updatedPlayers };
      });
    }
  };

  const handleCloseStatsModal = () => {
    setShowStatsModal(false);
    setSelectedPlayer(null);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No hay equipo creado</h2>
          <p className="text-gray-600">Crea un equipo para comenzar un partido</p>
        </div>
      </div>
    );
  }

  const benchPlayers = team.players.filter(player => !courtPlayers.some(cp => cp.id === player.id));
  const availableStats = STATS.filter(stat => stat.positions.includes(selectedPlayer?.position || ''));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4">
          {/* Cancha de Voleibol */}
          <div className="max-w-md mx-auto mb-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="relative w-full aspect-square bg-[#59c0d9] border-4 border-white rounded-lg">
                  {/* Línea central */}
                  <div className="absolute inset-0 flex flex-col">
                    <div className="h-1/2 w-full border-b-4 border-white"></div>
                  </div>

                  {/* Jugadores en la cancha */}
                  {courtPlayers.map((player, index) => {
                    const positions = [
                      { top: '25%', left: '25%' },  // Zona 1
                      { top: '25%', left: '50%' },  // Zona 2
                      { top: '25%', left: '75%' },  // Zona 3
                      { top: '75%', left: '25%' },  // Zona 4
                      { top: '75%', left: '50%' },  // Zona 5
                      { top: '75%', left: '75%' },  // Zona 6
                    ];
                    return (
                      <div
                        key={player.id}
                        className="absolute w-8 h-8 bg-white rounded-full border-2 border-white flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:bg-gray-100"
                        style={{
                          top: positions[index].top,
                          left: positions[index].left,
                        }}
                        onClick={() => handlePlayerClick(player)}
                      >
                        <span className="text-xs font-medium text-gray-900">{player.number}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de jugadores */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Jugadores del Equipo</h2>
                <div className="grid grid-cols-2 gap-3">
                  {team.players.map((player) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer ${
                        courtPlayers.some(p => p.id === player.id)
                          ? 'border-[#59c0d9] bg-[#59c0d9]/10'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handlePlayerClick(player)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm text-gray-900 font-medium">{player.number}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{player.name}</div>
                          <div className="text-xs text-gray-500">{player.position}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de control - Fijos en la parte inferior */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto flex justify-center gap-4">
          <button
            onClick={handleRotation}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Rotar
          </button>
          <button
            onClick={handleSubstitution}
            className="flex-1 px-6 py-3 bg-[#59c0d9] text-white rounded-lg font-medium hover:bg-[#59c0d9]/90 transition-colors"
          >
            Cambio
          </button>
          <button
            onClick={handleEndMatch}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Fin de Partido
          </button>
        </div>
      </div>

      {/* Modal de Estadísticas */}
      {showStatsModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
                <p className="text-sm text-gray-500">
                  {selectedPlayer.name} - {selectedPlayer.position}
                </p>
              </div>
              <button
                onClick={handleCloseStatsModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {availableStats.map(stat => (
                  <div key={stat.id} className="p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">{stat.name}</span>
                      <span className="text-sm text-gray-500">
                        {selectedPlayer.stats[stat.id as keyof PlayerStats] || 0}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatChange(stat.id as keyof PlayerStats, 1)}
                        className="flex-1 px-3 py-1 bg-[#59c0d9] text-white rounded hover:bg-[#59c0d9]/90"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleStatChange(stat.id as keyof PlayerStats, -1)}
                        className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        -1
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selección de Jugadores Iniciales */}
      {showInitialPlayersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Seleccionar Jugadores Iniciales</h3>
              <div className="text-sm text-gray-500">
                {selectedInitialPlayers.length}/6 seleccionados
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {team.players.map(player => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer ${
                      selectedInitialPlayers.some(p => p.id === player.id)
                        ? 'border-[#59c0d9] bg-[#59c0d9]/10'
                        : 'border-gray-200 hover:border-[#59c0d9]/50'
                    }`}
                    onClick={() => handlePlayerSelect(player)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm text-gray-900 font-medium">{player.number}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{player.name}</div>
                        <div className="text-xs text-gray-500">{player.position}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleConfirmInitialPlayers}
                disabled={selectedInitialPlayers.length !== 6}
                className={`px-6 py-2 rounded-lg font-medium ${
                  selectedInitialPlayers.length === 6
                    ? 'bg-[#59c0d9] text-white hover:bg-[#59c0d9]/90'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirmar Selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cambios */}
      {showSubstitutionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Realizar Cambio</h3>
              <button
                onClick={handleCancelSubstitution}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Jugadores en Cancha */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">En Cancha</h4>
                  <div className="space-y-2">
                    {courtPlayers.map(player => (
                      <div
                        key={player.id}
                        className={`p-2 rounded-lg border-2 cursor-pointer ${
                          selectedCourtPlayer?.id === player.id
                            ? 'border-[#59c0d9] bg-[#59c0d9]/10'
                            : 'border-gray-200 hover:border-[#59c0d9]/50'
                        }`}
                        onClick={() => setSelectedCourtPlayer(player)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-900 font-medium">{player.number}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{player.name}</div>
                            <div className="text-xs text-gray-500">{player.position}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Jugadores en Banco */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">En Banco</h4>
                  <div className="space-y-2">
                    {benchPlayers.map(player => (
                      <div
                        key={player.id}
                        className={`p-2 rounded-lg border-2 cursor-pointer ${
                          selectedBenchPlayer?.id === player.id
                            ? 'border-[#59c0d9] bg-[#59c0d9]/10'
                            : 'border-gray-200 hover:border-[#59c0d9]/50'
                        }`}
                        onClick={() => setSelectedBenchPlayer(player)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-900 font-medium">{player.number}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{player.name}</div>
                            <div className="text-xs text-gray-500">{player.position}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={handleCancelSubstitution}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSubstitution}
                disabled={!selectedCourtPlayer || !selectedBenchPlayer}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedCourtPlayer && selectedBenchPlayer
                    ? 'bg-[#59c0d9] text-white hover:bg-[#59c0d9]/90'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirmar Cambio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 