import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'coach', 'player'],
    default: 'coach'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 