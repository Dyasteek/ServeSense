'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, UserGroupIcon, CalendarIcon, ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline';

interface Team {
  id: string;
  name: string;
  color: string;
  maxPlayers: number;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  score: {
    home: number;
    away: number;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teamsResponse, matchesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`)
      ]);

      if (!teamsResponse.ok || !matchesResponse.ok) {
        throw new Error('Error al cargar los datos');
      }

      const teamsData = await teamsResponse.json();
      const matchesData = await matchesResponse.json();

      setTeams(teamsData);
      setMatches(matchesData);
    } catch (error) {
      console.error('Error:', error);
      setError('Hubo un error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    router.push('/team');
  };

  const handleCreateMatch = () => {
    router.push('/matches/new');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programado';
      case 'in_progress':
        return 'En progreso';
      case 'completed':
        return 'Finalizado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ServeSense</h1>
          <p className="text-lg text-gray-600">Sistema de seguimiento de partidos de voleibol</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={handleCreateTeam}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="bg-primary-100 p-3 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Crear Equipo</h3>
              <p className="text-sm text-gray-500">Registra un nuevo equipo con sus jugadores</p>
            </div>
            <PlusIcon className="h-5 w-5 text-gray-400 ml-auto" />
          </button>

          <button
            onClick={handleCreateMatch}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="bg-primary-100 p-3 rounded-lg">
              <CalendarIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Nuevo Partido</h3>
              <p className="text-sm text-gray-500">Programa y registra un nuevo partido</p>
            </div>
            <PlusIcon className="h-5 w-5 text-gray-400 ml-auto" />
          </button>

          <button
            onClick={() => router.push('/league')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="bg-primary-100 p-3 rounded-lg">
              <TrophyIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Liga</h3>
              <p className="text-sm text-gray-500">Gestiona los equipos rivales de la temporada</p>
            </div>
          </button>
        </div>

        {/* Teams Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Mis Equipos</h2>
            <button
              onClick={handleCreateTeam}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver todos
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.slice(0, 3).map((team) => (
              <div
                key={team.id}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.maxPlayers} jugadores</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/team/${team.id}`)}
                  className="w-full bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Ver detalles
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Matches Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Próximos Partidos</h2>
            <button
              onClick={() => router.push('/matches')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver todos
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {matches.slice(0, 5).map((match) => (
              <div
                key={match.id}
                className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/matches/${match.id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: match.homeTeam.color }}
                      />
                      <span className="font-medium">{match.homeTeam.name}</span>
                    </div>
                    <span className="text-gray-400">vs</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: match.awayTeam.color }}
                      />
                      <span className="font-medium">{match.awayTeam.name}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(match.status)}`}>
                    {getStatusText(match.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(match.date).toLocaleDateString()}</span>
                  {match.status === 'completed' && (
                    <span className="font-medium">
                      {match.score.home} - {match.score.away}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 