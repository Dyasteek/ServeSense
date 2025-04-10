'use client';

import { useState } from 'react';
import { generateMockData } from '@/utils/mockData';
import { localStorageService } from '@/services/localStorage';

export default function TestPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [data, setData] = useState<any>(null);

  const handleGenerateData = async () => {
    setIsGenerating(true);
    setMessage(null);

    try {
      const generatedData = await generateMockData();
      setData(generatedData);
      setMessage({ type: 'success', text: 'Datos generados correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al generar los datos' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearData = async () => {
    try {
      const teams = await localStorageService.getTeams();
      const matches = await localStorageService.getMatches();

      for (const team of teams) {
        await localStorageService.deleteTeam(team.id);
      }

      for (const match of matches) {
        await localStorageService.deleteMatch(match.id);
      }

      setMessage({ type: 'success', text: 'Datos eliminados correctamente' });
      setData(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar los datos' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Prueba de Datos</h1>

          {/* Mensajes */}
          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleGenerateData}
              disabled={isGenerating}
              className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Generando...' : 'Generar Datos Aleatorios'}
            </button>
            <button
              onClick={handleClearData}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Eliminar Datos
            </button>
          </div>

          {/* Vista previa de datos */}
          {data && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos Generados</h2>
              
              <div className="space-y-6">
                {/* Equipo Local */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Equipo Local</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(data.localTeam, null, 2)}
                  </pre>
                </div>

                {/* Equipos Rivales */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Equipos Rivales</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(data.opponentTeams, null, 2)}
                  </pre>
                </div>

                {/* Partidos */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Partidos</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(data.matches, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 