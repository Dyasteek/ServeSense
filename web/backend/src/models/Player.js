const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del jugador es requerido'],
    trim: true
  },
  number: {
    type: Number,
    required: [true, 'El número del jugador es requerido'],
    min: [1, 'El número debe ser mayor a 0']
  },
  position: {
    type: String,
    required: [true, 'La posición del jugador es requerida'],
    trim: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'El equipo del jugador es requerido']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  stats: {
    serves: [{
      matchId: mongoose.Schema.Types.ObjectId,
      total: Number,
      successful: Number,
      errors: Number,
      points: Number
    }],
    attacks: [{
      matchId: mongoose.Schema.Types.ObjectId,
      total: Number,
      successful: Number,
      errors: Number,
      points: Number
    }],
    blocks: [{
      matchId: mongoose.Schema.Types.ObjectId,
      total: Number,
      successful: Number,
      errors: Number,
      points: Number
    }],
    defenses: [{
      matchId: mongoose.Schema.Types.ObjectId,
      total: Number,
      successful: Number,
      errors: Number
    }]
  }
}, {
  timestamps: true
});

// Actualizar updatedAt antes de guardar
playerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Player', playerSchema); 