import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function StatsScreen() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <ChartBarIcon className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Tarjetas de resumen */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Partidos</h3>
          <p className="text-3xl font-bold text-primary-600">12</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Victorias</h3>
          <p className="text-3xl font-bold text-green-600">8</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Derrotas</h3>
          <p className="text-3xl font-bold text-red-600">4</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas Detalladas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jugador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saques
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ataques
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bloqueos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Jugador 1
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  85%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  75%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  60%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 