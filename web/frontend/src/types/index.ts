export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  senadeExpiration?: string;
  healthCardExpiration?: string;
  yellowCards?: number;
  redCards?: number;
  contactNumber?: string;
  emergencyContact?: string;
  stats?: {
    serves: {
      total: number;
      successful: number;
      errors: number;
      points: number;
    };
    attacks: {
      total: number;
      successful: number;
      errors: number;
      points: number;
    };
    blocks: {
      total: number;
      successful: number;
      errors: number;
      points: number;
    };
  };
}

export interface Team {
  id: string;
  name: string;
  division: string;
  players: Player[];
  isOpponent: boolean;
  color: string;
  position: number;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
} 