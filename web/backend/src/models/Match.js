const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  homeTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'El equipo local es requerido']
  },
  awayTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'El equipo visitante es requerido']
  },
  date: {
    type: Date,
    required: [true, 'La fecha del partido es requerida'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed'],
    default: 'scheduled'
  },
  score: {
    home: {
      type: Number,
      default: 0
    },
    away: {
      type: Number,
      default: 0
    }
  },
  stats: {
    homeTeam: {
      serves: {
        total: { type: Number, default: 0 },
        successful: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
      },
      attacks: {
        total: { type: Number, default: 0 },
        successful: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
      },
      blocks: {
        total: { type: Number, default: 0 },
        successful: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
      },
      defenses: {
        total: { type: Number, default: 0 },
        successful: { type: Number, default: 0 },
        errors: { type: Number, default: 0 }
      }
    },
    awayTeam: {
      serves: {
        total: { type: Number, default: 0 },
        successful: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
      },
      attacks: {
        total: { type: Number, default: 0 },
        successful: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
      },
      blocks: {
        total: { type: Number, default: 0 },
        successful: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
      },
      defenses: {
        total: { type: Number, default: 0 },
        successful: { type: Number, default: 0 },
        errors: { type: Number, default: 0 }
      }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema); 