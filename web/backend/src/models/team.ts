import mongoose from 'mongoose';

const playerStatsSchema = new mongoose.Schema({
  aces: { type: Number, default: 0 },
  servicios: { type: Number, default: 0 },
  ataques: { type: Number, default: 0 },
  bloqueos: { type: Number, default: 0 },
  defensas: { type: Number, default: 0 },
  recepciones: { type: Number, default: 0 },
  colocaciones: { type: Number, default: 0 },
  errores: { type: Number, default: 0 }
});

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: Number, required: true },
  position: { type: String, required: true },
  stats: { type: playerStatsSchema, default: () => ({}) },
  senadeExpiration: { type: String, required: true },
  healthCardExpiration: { type: String, required: true },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },
  emergencyContact: { type: String, required: true },
  contactNumber: { type: String, required: true }
});

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  division: { type: String, required: true },
  players: [playerSchema],
  position: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  matchesPlayed: { type: Number, default: 0 },
  matchesWon: { type: Number, default: 0 },
  matchesLost: { type: Number, default: 0 },
  setsWon: { type: Number, default: 0 },
  setsLost: { type: Number, default: 0 },
  color: { type: String, default: '#59c0d9' },
  isOpponent: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema); 