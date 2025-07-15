import { Team, Player } from '@/types/team';

class TeamService {
  private static instance: TeamService;
  private API_URL: string;

  private constructor() {
    this.API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/teams';
  }

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
      // Primero intentamos crear en la nube
      console.log('Enviando datos del equipo a la nube:', teamData);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear equipo en la nube');
      }

      const cloudTeam = await response.json();
      console.log('Equipo creado en la nube:', cloudTeam);

      // Guardamos también en localStorage como respaldo
      try {
        const localTeams = JSON.parse(localStorage.getItem('teams') || '[]');
        localTeams.push(cloudTeam);
        localStorage.setItem('teams', JSON.stringify(localTeams));
        console.log('Equipo guardado localmente como respaldo');
      } catch (localError) {
        console.warn('Error al guardar equipo localmente:', localError);
      }

      return cloudTeam;
    } catch (error: any) {
      console.error('Error al crear equipo:', error);
      
      // Si falla la creación en la nube, intentamos guardar localmente
      try {
        const localTeams = JSON.parse(localStorage.getItem('teams') || '[]');
        const localTeam = {
          ...teamData,
          _id: crypto.randomUUID(),
          syncStatus: 'pending'
        };
        localTeams.push(localTeam);
        localStorage.setItem('teams', JSON.stringify(localTeams));
        console.log('Equipo guardado localmente debido a error de conexión');
        return localTeam;
      } catch (localError) {
        console.error('Error al guardar equipo localmente:', localError);
        throw error;
      }
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