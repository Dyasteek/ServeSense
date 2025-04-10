import { v4 as uuidv4 } from 'uuid';
import { localStorageService } from '@/services/localStorage';

const POSITIONS = ['Armador', 'Central', 'Punta', 'Opuesto', 'Líbero'];
const TEAM_NAMES = [
  'Águilas', 'Tigres', 'Leones', 'Halcones', 'Dragones',
  'Cóndores', 'Pumas', 'Jaguares', 'Águilas', 'Tiburones'
];
const PLAYER_NAMES = [
  'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Rodríguez',
  'Laura Sánchez', 'Miguel González', 'Sofía Ramírez', 'Diego Torres', 'Valeria Flores',
  'Javier Ruiz', 'Camila Herrera', 'Andrés Morales', 'Isabella Castro', 'Ricardo Vargas'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomPlayer() {
  return {
    id: uuidv4(),
    name: getRandomElement(PLAYER_NAMES),
    number: Math.floor(Math.random() * 99) + 1,
    position: getRandomElement(POSITIONS)
  };
}

function generateRandomTeam(isOpponent: boolean = false) {
  const numPlayers = Math.floor(Math.random() * 10) + 6; // Entre 6 y 15 jugadores
  const players = Array.from({ length: numPlayers }, generateRandomPlayer);
  
  return {
    id: uuidv4(),
    name: `${getRandomElement(TEAM_NAMES)} ${isOpponent ? 'Rival' : 'Local'}`,
    color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
    maxPlayers: 15,
    isOpponent,
    players
  };
}

function generateRandomStats() {
  return {
    serves: {
      total: Math.floor(Math.random() * 30) + 10,
      successful: Math.floor(Math.random() * 20) + 5,
      errors: Math.floor(Math.random() * 10),
      points: Math.floor(Math.random() * 5)
    },
    attacks: {
      total: Math.floor(Math.random() * 50) + 20,
      successful: Math.floor(Math.random() * 30) + 10,
      errors: Math.floor(Math.random() * 15),
      points: Math.floor(Math.random() * 15) + 5
    },
    blocks: {
      total: Math.floor(Math.random() * 20) + 5,
      successful: Math.floor(Math.random() * 10) + 2,
      errors: Math.floor(Math.random() * 5),
      points: Math.floor(Math.random() * 5) + 1
    },
    defenses: {
      total: Math.floor(Math.random() * 40) + 15,
      successful: Math.floor(Math.random() * 25) + 10,
      errors: Math.floor(Math.random() * 10)
    }
  };
}

function generateRandomMatch(homeTeamId: string, awayTeamId: string) {
  const homeScore = Math.floor(Math.random() * 3) + 0;
  const awayScore = Math.floor(Math.random() * 3) + 0;
  const isCompleted = Math.random() > 0.3; // 70% de probabilidad de estar completado

  return {
    id: uuidv4(),
    homeTeamId,
    awayTeamId,
    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    status: isCompleted ? 'completed' as const : 'scheduled' as const,
    score: {
      home: homeScore,
      away: awayScore
    },
    stats: {
      homeTeam: generateRandomStats(),
      awayTeam: generateRandomStats()
    }
  };
}

export async function generateMockData() {
  // Generar equipos
  const localTeam = generateRandomTeam(false);
  const opponentTeams = Array.from({ length: 5 }, () => generateRandomTeam(true));

  // Guardar equipos
  await localStorageService.saveTeam(localTeam);
  for (const team of opponentTeams) {
    await localStorageService.saveTeam(team);
  }

  // Generar partidos
  const matches = [];
  for (const opponentTeam of opponentTeams) {
    // 2-3 partidos por equipo rival
    const numMatches = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < numMatches; i++) {
      const match = generateRandomMatch(localTeam.id, opponentTeam.id);
      matches.push(match);
      await localStorageService.saveMatch(match);
    }
  }

  // Guardar configuración de sincronización
  await localStorageService.updateSyncSettings({
    cloudEnabled: false,
    cloudUrl: 'https://api.servesense.com'
  });

  return {
    localTeam,
    opponentTeams,
    matches
  };
} 