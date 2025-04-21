import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Team, Player } from '@/types/team';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  senadeExpiration: string;
  healthCardExpiration: string;
  yellowCards: number;
  redCards: number;
  contactNumber: string;
  emergencyContact: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
  division: string;
  players: Player[];
  isOpponent: boolean;
  position: number;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
}

interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  isFriendly: boolean;
  score?: {
    home: number;
    away: number;
  };
  sets?: {
    home: number;
    away: number;
    points: {
      home: number[];
      away: number[];
    };
  };
}

interface LeagueInfo {
  division: string;
  season: 'Apertura' | 'Clausura';
}

interface ServeSenseDB {
  teams: Team[];
  matches: Match[];
  leagueInfo: LeagueInfo;
}

interface PlayerStats {
  aces: number;
  servicios: number;
  ataques: number;
  bloqueos: number;
  defensas: number;
  recepciones: number;
  colocaciones: number;
  errores: number;
}

interface PlayerWithStats extends Player {
  stats: PlayerStats;
}

interface TeamWithStats extends Team {
  players: PlayerWithStats[];
}

class LocalStorageService {
  private static instance: LocalStorageService;
  private db: ServeSenseDB;
  private readonly TEAMS_KEY = 'teams';

  private constructor() {
    this.db = {
      teams: [],
      matches: [],
      leagueInfo: {
        division: '',
        season: 'Apertura'
      }
    };
    this.initializeDB();
  }

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  private initializeDB() {
    if (typeof window === 'undefined') return;

    try {
      const storedData = localStorage.getItem('serveSenseDB');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Asegurarse de que los datos tengan la estructura correcta
        this.db = {
          teams: parsedData.teams || [],
          matches: parsedData.matches || [],
          leagueInfo: parsedData.leagueInfo || {
            division: '',
            season: 'Apertura'
          }
        };
      }
      this.saveDB(); // Guardar la estructura inicial si no existe
    } catch (error) {
      console.error('Error initializing database:', error);
      this.saveDB();
    }
  }

  private saveDB() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('serveSenseDB', JSON.stringify(this.db));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Teams
  async getTeams(): Promise<TeamWithStats[]> {
    try {
      const teamsJson = localStorage.getItem(this.TEAMS_KEY);
      if (!teamsJson) return [];

      const teams = JSON.parse(teamsJson) as TeamWithStats[];
      return teams.map(team => ({
        ...team,
        players: team.players.map(player => ({
          ...player,
          stats: {
            aces: 0,
            servicios: 0,
            ataques: 0,
            bloqueos: 0,
            defensas: 0,
            recepciones: 0,
            colocaciones: 0,
            errores: 0,
            ...player.stats
          }
        }))
      }));
    } catch (error) {
      console.error('Error al cargar equipos:', error);
      return [];
    }
  }

  async addTeam(team: Omit<Team, 'id'>): Promise<Team> {
    const newTeam: Team = {
      ...team,
      id: crypto.randomUUID(),
      players: team.players || [],
      position: 0,
      points: 0,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      setsWon: 0,
      setsLost: 0,
      division: team.division || ''
    };
    this.db.teams.push(newTeam);
    this.saveDB();
    return newTeam;
  }

  async updateTeam(team: TeamWithStats): Promise<void> {
    try {
      const teams = await this.getTeams();
      const updatedTeams = teams.map(t => 
        t.id === team.id ? team : t
      );
      localStorage.setItem(this.TEAMS_KEY, JSON.stringify(updatedTeams));
    } catch (error) {
      console.error('Error al actualizar equipo:', error);
      throw error;
    }
  }

  async updateTeamStats(team: TeamWithStats): Promise<void> {
    try {
      const teams = await this.getTeams();
      const updatedTeams = teams.map(t => 
        t.id === team.id ? team : t
      );
      localStorage.setItem(this.TEAMS_KEY, JSON.stringify(updatedTeams));
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
      throw error;
    }
  }

  async deleteTeam(teamId: string): Promise<void> {
    this.db.teams = this.db.teams.filter(team => team.id !== teamId);
    this.saveDB();
  }

  // Players
  async addPlayer(teamId: string, player: Omit<Player, 'id'>): Promise<Player> {
    const team = this.db.teams.find(t => t.id === teamId);
    if (!team) throw new Error('Team not found');

    const newPlayer: Player = {
      ...player,
      id: crypto.randomUUID()
    };

    team.players.push(newPlayer);
    this.saveDB();
    return newPlayer;
  }

  async updatePlayer(teamId: string, player: Player): Promise<void> {
    const team = this.db.teams.find(t => t.id === teamId);
    if (!team) throw new Error('Team not found');

    const index = team.players.findIndex(p => p.id === player.id);
    if (index !== -1) {
      team.players[index] = player;
      this.saveDB();
    }
  }

  async deletePlayer(teamId: string, playerId: string): Promise<void> {
    const team = this.db.teams.find(t => t.id === teamId);
    if (!team) throw new Error('Team not found');

    team.players = team.players.filter(p => p.id !== playerId);
    this.saveDB();
  }

  // Matches
  async getMatches(): Promise<Match[]> {
    return [...this.db.matches];
  }

  async addMatch(match: Omit<Match, 'id'>): Promise<Match> {
    const newMatch: Match = {
      ...match,
      id: crypto.randomUUID()
    };
    this.db.matches.push(newMatch);
    this.saveDB();
    return newMatch;
  }

  async updateMatch(match: Match): Promise<void> {
    const index = this.db.matches.findIndex(m => m.id === match.id);
    if (index !== -1) {
      this.db.matches[index] = match;
      this.saveDB();
    }
  }

  async deleteMatch(matchId: string): Promise<void> {
    this.db.matches = this.db.matches.filter(match => match.id !== matchId);
    this.saveDB();
  }

  // League Info
  async getLeagueInfo(): Promise<LeagueInfo> {
    return { ...this.db.leagueInfo };
  }

  async updateLeagueInfo(info: LeagueInfo): Promise<void> {
    this.db.leagueInfo = info;
    this.saveDB();
  }

  // Sync Settings
  async getSyncSettings() {
    const settings = {
      enabled: false,
      lastSync: null,
      cloudUrl: null
    };
    return settings;
  }

  async updateSyncSettings(settings: { enabled: boolean; lastSync: string | null; cloudUrl: string | null }) {
    // Implementation needed
  }

  // Backup and restore
  async exportData() {
    const teams = await this.getTeams();
    const matches = await this.getMatches();
    const settings = await this.getSyncSettings();
    return { teams, matches, settings };
  }

  async importData(data: { teams: any[]; matches: any[]; settings: any }) {
    // Implementation needed
  }
}

export const localStorageService = LocalStorageService.getInstance(); 