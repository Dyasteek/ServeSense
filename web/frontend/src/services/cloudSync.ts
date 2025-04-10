import { localStorageService } from './localStorage';

class CloudSyncService {
  private cloudUrl: string | null = null;

  async initialize(cloudUrl?: string) {
    if (cloudUrl) {
      this.cloudUrl = cloudUrl;
      const settings = await localStorageService.getSyncSettings();
      await localStorageService.updateSyncSettings({
        ...settings,
        cloudEnabled: true,
        cloudUrl,
      });
    }
  }

  async syncData() {
    const settings = await localStorageService.getSyncSettings();
    if (!settings.cloudEnabled || !this.cloudUrl) return;

    try {
      // Exportar datos locales
      const localData = await localStorageService.exportData();

      // Enviar datos a la nube
      const response = await fetch(`${this.cloudUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localData),
      });

      if (!response.ok) {
        throw new Error('Error al sincronizar con la nube');
      }

      // Actualizar última sincronización
      await localStorageService.updateSyncSettings({
        ...settings,
        lastSync: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Error de sincronización:', error);
      return false;
    }
  }

  async restoreFromCloud() {
    const settings = await localStorageService.getSyncSettings();
    if (!settings.cloudEnabled || !this.cloudUrl) return;

    try {
      // Obtener datos de la nube
      const response = await fetch(`${this.cloudUrl}/sync`);
      if (!response.ok) {
        throw new Error('Error al obtener datos de la nube');
      }

      const cloudData = await response.json();

      // Importar datos locales
      await localStorageService.importData(cloudData);

      // Actualizar última sincronización
      await localStorageService.updateSyncSettings({
        ...settings,
        lastSync: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Error al restaurar desde la nube:', error);
      return false;
    }
  }

  async disableCloudSync() {
    const settings = await localStorageService.getSyncSettings();
    await localStorageService.updateSyncSettings({
      ...settings,
      cloudEnabled: false,
      cloudUrl: undefined,
    });
    this.cloudUrl = null;
  }
}

export const cloudSyncService = new CloudSyncService(); 