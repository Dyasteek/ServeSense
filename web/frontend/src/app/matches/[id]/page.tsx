'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { localStorageService } from '@/services/localStorage';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

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

export default function MatchDetailsPage() {
  const { id } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMatchDetails();
  }, [id]);

  const loadMatchDetails = async () => {
    try {
      setLoading(true);
      const [matches, teamsData] = await Promise.all([
        localStorageService.getMatches(),
        localStorageService.getTeams()
      ]);
      
      const matchData = matches.find(m => m.id === id);
      if (!matchData) {
        throw new Error('Partido no encontrado');
      }

      setMatch(matchData);
      setTeams(teamsData as Team[]);
      setError(null);
    } catch (err) {
      setError('Error al cargar los detalles del partido');
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

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Partido no encontrado</h1>
                <Link
                  href="/matches"
                  className="inline-flex items-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  Volver a Partidos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);
  const localTeam = teams.find(t => !t.isOpponent);
  const isLocalTeam = homeTeam?.id === localTeam?.id;
  const matchResult = match.status === 'completed' && match.score ? 
    (isLocalTeam ? 
      (match.score.home > match.score.away ? 'Ganado' : 'Perdido') : 
      (match.score.away > match.score.home ? 'Ganado' : 'Perdido')) : 
    null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Volver a Partidos
          </Link>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Detalles del Partido</h1>
                {matchResult && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    matchResult === 'Ganado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {matchResult}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full shadow-md"
                    style={{ backgroundColor: homeTeam?.color }}
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{homeTeam?.name}</h2>
                    <p className="text-gray-600">{homeTeam?.division}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full shadow-md"
                    style={{ backgroundColor: awayTeam?.color }}
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{awayTeam?.name}</h2>
                    <p className="text-gray-600">{awayTeam?.division}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Fecha y Hora</p>
                      <p className="font-medium text-gray-900">
                        {new Date(match.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <p className={`font-medium ${
                        match.status === 'completed' 
                          ? 'text-green-600' 
                          : 'text-[#59c0d9]'
                      }`}>
                        {match.status === 'completed' ? 'Finalizado' : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                </div>

                {match.score && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultado Final</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">
                        {match.score.home} - {match.score.away}
                      </div>
                    </div>
                  </div>
                )}

                {match.sets && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sets</h3>
                    <div className="space-y-2">
                      {match.sets.points.home.map((points, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-900">Set {index + 1}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-900">{points}</span>
                            <span className="text-gray-400">-</span>
                            <span className="text-gray-900">{match.sets?.points.away[index]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 