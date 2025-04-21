'use client';

import { useEffect, useState } from 'react';
import { localStorageService } from '@/services/localStorage';
import { livosurService } from '@/services/livosurService';
import { ArrowLeftIcon, TrophyIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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

interface Team {
  id: string;
  name: string;
  division: string;
  players: Player[];
  isOpponent: boolean;
  color: string;
}

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

export default function LeaguePage() {
  const [livosurTeams, setLivosurTeams] = useState<LivosurTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localTeam, setLocalTeam] = useState<Team | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar equipo local
      const allTeams = await localStorageService.getTeams();
      const local = allTeams.find(t => !t.isOpponent);
      setLocalTeam(local || null);

      // Cargar datos de LiVoSur
      const livosurData = await livosurService.getTeams();
      setLivosurTeams(livosurData);
      
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos de la liga');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const livosurData = await livosurService.getTeams();
      setLivosurTeams(livosurData);
      setError(null);
    } catch (err) {
      setError('Error al actualizar los datos de la liga');
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTeamColor = (teamName: string) => {
    const colors: { [key: string]: string } = {
      'SAYAGO': '#1E40AF',
      'CORDON AZUL': '#2563EB',
      'OLIMPIA B': '#FCD34D',
      'PEÑAROL U23': '#FBBF24',
      'CBR S': '#DC2626',
      'UDELAR B': '#7C3AED',
      'LEGADO': '#059669',
      'COUNTRY EL PINAR J': '#0D9488'
    };
    return colors[teamName] || '#6B7280';
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
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <TrophyIcon className="h-8 w-8 text-white" />
                  <div>
                    <h1 className="text-2xl font-bold text-white">LiVoSur</h1>
                    {localTeam?.division && (
                      <span className="text-white/90 text-sm">
                        División {localTeam.division} - Apertura 2025
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ${
                    isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ArrowPathIcon className={`h-5 w-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-white font-medium">Actualizar</span>
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
                      <th className="pb-4">Pos.</th>
                      <th className="pb-4">Equipo</th>
                      <th className="pb-4">PJ</th>
                      <th className="pb-4">PG</th>
                      <th className="pb-4">PP</th>
                      <th className="pb-4">Sets</th>
                      <th className="pb-4">Pts.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livosurTeams.map(team => (
                      <tr 
                        key={team.name} 
                        className={`border-t border-gray-100 ${
                          localTeam?.name === team.name ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="py-4 text-gray-600 font-medium">{team.position}°</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: getTeamColor(team.name) }}
                            />
                            <span className={`${
                              localTeam?.name === team.name ? 'font-semibold' : ''
                            } text-gray-900`}>
                              {team.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">{team.matchesPlayed}</td>
                        <td className="py-4 text-gray-600">{team.matchesWon}</td>
                        <td className="py-4 text-gray-600">{team.matchesLost}</td>
                        <td className="py-4 text-gray-600">
                          {team.setsWon}-{team.setsLost}
                        </td>
                        <td className="py-4 text-gray-900 font-semibold">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 