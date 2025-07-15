const express = require('express');

// Exportar función que recibe io
module.exports = function(io) {
  const router = express.Router();
  const Player = require('../models/Player');
  const Team = require('../models/Team');

  // Obtener todos los jugadores con su equipo
  router.get('/', async (req, res) => {
    try {
      const players = await Player.find().populate('team');
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener un jugador por ID con su equipo
  router.get('/:id', async (req, res) => {
    try {
      const player = await Player.findById(req.params.id).populate('team');
      if (!player) {
        return res.status(404).json({ message: 'Jugador no encontrado' });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Crear un nuevo jugador
  router.post('/', async (req, res) => {
    try {
      // Verificar que el equipo existe
      const team = await Team.findById(req.body.team);
      if (!team) {
        return res.status(404).json({ message: 'Equipo no encontrado' });
      }

      const player = new Player({
        name: req.body.name,
        number: req.body.number,
        position: req.body.position,
        team: req.body.team
      });

      const newPlayer = await player.save();
      
      // Agregar el jugador al equipo
      team.players.push(newPlayer._id);
      await team.save();

      res.status(201).json(newPlayer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Actualizar un jugador
  router.put('/:id', async (req, res) => {
    try {
      const player = await Player.findById(req.params.id);
      if (!player) {
        return res.status(404).json({ message: 'Jugador no encontrado' });
      }

      if (req.body.name) player.name = req.body.name;
      if (req.body.number) player.number = req.body.number;
      if (req.body.position) player.position = req.body.position;
      if (req.body.team) {
        // Verificar que el nuevo equipo existe
        const newTeam = await Team.findById(req.body.team);
        if (!newTeam) {
          return res.status(404).json({ message: 'Equipo no encontrado' });
        }

        // Remover el jugador del equipo anterior
        const oldTeam = await Team.findById(player.team);
        if (oldTeam) {
          oldTeam.players = oldTeam.players.filter(p => p.toString() !== player._id.toString());
          await oldTeam.save();
        }

        // Agregar el jugador al nuevo equipo
        newTeam.players.push(player._id);
        await newTeam.save();

        player.team = req.body.team;
      }

      const updatedPlayer = await player.save();
      res.json(updatedPlayer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Eliminar un jugador
  router.delete('/:id', async (req, res) => {
    try {
      const player = await Player.findById(req.params.id);
      if (!player) {
        return res.status(404).json({ message: 'Jugador no encontrado' });
      }

      // Remover el jugador del equipo
      const team = await Team.findById(player.team);
      if (team) {
        team.players = team.players.filter(p => p.toString() !== player._id.toString());
        await team.save();
      }

      await player.remove();
      res.json({ message: 'Jugador eliminado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Agregar estadísticas de un partido
  router.post('/:id/stats', async (req, res) => {
    try {
      const player = await Player.findById(req.params.id);
      if (!player) {
        return res.status(404).json({ message: 'Jugador no encontrado' });
      }

      const { matchId, stats } = req.body;
      
      if (stats.serves) player.stats.serves.push({ matchId, ...stats.serves });
      if (stats.attacks) player.stats.attacks.push({ matchId, ...stats.attacks });
      if (stats.blocks) player.stats.blocks.push({ matchId, ...stats.blocks });
      if (stats.defenses) player.stats.defenses.push({ matchId, ...stats.defenses });

      const updatedPlayer = await player.save();
      // Emitir evento de Socket.IO
      io.emit('stats-updated', {
        playerId: player._id,
        matchId,
        stats
      });
      res.json(updatedPlayer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  return router;
} 