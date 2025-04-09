const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del equipo es requerido'],
    trim: true
  },
  maxPlayers: {
    type: Number,
    required: [true, 'La cantidad máxima de jugadores es requerida'],
    min: [6, 'El equipo debe tener al menos 6 jugadores'],
    max: [20, 'El equipo no puede tener más de 20 jugadores']
  },
  color: {
    type: String,
    required: [true, 'El color del equipo es requerido'],
    default: '#000000'
  },
  isOpponent: {
    type: Boolean,
    default: false
  },
  divisional: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: function() {
      return this.isOpponent;
    }
  },
  semester: {
    type: String,
    enum: ['Primavera', 'Otoño'],
    required: function() {
      return this.isOpponent;
    }
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  stats: {
    serves: {
      total: Number,
      successful: Number,
      errors: Number,
      points: Number
    },
    attacks: {
      total: Number,
      successful: Number,
      errors: Number,
      points: Number
    },
    blocks: {
      total: Number,
      successful: Number,
      errors: Number,
      points: Number
    },
    defenses: {
      total: Number,
      successful: Number,
      errors: Number
    }
  }
}, {
  timestamps: true
});

// Actualizar updatedAt antes de guardar
teamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Team', teamSchema); 