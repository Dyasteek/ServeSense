'use client';

import { useState, useEffect } from 'react';
import { CloudArrowUpIcon, CloudArrowDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { localStorageService } from '@/services/localStorage';
import { cloudSyncService } from '@/services/cloudSync';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    cloudEnabled: false,
    cloudUrl: '',
    lastSync: '',
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const syncSettings = await localStorageService.getSyncSettings();
    setSettings(syncSettings);
  };

  const handleCloudToggle = async () => {
    if (settings.cloudEnabled) {
      await cloudSyncService.disableCloudSync();
      setSettings(prev => ({ ...prev, cloudEnabled: false, cloudUrl: '' }));
      setMessage({ type: 'success', text: 'Sincronización con la nube desactivada' });
    } else if (settings.cloudUrl) {
      await cloudSyncService.initialize(settings.cloudUrl);
      setSettings(prev => ({ ...prev, cloudEnabled: true }));
      setMessage({ type: 'success', text: 'Sincronización con la nube activada' });
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage(null);

    try {
      const success = await cloudSyncService.syncData();
      if (success) {
        setMessage({ type: 'success', text: 'Datos sincronizados correctamente' });
        await loadSettings();
      } else {
        setMessage({ type: 'error', text: 'Error al sincronizar los datos' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al sincronizar los datos' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestore = async () => {
    if (!confirm('¿Estás seguro de que deseas restaurar los datos desde la nube? Esto sobrescribirá tus datos locales.')) {
      return;
    }

    setIsSyncing(true);
    setMessage(null);

    try {
      const success = await cloudSyncService.restoreFromCloud();
      if (success) {
        setMessage({ type: 'success', text: 'Datos restaurados correctamente' });
        await loadSettings();
      } else {
        setMessage({ type: 'error', text: 'Error al restaurar los datos' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al restaurar los datos' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración</h1>

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

          {/* Sincronización con la nube */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sincronización con la nube</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del servidor de sincronización
                </label>
                <input
                  type="text"
                  value={settings.cloudUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, cloudUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://tu-servidor.com/api"
                  disabled={settings.cloudEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cloudEnabled"
                    checked={settings.cloudEnabled}
                    onChange={handleCloudToggle}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="cloudEnabled" className="ml-2 block text-sm text-gray-900">
                    Activar sincronización con la nube
                  </label>
                </div>

                {settings.cloudEnabled && (
                  <div className="text-sm text-gray-500">
                    Última sincronización: {new Date(settings.lastSync).toLocaleString()}
                  </div>
                )}
              </div>

              {settings.cloudEnabled && (
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CloudArrowUpIcon className="h-5 w-5" />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar con la nube'}
                  </button>
                  <button
                    onClick={handleRestore}
                    disabled={isSyncing}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CloudArrowDownIcon className="h-5 w-5" />
                    Restaurar desde la nube
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Exportar/Importar datos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Copia de seguridad local</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const data = await localStorageService.exportData();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `servesense-backup-${new Date().toISOString()}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  Exportar datos
                </button>

                <label className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <ArrowPathIcon className="h-5 w-5" />
                  Importar datos
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          try {
                            const data = JSON.parse(event.target?.result as string);
                            await localStorageService.importData(data);
                            setMessage({ type: 'success', text: 'Datos importados correctamente' });
                          } catch (error) {
                            setMessage({ type: 'error', text: 'Error al importar los datos' });
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 