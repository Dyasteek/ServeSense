import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: Number,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  senadeExpiration: {
    type: Date
  },
  healthCardExpiration: {
    type: Date
  },
  yellowCards: {
    type: Number,
    default: 0
  },
  redCards: {
    type: Number,
    default: 0
  },
  contactNumber: {
    type: String
  },
  emergencyContact: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);

export default Player; 