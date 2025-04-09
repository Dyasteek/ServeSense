'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Team {
  id: string;
  name: string;
  color: string;
}

interface MatchStats {
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
  defenses: {
    total: number;
    successful: number;
    errors: number;
  };
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
  stats: {
    homeTeam: MatchStats;
    awayTeam: MatchStats;
  };
}

export default function MatchPage() {
  const { id } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMatch();
  }, [id]);

  const loadMatch = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${id}`);
      if (!response.ok) {
        throw new Error('Error al cargar el partido');
      }
      const data = await response.json();
      setMatch(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Hubo un error al cargar el partido');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishMatch = async () => {
    if (!match) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${id}/finish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: match.score
        }),
      });

      if (!response.ok) {
        throw new Error('Error al finalizar el partido');
      }

      const updatedMatch = await response.json();
      setMatch(updatedMatch);
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al finalizar el partido');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error || 'Partido no encontrado'}</p>
        </div>
      </div>
    );
  }

  const renderStats = (stats: MatchStats, teamColor: string) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Saque</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.serves.total}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Exitosos</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.serves.successful}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Errores</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.serves.errors}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Puntos</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.serves.points}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Ataque</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.attacks.total}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Exitosos</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.attacks.successful}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Errores</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.attacks.errors}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Puntos</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.attacks.points}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Bloqueo</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.blocks.total}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Exitosos</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.blocks.successful}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Errores</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.blocks.errors}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Puntos</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.blocks.points}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Defensa</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.defenses.total}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Exitosos</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.defenses.successful}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Errores</p>
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{stats.defenses.errors}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalles del Partido</h1>
          <p className="text-gray-600">
            {new Date(match.date).toLocaleDateString()} - {match.status === 'completed' ? 'Finalizado' : 'En progreso'}
          </p>
        </div>
        {match.status === 'in_progress' && (
          <button
            onClick={handleFinishMatch}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
          >
            <CheckIcon className="h-5 w-5" />
            Finalizar Partido
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: match.homeTeam.color }}>
            {match.homeTeam.name}
          </h2>
          {renderStats(match.stats.homeTeam, match.homeTeam.color)}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: match.awayTeam.color }}>
            {match.awayTeam.name}
          </h2>
          {renderStats(match.stats.awayTeam, match.awayTeam.color)}
        </div>
      </div>
    </div>
  );
} 