import { describe, expect, test, beforeEach } from '@jest/globals';
import { teamService } from '../services/teamService';
import { Team } from '../types/team';

describe('Team Creation Tests', () => {
  const mockTeam: Omit<Team, '_id'> = {
    id: 'test-id',
    name: 'Test Team',
    division: 'A',
    players: [
      {
        id: 'player-1',
        name: 'Test Player',
        number: 1,
        position: 'Armador',
        senadeExpiration: '2024-12-31',
        healthCardExpiration: '2024-12-31',
        emergencyContact: 'Test Contact',
        contactNumber: '1234567890',
        stats: {
          aces: 0,
          servicios: 0,
          ataques: 0,
          bloqueos: 0,
          defensas: 0,
          recepciones: 0,
          colocaciones: 0,
          errores: 0
        },
        yellowCards: 0,
        redCards: 0
      }
    ],
    color: '#59c0d9',
    isOpponent: false,
    position: 0,
    points: 0,
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    setsWon: 0,
    setsLost: 0
  };

  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  test('should create team successfully', async () => {
    const result = await teamService.createTeam(mockTeam);
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.name).toBe(mockTeam.name);
      expect(result.division).toBe(mockTeam.division);
      expect(result.players).toHaveLength(1);
    }
    
    // Verificar que se guardó localmente
    const localTeams = JSON.parse(localStorage.getItem('teams') || '[]');
    expect(localTeams).toHaveLength(1);
    expect(localTeams[0].name).toBe(mockTeam.name);
  });

  test('should handle validation errors', async () => {
    const invalidTeam: Omit<Team, '_id'> = {
      ...mockTeam,
      name: '', // Nombre vacío para provocar error
      players: [] // Sin jugadores para provocar error
    };

    try {
      await teamService.createTeam(invalidTeam);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toContain('Error de validación');
    }
  });

  test('should handle network errors gracefully', async () => {
    // Simular error de red modificando la URL de la API
    const originalUrl = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = 'http://invalid-url';

    try {
      const result = await teamService.createTeam(mockTeam);
      
      // Debería guardar localmente cuando hay error de red
      expect(result).not.toBeNull();
      if (result) {
        expect(result).toHaveProperty('syncStatus', 'pending');
      }
      
      const localTeams = JSON.parse(localStorage.getItem('teams') || '[]');
      expect(localTeams).toHaveLength(1);
    } finally {
      // Restaurar la URL original
      process.env.NEXT_PUBLIC_API_URL = originalUrl;
    }
  });
}); 