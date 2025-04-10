'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { localStorageService } from '@/services/localStorage';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
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

export default function PlayerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const isDocumentExpired = (date: string) => {
    return new Date(date) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors mb-6"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Volver al Equipo
          </Link>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Detalles del Jugador</h1>
                <button
                  onClick={() => router.push(`/team/${id}/edit`)}
                  className="text-white hover:text-white/80"
                >
                  <PencilIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{player.name}</h2>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-600">#{player.number}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">{player.position}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentación</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Vencimiento SENADE</p>
                        <p className={`font-medium ${
                          isDocumentExpired(player.senadeExpiration) 
                            ? 'text-red-600' 
                            : 'text-gray-900'
                        }`}>
                          {new Date(player.senadeExpiration).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vencimiento Carnet de Salud</p>
                        <p className={`font-medium ${
                          isDocumentExpired(player.healthCardExpiration) 
                            ? 'text-red-600' 
                            : 'text-gray-900'
                        }`}>
                          {new Date(player.healthCardExpiration).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarjetas</h3>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Amarillas</p>
                        <p className="text-2xl font-bold text-yellow-500">{player.yellowCards}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rojas</p>
                        <p className="text-2xl font-bold text-red-500">{player.redCards}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contactos</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-medium text-gray-900">{player.contactNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contacto de Emergencia</p>
                        <p className="font-medium text-gray-900">{player.emergencyContact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 