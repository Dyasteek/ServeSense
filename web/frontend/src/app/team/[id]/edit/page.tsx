'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { localStorageService } from '@/services/localStorage';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

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
}

export default function EditPlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlayerDetails();
  }, [id]);

  const loadPlayerDetails = async () => {
    try {
      setLoading(true);
      const teams = await localStorageService.getTeams();
      const teamWithPlayer = teams.find(t => 
        t.players.some(p => p.id === id)
      );
      
      if (!teamWithPlayer) {
        throw new Error('Jugador no encontrado');
      }

      const playerData = teamWithPlayer.players.find(p => p.id === id);
      if (!playerData) {
        throw new Error('Jugador no encontrado');
      }

      setTeam(teamWithPlayer);
      setPlayer(playerData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los detalles del jugador');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player || !team) return;

    try {
      setSaving(true);
      const updatedTeam = {
        ...team,
        players: team.players.map(p => 
          p.id === player.id ? player : p
        )
      };

      await localStorageService.updateTeam(updatedTeam);
      router.push(`/team/${id}`);
    } catch (err) {
      setError('Error al guardar los cambios');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#59c0d9]"></div>
      </div>
    );
  }

  if (!player || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Jugador no encontrado</h1>
                <Link
                  href="/team"
                  className="inline-flex items-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  Volver al Equipo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/team/${id}`}
            className="inline-flex items-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors mb-6"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Volver al Jugador
          </Link>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <h1 className="text-2xl font-bold text-white">Editar Jugador</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={player.name}
                      onChange={e => setPlayer({ ...player, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9] bg-white text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      type="number"
                      value={player.number}
                      onChange={e => setPlayer({ ...player, number: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9] bg-white text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posición
                    </label>
                    <input
                      type="text"
                      value={player.position}
                      onChange={e => setPlayer({ ...player, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9] bg-white text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vencimiento SENADE
                    </label>
                    <input
                      type="date"
                      value={player.senadeExpiration}
                      onChange={e => setPlayer({ ...player, senadeExpiration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9] bg-white text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vencimiento Carnet de Salud
                    </label>
                    <input
                      type="date"
                      value={player.healthCardExpiration}
                      onChange={e => setPlayer({ ...player, healthCardExpiration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9] bg-white text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tarjetas Amarillas
                    </label>
                    <input
                      type="number"
                      value={player.yellowCards}
                      onChange={e => setPlayer({ ...player, yellowCards: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9] bg-white text-gray-900"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tarjetas Rojas
                    </label>
                    <input
                      type="number"
                      value={player.redCards}
                      onChange={e => setPlayer({ ...player, redCards: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9] bg-white text-gray-900"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={player.contactNumber}
                      onChange={e => setPlayer({ ...player, contactNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9] bg-white text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contacto de Emergencia
                    </label>
                    <input
                      type="text"
                      value={player.emergencyContact}
                      onChange={e => setPlayer({ ...player, emergencyContact: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59c0d9] bg-white text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 