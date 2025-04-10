'use client';

import { useEffect, useState } from 'react';
import { localStorageService } from '@/services/localStorage';
import { PlusIcon, CalendarIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  division: string;
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

interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  isFriendly: boolean;
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

interface MatchStats {
  homeTeam: {
    name: string;
    color: string;
    sets: number;
    points: number[];
    cards: {
      yellow: string[];
      red: string[];
    };
    players: {
      name: string;
      number: number;
      position: string;
      points: number;
      serves: number;
      blocks: number;
      attacks: number;
    }[];
  };
  awayTeam: {
    name: string;
    color: string;
    sets: number;
    points: number[];
    cards: {
      yellow: string[];
      red: string[];
    };
  };
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFriendlyModal, setShowFriendlyModal] = useState(false);
  const [showFixturModal, setShowFixturModal] = useState(false);
  const [newFriendly, setNewFriendly] = useState({
    date: '',
    homeTeam: '',
    awayTeam: ''
  });
  const [newFixtur, setNewFixtur] = useState({
    date: '',
    isHome: true,
    rivalTeam: ''
  });
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesData, teamsData] = await Promise.all([
        localStorageService.getMatches(),
        localStorageService.getTeams()
      ]);
      
      setTeams(teamsData);
      const matchesWithFriendly = matchesData.map(match => ({
        ...match,
        isFriendly: match.isFriendly ?? false
      }));
      setMatches(matchesWithFriendly);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriendly = async () => {
    if (!newFriendly.date || !newFriendly.homeTeam || !newFriendly.awayTeam) return;

    try {
      const newMatch: Omit<Match, 'id'> = {
        homeTeamId: newFriendly.homeTeam,
        awayTeamId: newFriendly.awayTeam,
        date: newFriendly.date,
        status: 'pending',
        isFriendly: true
      };

      await localStorageService.addMatch(newMatch);
      setShowFriendlyModal(false);
      setNewFriendly({ date: '', homeTeam: '', awayTeam: '' });
      loadData();
    } catch (err) {
      setError('Error al agregar el amistoso');
      console.error(err);
    }
  };

  const handleGenerateFixtur = async () => {
    try {
      // Aquí iría la lógica para generar el fixtur
      // Por ahora solo mostramos un mensaje
      alert('Generando fixtur...');
    } catch (err) {
      setError('Error al generar el fixtur');
      console.error(err);
    }
  };

  const handleAddFixtur = async () => {
    if (!newFixtur.date || !newFixtur.rivalTeam) {
      setError('Por favor complete todos los campos');
      return;
    }

    try {
      const localTeam = teams.find(team => !team.isOpponent);
      if (!localTeam) {
        setError('No se encontró el equipo local. Por favor, asegúrese de que existe un equipo registrado como local.');
        return;
      }

      const rivalTeam = teams.find(team => team.id === newFixtur.rivalTeam);
      if (!rivalTeam) {
        setError('No se encontró el equipo rival');
        return;
      }

      const newMatch: Omit<Match, 'id'> = {
        homeTeamId: newFixtur.isHome ? localTeam.id : rivalTeam.id,
        awayTeamId: newFixtur.isHome ? rivalTeam.id : localTeam.id,
        date: newFixtur.date,
        status: 'pending',
        isFriendly: false,
        sets: {
          home: 0,
          away: 0,
          points: {
            home: [],
            away: []
          }
        }
      };

      await localStorageService.addMatch(newMatch);
      setShowFixturModal(false);
      setNewFixtur({ date: '', isHome: true, rivalTeam: '' });
      loadData();
    } catch (err) {
      setError('Error al agregar el partido al fixtur');
      console.error(err);
    }
  };

  const handleUpdateMatchStatus = async (match: Match, newStatus: Match['status']) => {
    try {
      const updatedMatch = { ...match, status: newStatus };
      await localStorageService.updateMatch(updatedMatch);
      setMatches(matches.map(m => m.id === match.id ? updatedMatch : m));
      setEditingMatch(null);
    } catch (err) {
      setError('Error al actualizar el estado del partido');
      console.error(err);
    }
  };

  const handleMatchClick = (match: Match) => {
    const homeTeam = teams.find(t => t.id === match.homeTeamId);
    const awayTeam = teams.find(t => t.id === match.awayTeamId);

    if (!homeTeam || !awayTeam) return;

    setMatchStats({
      homeTeam: {
        name: homeTeam.name,
        color: homeTeam.color,
        sets: match.sets?.home || 0,
        points: match.sets?.points.home || [],
        cards: {
          yellow: homeTeam.players
            .filter(p => p.yellowCards > 0)
            .map(p => p.name),
          red: homeTeam.players
            .filter(p => p.redCards > 0)
            .map(p => p.name)
        },
        players: homeTeam.players.map(player => ({
          name: player.name,
          number: player.number,
          position: player.position,
          points: 0, // SE mostrará si no hay estadísticas
          serves: 0, // SE mostrará si no hay estadísticas
          blocks: 0, // SE mostrará si no hay estadísticas
          attacks: 0  // SE mostrará si no hay estadísticas
        }))
      },
      awayTeam: {
        name: awayTeam.name,
        color: awayTeam.color,
        sets: match.sets?.away || 0,
        points: match.sets?.points.away || [],
        cards: {
          yellow: awayTeam.players
            .filter(p => p.yellowCards > 0)
            .map(p => p.name),
          red: awayTeam.players
            .filter(p => p.redCards > 0)
            .map(p => p.name)
        }
      }
    });
    setSelectedMatch(match);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#59c0d9]"></div>
      </div>
    );
  }

  const nextMatch = matches
    .filter(match => match.status === 'pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Fixtur</h1>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleGenerateFixtur}
                    className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <CalendarIcon className="h-5 w-5" />
                    Generar Fixtur
                  </button>
                  <button
                    onClick={() => setShowFixturModal(true)}
                    className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Agregar Partido
                  </button>
                  <button
                    onClick={() => setShowFriendlyModal(true)}
                    className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Amistoso
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Próximo Partido */}
              {nextMatch && (
                <div className="mb-8 bg-gray-50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximo Partido</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: teams.find(t => t.id === nextMatch.homeTeamId)?.color }}
                        />
                        <span className="text-gray-900">
                          {teams.find(t => t.id === nextMatch.homeTeamId)?.name}
                        </span>
                      </div>
                      <span className="text-gray-500">vs</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: teams.find(t => t.id === nextMatch.awayTeamId)?.color }}
                        />
                        <span className="text-gray-900">
                          {teams.find(t => t.id === nextMatch.awayTeamId)?.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-600">
                      {new Date(nextMatch.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Partidos */}
              <div className="space-y-4">
                {matches.map(match => (
                  <div
                    key={match.id}
                    onClick={() => handleMatchClick(match)}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: teams.find(t => t.id === match.homeTeamId)?.color }}
                        />
                        <span className="text-gray-900">
                          {teams.find(t => t.id === match.homeTeamId)?.name}
                        </span>
                      </div>
                      <span className="text-gray-500">vs</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: teams.find(t => t.id === match.awayTeamId)?.color }}
                        />
                        <span className="text-gray-900">
                          {teams.find(t => t.id === match.awayTeamId)?.name}
                        </span>
                      </div>
                      {match.isFriendly && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Amistoso
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-gray-600">
                        {new Date(match.date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {editingMatch?.id === match.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingMatch.status}
                            onChange={(e) => handleUpdateMatchStatus(editingMatch, e.target.value as Match['status'])}
                            className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                          >
                            <option value="pending" className="text-yellow-600">Pendiente</option>
                            <option value="completed" className="text-green-600">Jugado</option>
                            <option value="cancelled" className="text-red-600">Cancelado</option>
                          </select>
                          <button
                            onClick={() => setEditingMatch(null)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <PlusIcon className="h-5 w-5 rotate-45" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-lg text-sm font-medium ${
                              match.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : match.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {match.status === 'pending'
                              ? 'Pendiente'
                              : match.status === 'completed'
                              ? 'Jugado'
                              : 'Cancelado'}
                          </span>
                          <button
                            onClick={() => setEditingMatch(match)}
                            className="text-[#59c0d9] hover:text-[#59c0d9]/80"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Amistoso */}
      {showFriendlyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Agregar Amistoso</h2>
                <button
                  onClick={() => setShowFriendlyModal(false)}
                  className="text-white hover:text-white/80"
                >
                  <PlusIcon className="h-6 w-6 rotate-45" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={newFriendly.date}
                    onChange={e => setNewFriendly({ ...newFriendly, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipo Local
                  </label>
                  <select
                    value={newFriendly.homeTeam}
                    onChange={e => setNewFriendly({ ...newFriendly, homeTeam: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                    required
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
                    value={newFriendly.awayTeam}
                    onChange={e => setNewFriendly({ ...newFriendly, awayTeam: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                    required
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

              <div className="mt-8">
                <button
                  onClick={handleAddFriendly}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
                >
                  Agregar Amistoso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fixtur */}
      {showFixturModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Agregar Partido al Fixtur</h2>
                <button
                  onClick={() => {
                    setShowFixturModal(false);
                    setNewFixtur({ date: '', isHome: true, rivalTeam: '' });
                    setError(null);
                  }}
                  className="text-white hover:text-white/80"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={newFixtur.date}
                    onChange={e => {
                      setNewFixtur({ ...newFixtur, date: e.target.value });
                      setError(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localía
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={newFixtur.isHome}
                        onChange={() => {
                          setNewFixtur({ ...newFixtur, isHome: true });
                          setError(null);
                        }}
                        className="text-[#59c0d9] focus:ring-[#59c0d9]"
                      />
                      <span>Local</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!newFixtur.isHome}
                        onChange={() => {
                          setNewFixtur({ ...newFixtur, isHome: false });
                          setError(null);
                        }}
                        className="text-[#59c0d9] focus:ring-[#59c0d9]"
                      />
                      <span>Visitante</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rival
                  </label>
                  <select
                    value={newFixtur.rivalTeam}
                    onChange={e => {
                      setNewFixtur({ ...newFixtur, rivalTeam: e.target.value });
                      setError(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9]"
                    required
                  >
                    <option value="">Seleccionar rival</option>
                    {teams
                      .filter(team => team.isOpponent)
                      .map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleAddFixtur}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
                >
                  Agregar al Fixtur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Estadísticas */}
      {selectedMatch && matchStats && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-center relative">
                <h2 className="text-xl font-bold text-gray-900">Estadísticas del Partido</h2>
                <button
                  onClick={() => {
                    setSelectedMatch(null);
                    setMatchStats(null);
                  }}
                  className="absolute right-0 text-gray-900 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Equipo Local */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: matchStats.homeTeam.color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {matchStats.homeTeam.name}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Sets</h4>
                      <div className="text-2xl font-bold text-gray-900">
                        {matchStats.homeTeam.sets}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Puntos por Set</h4>
                      <div className="flex gap-2">
                        {matchStats.homeTeam.points.map((points, index) => (
                          <div
                            key={index}
                            className="px-3 py-1 bg-gray-100 rounded-lg text-gray-900"
                          >
                            Set {index + 1}: {points}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tarjetas</h4>
                      {matchStats.homeTeam.cards.yellow.length > 0 && (
                        <div className="mb-2">
                          <span className="text-yellow-600 font-medium">Amarillas:</span>
                          <ul className="list-disc list-inside text-gray-600">
                            {matchStats.homeTeam.cards.yellow.map((player, index) => (
                              <li key={index}>{player}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {matchStats.homeTeam.cards.red.length > 0 && (
                        <div>
                          <span className="text-red-600 font-medium">Rojas:</span>
                          <ul className="list-disc list-inside text-gray-600">
                            {matchStats.homeTeam.cards.red.map((player, index) => (
                              <li key={index}>{player}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Estadísticas por Jugador</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saque</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bloqueo</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ataque</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {matchStats.homeTeam.players.map((player, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{player.number}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{player.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{player.position}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{player.points || 'SE'}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{player.serves || 'SE'}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{player.blocks || 'SE'}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{player.attacks || 'SE'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipo Visitante */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: matchStats.awayTeam.color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {matchStats.awayTeam.name}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Sets</h4>
                      <div className="text-2xl font-bold text-gray-900">
                        {matchStats.awayTeam.sets}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Puntos por Set</h4>
                      <div className="flex gap-2">
                        {matchStats.awayTeam.points.map((points, index) => (
                          <div
                            key={index}
                            className="px-3 py-1 bg-gray-100 rounded-lg text-gray-900"
                          >
                            Set {index + 1}: {points}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tarjetas</h4>
                      {matchStats.awayTeam.cards.yellow.length > 0 && (
                        <div className="mb-2">
                          <span className="text-yellow-600 font-medium">Amarillas:</span>
                          <ul className="list-disc list-inside text-gray-600">
                            {matchStats.awayTeam.cards.yellow.map((player, index) => (
                              <li key={index}>{player}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {matchStats.awayTeam.cards.red.length > 0 && (
                        <div>
                          <span className="text-red-600 font-medium">Rojas:</span>
                          <ul className="list-disc list-inside text-gray-600">
                            {matchStats.awayTeam.cards.red.map((player, index) => (
                              <li key={index}>{player}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 