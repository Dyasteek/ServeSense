'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { localStorageService } from '@/services/localStorage';
import { livosurService } from '@/services/livosurService';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon, ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';

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
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMatch, setNewMatch] = useState({
    homeTeamId: '',
    awayTeamId: '',
    date: '',
    status: 'pending' as const
  });
  const [livosurTeams, setLivosurTeams] = useState<LivosurTeam[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsData, matchesData, livosurData] = await Promise.all([
        localStorageService.getTeams(),
        localStorageService.getMatches(),
        livosurService.getTeams()
      ]);
      setTeams(teamsData);
      setMatches(matchesData);
      setLivosurTeams(livosurData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatch = async () => {
    if (!newMatch.homeTeamId || !newMatch.awayTeamId || !newMatch.date) return;

    try {
      const match: Match = {
        id: crypto.randomUUID(),
        homeTeamId: newMatch.homeTeamId,
        awayTeamId: newMatch.awayTeamId,
        date: newMatch.date,
        status: newMatch.status
      };

      await localStorageService.addMatch(match);
      await loadData();
      setNewMatch({
        homeTeamId: '',
        awayTeamId: '',
        date: '',
        status: 'pending'
      });
      setError(null);
    } catch (err) {
      setError('Error al agregar el partido');
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

  const localTeam = teams.find(team => !team.isOpponent);
  const rivalTeams = teams.filter(team => team.isOpponent);

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
              <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#59c0d9] text-white rounded-xl hover:bg-[#59c0d9]/90 transition-colors">
                <PlayIcon className="h-8 w-8" />
                <span className="text-xl font-semibold">Iniciar Partido</span>
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

            {/* Liga */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <PencilIcon className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Liga</h2>
                  </div>
                  <Link href="/league" className="text-white hover:text-white/80">
                    <ArrowRightIcon className="h-6 w-6" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Tabla de Posiciones</h3>
                  <div className="space-y-2">
                    {livosurTeams.slice(0, 4).map(team => (
                      <div key={team.position} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-900 font-medium">{team.position}.</span>
                          <span className="text-gray-900">{team.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600 text-sm">{team.matchesPlayed} PJ</span>
                          <span className="text-gray-600 text-sm">{team.matchesWon} G</span>
                          <span className="text-gray-600 text-sm">{team.matchesLost} P</span>
                          <span className="text-gray-600 font-medium">{team.points} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Partidos */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Partidos</h2>
                  </div>
                  <Link href="/matches" className="text-white hover:text-white/80">
                    <ArrowRightIcon className="h-6 w-6" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Agregar Nuevo Partido</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Equipo Local
                        </label>
                        <select
                          value={newMatch.homeTeamId}
                          onChange={e => setNewMatch({ ...newMatch, homeTeamId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                        >
                          <option value="">Seleccionar equipo</option>
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Equipo Visitante
                        </label>
                        <select
                          value={newMatch.awayTeamId}
                          onChange={e => setNewMatch({ ...newMatch, awayTeamId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                        >
                          <option value="">Seleccionar equipo</option>
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha del Partido
                      </label>
                      <input
                        type="datetime-local"
                        value={newMatch.date}
                        onChange={e => setNewMatch({ ...newMatch, date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                      />
                    </div>
                    <button
                      onClick={handleAddMatch}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
                    >
                      <PlusIcon className="h-5 w-5" />
                      Agregar Partido
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Próximos Partidos</h3>
                  {matches.slice(0, 3).map(match => {
                    const homeTeam = teams.find(t => t.id === match.homeTeamId);
                    const awayTeam = teams.find(t => t.id === match.awayTeamId);
                    const isLocalTeam = homeTeam?.id === localTeam?.id;
                    return (
                      <div
                        key={match.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: homeTeam?.color }}
                            />
                            <span className="font-medium text-gray-900">{homeTeam?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">vs</span>
                            <div
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: awayTeam?.color }}
                            />
                            <span className="font-medium text-gray-900">{awayTeam?.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {new Date(match.date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            match.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-[#59c0d9]/10 text-[#59c0d9]'
                          }`}>
                            {match.status === 'completed' ? 'Finalizado' : 'Pendiente'}
                          </span>
                        </div>
                        {match.score && (
                          <div className="mt-2 text-center text-lg font-bold text-gray-900">
                            {match.score.home} - {match.score.away}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {matches.length === 0 && (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-700">No hay partidos programados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 