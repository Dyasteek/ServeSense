const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Player = require('../models/Player');

// Obtener todos los equipos con sus jugadores
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().populate('players');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener un equipo por ID con sus jugadores
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players');
    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo equipo
router.post('/', async (req, res) => {
  try {
    const { name, maxPlayers, color } = req.body;

    // Validar campos requeridos
    if (!name || !maxPlayers || !color) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Validar rango de jugadores
    if (maxPlayers < 6 || maxPlayers > 20) {
      return res.status(400).json({ message: 'El número de jugadores debe estar entre 6 y 20' });
    }

    const team = new Team({
      name,
      maxPlayers,
      color,
      players: []
    });

    const newTeam = await team.save();
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar un equipo
router.put('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }

    if (req.body.name) team.name = req.body.name;
    if (req.body.maxPlayers) team.maxPlayers = req.body.maxPlayers;
    if (req.body.color) team.color = req.body.color;
    if (req.body.players) team.players = req.body.players;

    const updatedTeam = await team.save();
    res.json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar un equipo
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }

    // Eliminar todos los jugadores del equipo
    await Player.deleteMany({ team: team._id });
    
    await team.remove();
    res.json({ message: 'Equipo eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 