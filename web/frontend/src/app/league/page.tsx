'use client';

import { useEffect, useState } from 'react';
import { localStorageService } from '@/services/localStorage';
import { ArrowLeftIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  players: Player[];
  isOpponent: boolean;
  position: number;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
}

export default function LeaguePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDivision, setEditingDivision] = useState(false);
  const [division, setDivision] = useState('');

  useEffect(() => {
    loadTeams();
    loadDivision();
  }, []);

  const loadDivision = async () => {
    try {
      const leagueInfo = await localStorageService.getLeagueInfo();
      setDivision(leagueInfo.division);
    } catch (err) {
      console.error('Error al cargar la división:', err);
    }
  };

  const handleUpdateDivision = async () => {
    try {
      await localStorageService.updateLeagueInfo({ ...await localStorageService.getLeagueInfo(), division });
      setEditingDivision(false);
    } catch (err) {
      setError('Error al actualizar la división');
      console.error(err);
    }
  };

  const loadTeams = async () => {
    try {
      setLoading(true);
      const allTeams = await localStorageService.getTeams();
      const rivalTeams = allTeams.filter(team => team.isOpponent);
      
      // Ordenar equipos por puntos (descendente) y diferencia de sets
      const sortedTeams = rivalTeams.sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        const aSetDiff = a.setsWon - a.setsLost;
        const bSetDiff = b.setsWon - b.setsLost;
        return bSetDiff - aSetDiff;
      });

      // Asignar posiciones
      const teamsWithPosition = sortedTeams.map((team, index) => ({
        ...team,
        position: index + 1
      }));

      setTeams(teamsWithPosition);
      setError(null);
    } catch (err) {
      setError('Error al cargar los equipos');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-white">LiVoSur</h1>
                  {editingDivision ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        className="bg-white/20 text-white placeholder-white/50 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="División"
                      />
                      <button
                        onClick={handleUpdateDivision}
                        className="text-white hover:text-white/80 transition-colors"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingDivision(false);
                          loadDivision();
                        }}
                        className="text-white hover:text-white/80 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 font-light text-2xl">{division}</span>
                      <button
                        onClick={() => setEditingDivision(true)}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
                <a
                  href="/"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </a>
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
                    {teams.map(team => (
                      <tr key={team.id} className="border-t border-gray-100">
                        <td className="py-4 text-gray-600 font-medium">{team.position}°</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: team.color }}
                            />
                            <span className="text-gray-900">{team.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">{team.matchesPlayed}</td>
                        <td className="py-4 text-gray-600">{team.matchesWon}</td>
                        <td className="py-4 text-gray-600">{team.matchesLost}</td>
                        <td className="py-4 text-gray-600">
                          {team.setsWon}-{team.setsLost}
                        </td>
                        <td className="py-4 text-gray-600 font-medium">{team.points}</td>
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