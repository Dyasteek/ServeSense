import { ArrowPathIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function SyncScreen() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <CloudArrowUpIcon className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Sincronización</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado de Sincronización</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowPathIcon className="h-6 w-6 text-green-600 animate-spin" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Sincronizando datos...</p>
              <p className="text-sm text-gray-500">Última sincronización: 2024-04-09 10:30</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dispositivos Conectados</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Tablet Principal</p>
                  <p className="text-xs text-gray-500">Última conexión: 2 minutos</p>
                </div>
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-700">
                Desconectar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 