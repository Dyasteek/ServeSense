'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Team {
  _id: string;
  name: string;
  color: string;
}

interface Match {
  _id: string;
  date: string;
  homeTeam: Team;
  awayTeam: Team;
  sets: {
    homeTeamScore: number;
    awayTeamScore: number;
    duration: number;
  }[];
  finalScore: {
    homeTeam: number;
    awayTeam: number;
  };
  status: 'scheduled' | 'in_progress' | 'completed';
  stats: {
    homeTeam: {
      serves: { total: number; successful: number; errors: number; points: number };
      attacks: { total: number; successful: number; errors: number; points: number };
      blocks: { total: number; successful: number; errors: number; points: number };
      defenses: { total: number; successful: number; errors: number };
    };
    awayTeam: {
      serves: { total: number; successful: number; errors: number; points: number };
      attacks: { total: number; successful: number; errors: number; points: number };
      blocks: { total: number; successful: number; errors: number; points: number };
      defenses: { total: number; successful: number; errors: number };
    };
  };
}

export default function MatchesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/matches');
      if (!response.ok) {
        throw new Error('Error al cargar los partidos');
      }
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Hubo un error al cargar los partidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programado';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando partidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={loadMatches}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Partidos</h1>
        <button 
          onClick={() => router.push('/matches/new')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Partido
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div
            key={match._id}
            onClick={() => router.push(`/matches/${match._id}`)}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Fecha: {new Date(match.date).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(match.status)}`}>
                {getStatusText(match.status)}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{match.homeTeam.name}</span>
                <span className="font-semibold">
                  {match.finalScore.homeTeam} - {match.finalScore.awayTeam}
                </span>
                <span className="text-gray-600">{match.awayTeam.name}</span>
              </div>
              {match.sets.length > 0 && (
                <div className="text-sm text-gray-500">
                  Sets: {match.sets.map((set, index) => (
                    <span key={index} className="mx-1">
                      {set.homeTeamScore}-{set.awayTeamScore}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 