const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH']
  }
});

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/teams', require('./routes/teamRoutes'));
const playerRoutes = require('./routes/playerRoutes');
app.use('/api/players', playerRoutes(io));
app.use('/api/matches', require('./routes/matchRoutes'));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal en el servidor' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Socket.IO eventos básicos
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
}); 