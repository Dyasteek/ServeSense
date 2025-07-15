'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { localStorageService } from '@/services/localStorage';
import { PlusIcon, PencilIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { getLocalBackup } from '@/utils/localBackup';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
  division: string;
  players: Player[];
  isOpponent: boolean;
}

interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  status: 'pending' | 'completed';
  score?: {
    home: number;
    away: number;
  };
  sets?: {
    home: number;
    away: number;
    points: {
      home: number[];
      away: number[];
    };
  };
}

interface LivosurTeam {
  name: string;
  points: number;
  position: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [session]);

  const loadData = () => {
    try {
      setLoading(true);
      const userId = session?.user?.id;
      if (!userId) throw new Error('No autenticado');
      const backup = getLocalBackup(userId);
      setTeams(backup?.equipos || []);
      setEstadisticas(backup?.estadisticas || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      setTeams([]);
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

  const localTeam = teams.find(team => !team.isOpponent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
            ServeSense
          </h1>
          <p className="text-xl text-center text-gray-600 mb-12">
            Tu asistente personal para el seguimiento de equipos de voleibol
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8">
              <p>{error}</p>
            </div>
          )}

          <div className="mb-12">
            <Link 
              href="/match/live"
              className="block w-full max-w-2xl mx-auto"
            >
              <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#59c0d9] text-white rounded-xl hover:bg-[#59c0d9]/90 transition-colors text-xl font-semibold">
                Iniciar Partido en Vivo
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mi Equipo */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <PencilIcon className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Mi Equipo</h2>
                  </div>
                  <Link href="/team" className="text-white hover:text-white/80">
                    <ArrowRightIcon className="h-6 w-6" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {localTeam ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full shadow-md"
                        style={{ backgroundColor: localTeam.color }}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{localTeam.name}</h3>
                        <p className="text-gray-600">{localTeam.players.length} jugadores</p>
                        {localTeam.division && (
                          <p className="text-sm text-gray-500">División: {localTeam.division}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Últimos Jugadores Agregados</h4>
                      {localTeam.players.slice(0, 3).map(player => (
                        <div key={player.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">#{player.number}</span>
                            <span className="ml-2 text-gray-700">{player.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">{player.position}</span>
                        </div>
                      ))}
                      {localTeam.players.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{localTeam.players.length - 3} jugadores más
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PencilIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700">No has creado tu equipo aún</p>
                    <Link 
                      href="/team"
                      className="mt-4 inline-flex items-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
                    >
                      <PlusIcon className="h-5 w-5" />
                      Crear Equipo
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <PencilIcon className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Estadísticas</h2>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Últimas Estadísticas</h3>
                  <div className="space-y-2">
                    {estadisticas.slice(0, 5).map((stat, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-900 font-medium">{stat.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600 text-sm">{stat.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 