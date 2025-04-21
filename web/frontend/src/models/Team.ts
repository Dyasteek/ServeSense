import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  division: {
    type: String,
    required: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  leagueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

export default Team; 