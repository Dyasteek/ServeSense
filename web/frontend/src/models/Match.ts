import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  homeTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  awayTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  leagueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true
  },
  isHome: {
    type: Boolean,
    required: true
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
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

export default Match; 