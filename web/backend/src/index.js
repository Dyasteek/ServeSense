const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/players', require('./routes/playerRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal en el servidor' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 