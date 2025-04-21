export interface PlayerStats {
  aces: number;
  servicios: number;
  ataques: number;
  bloqueos: number;
  defensas: number;
  recepciones: number;
  colocaciones: number;
  errores: number;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  stats: PlayerStats;
  senadeExpiration: string;
  healthCardExpiration: string;
  yellowCards: number;
  redCards: number;
  emergencyContact: string;
  contactNumber: string;
}

export interface Team {
  _id?: string;
  id: string;
  name: string;
  players: Player[];
  position: number;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  color: string;
  division: string;
  isOpponent: boolean;
  createdAt?: string;
  updatedAt?: string;
} 