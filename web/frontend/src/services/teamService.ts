import { Team, Player } from '@/types/team';

class TeamService {
  private static instance: TeamService;
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/teams`;

  private constructor() {}

  public static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }

  async getTeams(): Promise<Team[]> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener equipos');
      }
      const teams = await response.json();
      return teams;
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      return [];
    }
  }

  async createTeam(teamData: Omit<Team, '_id'>): Promise<Team | null> {
    try {
      console.log('Enviando datos del equipo:', teamData);
      console.log('URL de la API:', this.API_URL);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });

      console.log('Status de la respuesta:', response.status);
      console.log('Headers de la respuesta:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Respuesta del servidor (texto):', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error al parsear la respuesta JSON:', parseError);
        throw new Error(`Error al procesar la respuesta del servidor: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(`Error de validación: ${data.details?.join(', ') || data.message}`);
        }
        throw new Error(data.message || 'Error al crear equipo');
      }

      console.log('Respuesta del servidor procesada:', data);
      return data;
    } catch (error: any) {
      console.error('Error detallado al crear equipo:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        url: this.API_URL
      });
      throw error;
    }
  }

  async updateTeam(team: Team): Promise<Team | null> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(team),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar equipo');
      }

      return data;
    } catch (error) {
      console.error('Error al actualizar equipo:', error);
      throw error;
    }
  }

  async updateTeamStats(team: Team): Promise<Team | null> {
    return this.updateTeam(team);
  }
}

export const teamService = TeamService.getInstance(); 