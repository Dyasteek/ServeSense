'use client';

import { useState, useEffect } from 'react';
import { localStorageService } from '@/services/localStorage';
import { useSession } from 'next-auth/react';
import { getLocalBackup } from '@/utils/localBackup';
import { useRef } from 'react';
import { io as socketIOClient } from 'socket.io-client';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  stats?: {
    serves: {
      total: number;
      successful: number;
      errors: number;
      points: number;
    };
    attacks: {
      total: number;
      successful: number;
      errors: number;
      points: number;
    };
    blocks: {
      total: number;
      successful: number;
      errors: number;
      points: number;
    };
  };
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

const POSITIONS = [
  'Armador',
  'Central',
  'Punta',
  'Opuesto',
  'Libero'
];

export default function StatsScreen() {
  const { data: session } = useSession();
  const [team, setTeam] = useState<Team | null>(null);
  const [estadisticas, setEstadisticas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    loadTeam();
    // eslint-disable-next-line
  }, [session]);

  // Conexión a Socket.IO para tiempo real
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = socketIOClient(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    }
    const socket = socketRef.current;
    socket.on('stats-updated', ({ playerId, stats }: { playerId: any, stats: any }) => {
      setTeam(prevTeam => {
        if (!prevTeam) return prevTeam;
        const updatedPlayers = prevTeam.players.map(p => {
          if (p.id === playerId) {
            return {
              ...p,
              stats: {
                ...p.stats,
                ...stats
              }
            };
          }
          return p;
        });
        return { ...prevTeam, players: updatedPlayers };
      });
    });
    return () => {
      socket.off('stats-updated');
    };
  }, []);

  const loadTeam = () => {
    try {
      setLoading(true);
      const userId = session?.user?.id;
      if (!userId) throw new Error('No autenticado');
      const backup = getLocalBackup(userId);
      if (backup && backup.equipos.length > 0) {
        setTeam(backup.equipos[0]);
        setEstadisticas(backup.estadisticas || []);
      } else {
        setTeam(null);
        setEstadisticas([]);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar el equipo');
      setTeam(null);
      setEstadisticas([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-600">Crea un equipo para ver las estadísticas de tus jugadores</p>
        </div>
      </div>
    );
  }

  const playersByPosition = POSITIONS.reduce((acc, position) => {
    acc[position] = team.players.filter(player => player.position === position);
    return acc;
  }, {} as Record<string, Player[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Estadísticas de {team.name}</h1>
                  <p className="text-white/80">División: {team.division}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {estadisticas.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas Generales</h2>
                  <ul className="list-disc pl-6">
                    {estadisticas.map(est => (
                      <li key={est.id} className="mb-1">
                        <span className="font-medium text-gray-700">{est.descripcion}:</span> <span className="text-gray-900">{est.valor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {POSITIONS.map((position) => (
                <div key={position} className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{position}s</h2>
                  {playersByPosition[position].length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Jugador
                            </th>
                            {position === 'Libero' ? (
                              <>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Recepción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Defensa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Apoyo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Armado
                                </th>
                              </>
                            ) : position === 'Armador' ? (
                              <>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Saques
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ataques
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bloqueos
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Armado
                                </th>
                              </>
                            ) : position === 'Punta' ? (
                              <>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Saques
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ataques
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bloqueos
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Defensa/Recepción
                                </th>
                              </>
                            ) : position === 'Central' || position === 'Opuesto' ? (
                              <>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Saques
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ataques
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bloqueos
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Apoyo
                                </th>
                              </>
                            ) : null}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {playersByPosition[position].map((player) => (
                            <tr key={player.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-gray-900 font-medium">{player.number}</span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{player.name}</div>
                                  </div>
                                </div>
                              </td>
                              {position === 'Libero' ? (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.serves ? (
                                      <div>
                                        <div>Total: {player.stats.serves.total}</div>
                                        <div>Exitosos: {player.stats.serves.successful}</div>
                                        <div>Errores: {player.stats.serves.errors}</div>
                                        <div>Puntos: {player.stats.serves.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.attacks ? (
                                      <div>
                                        <div>Total: {player.stats.attacks.total}</div>
                                        <div>Exitosos: {player.stats.attacks.successful}</div>
                                        <div>Errores: {player.stats.attacks.errors}</div>
                                        <div>Puntos: {player.stats.attacks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.blocks ? (
                                      <div>
                                        <div>Total: {player.stats.blocks.total}</div>
                                        <div>Exitosos: {player.stats.blocks.successful}</div>
                                        <div>Errores: {player.stats.blocks.errors}</div>
                                        <div>Puntos: {player.stats.blocks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.blocks ? (
                                      <div>
                                        <div>Total: {player.stats.blocks.total}</div>
                                        <div>Exitosos: {player.stats.blocks.successful}</div>
                                        <div>Errores: {player.stats.blocks.errors}</div>
                                        <div>Puntos: {player.stats.blocks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                </>
                              ) : position === 'Armador' ? (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.serves ? (
                                      <div>
                                        <div>Total: {player.stats.serves.total}</div>
                                        <div>Exitosos: {player.stats.serves.successful}</div>
                                        <div>Errores: {player.stats.serves.errors}</div>
                                        <div>Puntos: {player.stats.serves.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.attacks ? (
                                      <div>
                                        <div>Total: {player.stats.attacks.total}</div>
                                        <div>Exitosos: {player.stats.attacks.successful}</div>
                                        <div>Errores: {player.stats.attacks.errors}</div>
                                        <div>Puntos: {player.stats.attacks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.blocks ? (
                                      <div>
                                        <div>Total: {player.stats.blocks.total}</div>
                                        <div>Exitosos: {player.stats.blocks.successful}</div>
                                        <div>Errores: {player.stats.blocks.errors}</div>
                                        <div>Puntos: {player.stats.blocks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.blocks ? (
                                      <div>
                                        <div>Total: {player.stats.blocks.total}</div>
                                        <div>Exitosos: {player.stats.blocks.successful}</div>
                                        <div>Errores: {player.stats.blocks.errors}</div>
                                        <div>Puntos: {player.stats.blocks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                </>
                              ) : position === 'Punta' ? (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.serves ? (
                                      <div>
                                        <div>Total: {player.stats.serves.total}</div>
                                        <div>Exitosos: {player.stats.serves.successful}</div>
                                        <div>Errores: {player.stats.serves.errors}</div>
                                        <div>Puntos: {player.stats.serves.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.attacks ? (
                                      <div>
                                        <div>Total: {player.stats.attacks.total}</div>
                                        <div>Exitosos: {player.stats.attacks.successful}</div>
                                        <div>Errores: {player.stats.attacks.errors}</div>
                                        <div>Puntos: {player.stats.attacks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.blocks ? (
                                      <div>
                                        <div>Total: {player.stats.blocks.total}</div>
                                        <div>Exitosos: {player.stats.blocks.successful}</div>
                                        <div>Errores: {player.stats.blocks.errors}</div>
                                        <div>Puntos: {player.stats.blocks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.blocks ? (
                                      <div>
                                        <div>Total: {player.stats.blocks.total}</div>
                                        <div>Exitosos: {player.stats.blocks.successful}</div>
                                        <div>Errores: {player.stats.blocks.errors}</div>
                                        <div>Puntos: {player.stats.blocks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                </>
                              ) : position === 'Central' || position === 'Opuesto' ? (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.serves ? (
                                      <div>
                                        <div>Total: {player.stats.serves.total}</div>
                                        <div>Exitosos: {player.stats.serves.successful}</div>
                                        <div>Errores: {player.stats.serves.errors}</div>
                                        <div>Puntos: {player.stats.serves.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.attacks ? (
                                      <div>
                                        <div>Total: {player.stats.attacks.total}</div>
                                        <div>Exitosos: {player.stats.attacks.successful}</div>
                                        <div>Errores: {player.stats.attacks.errors}</div>
                                        <div>Puntos: {player.stats.attacks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.blocks ? (
                                      <div>
                                        <div>Total: {player.stats.blocks.total}</div>
                                        <div>Exitosos: {player.stats.blocks.successful}</div>
                                        <div>Errores: {player.stats.blocks.errors}</div>
                                        <div>Puntos: {player.stats.blocks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {player.stats?.blocks ? (
                                      <div>
                                        <div>Total: {player.stats.blocks.total}</div>
                                        <div>Exitosos: {player.stats.blocks.successful}</div>
                                        <div>Errores: {player.stats.blocks.errors}</div>
                                        <div>Puntos: {player.stats.blocks.points}</div>
                                      </div>
                                    ) : (
                                      'Sin datos'
                                    )}
                                  </td>
                                </>
                              ) : null}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay jugadores en esta posición</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 