import mongoose from 'mongoose';

const leagueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  season: {
    type: String,
    required: true
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const League = mongoose.models.League || mongoose.model('League', leagueSchema);

export default League; 