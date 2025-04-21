'use client';

import { useEffect, useState } from 'react';
import { localStorageService } from '@/services/localStorage';
import { livosurService, LivosurMatch } from '@/services/livosurService';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function MatchesPage() {
  const [matches, setMatches] = useState<LivosurMatch[]>([]);
  const [displayedMatches, setDisplayedMatches] = useState<LivosurMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(4);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const matchesData = await livosurService.getMatches();
      // Ordenar partidos por fecha (más recientes primero)
      const sortedMatches = matchesData.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
      setMatches(sortedMatches);
      setDisplayedMatches(sortedMatches.slice(0, 4));
      setCurrentIndex(4);
      setError(null);
    } catch (err) {
      setError('Error al cargar los partidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const matchesData = await livosurService.getMatches();
      const sortedMatches = matchesData.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
      setMatches(sortedMatches);
      setDisplayedMatches(sortedMatches.slice(0, 4));
      setCurrentIndex(4);
      setError(null);
    } catch (err) {
      setError('Error al actualizar los partidos');
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMoreMatches = () => {
    const nextIndex = currentIndex + 4;
    const newMatches = matches.slice(currentIndex, nextIndex);
    setDisplayedMatches([...displayedMatches, ...newMatches]);
    setCurrentIndex(nextIndex);
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
                <div>
                  <h1 className="text-2xl font-bold text-white">Partidos</h1>
                  <p className="text-white/90 text-sm">Temporada Apertura 2025</p>
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

              <div className="space-y-6">
                {displayedMatches.map((match, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{match.date}</span>
                        <span className="text-sm text-gray-500">{match.time}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        match.status === 'played' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {match.status === 'played' ? 'Jugado' : 'Pendiente'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-right">
                        <span className="font-medium text-gray-900">{match.homeTeam}</span>
                      </div>
                      <div className="text-center">
                        {match.score ? (
                          <span className="text-2xl font-bold text-gray-900">{match.score}</span>
                        ) : (
                          <span className="text-gray-400">vs</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{match.awayTeam}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Sede:</span> {match.venue}
                      </div>
                      {match.referees.length > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Árbitros:</span> {match.referees.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {currentIndex < matches.length && (
                  <div className="flex justify-center">
                    <button
                      onClick={loadMoreMatches}
                      className="px-6 py-3 bg-[#59c0d9] text-white rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
                    >
                      Más partidos
                    </button>
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