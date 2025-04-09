'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Team {
  _id: string;
  name: string;
  color: string;
}

interface NewMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
}

export default function NewMatchPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMatch, setNewMatch] = useState<NewMatch>({
    date: new Date().toISOString().split('T')[0],
    homeTeam: '',
    awayTeam: ''
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/teams');
      if (!response.ok) {
        throw new Error('Error al cargar los equipos');
      }
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Hubo un error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!newMatch.homeTeam || !newMatch.awayTeam) {
        throw new Error('Debes seleccionar ambos equipos');
      }

      if (newMatch.homeTeam === newMatch.awayTeam) {
        throw new Error('Los equipos no pueden ser iguales');
      }

      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMatch),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el partido');
      }

      router.push('/matches');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Hubo un error al crear el partido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Partido</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Fecha del Partido
            </label>
            <input
              type="date"
              id="date"
              value={newMatch.date}
              onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="homeTeam" className="block text-sm font-medium text-gray-700">
              Equipo Local
            </label>
            <select
              id="homeTeam"
              value={newMatch.homeTeam}
              onChange={(e) => setNewMatch({ ...newMatch, homeTeam: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Selecciona un equipo</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="awayTeam" className="block text-sm font-medium text-gray-700">
              Equipo Visitante
            </label>
            <select
              id="awayTeam"
              value={newMatch.awayTeam}
              onChange={(e) => setNewMatch({ ...newMatch, awayTeam: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Selecciona un equipo</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateMatch}
              disabled={!newMatch.homeTeam || !newMatch.awayTeam || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Partido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 