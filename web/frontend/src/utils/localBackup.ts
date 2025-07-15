export type LocalBackup = {
  equipos: any[];
  jugadores: any[];
  partidos: any[];
  estadisticas: any[];
  datosPersonales: Record<string, any>;
};

export function saveLocalBackup(userId: string, backup: LocalBackup) {
  localStorage.setItem(`serveSense_backup_${userId}`, JSON.stringify(backup));
}

export function getLocalBackup(userId: string): LocalBackup | null {
  const data = localStorage.getItem(`serveSense_backup_${userId}`);
  return data ? JSON.parse(data) : null;
}

export function clearLocalBackup(userId: string) {
  localStorage.removeItem(`serveSense_backup_${userId}`);
} 