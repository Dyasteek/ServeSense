const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

// Obtener todos los partidos
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('homeTeam', 'name color')
      .populate('awayTeam', 'name color');
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener un partido por ID
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('homeTeam', 'name color')
      .populate('awayTeam', 'name color');
    if (!match) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo partido
router.post('/', async (req, res) => {
  const match = new Match({
    homeTeam: req.body.homeTeamId,
    awayTeam: req.body.awayTeamId,
    date: req.body.date,
    status: req.body.status
  });

  try {
    const newMatch = await match.save();
    res.status(201).json(newMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar un partido
router.put('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }

    if (req.body.date) match.date = req.body.date;
    if (req.body.status) match.status = req.body.status;
    if (req.body.sets) match.sets = req.body.sets;
    if (req.body.finalScore) match.finalScore = req.body.finalScore;
    if (req.body.stats) match.stats = req.body.stats;

    const updatedMatch = await match.save();
    res.json(updatedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar un partido
router.delete('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }

    await match.remove();
    res.json({ message: 'Partido eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Agregar un set al partido
router.post('/:id/sets', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }

    const { homeTeamScore, awayTeamScore, duration } = req.body;
    match.sets.push({ homeTeamScore, awayTeamScore, duration });

    // Actualizar el marcador final
    const homeTeamWins = match.sets.filter(set => set.homeTeamScore > set.awayTeamScore).length;
    const awayTeamWins = match.sets.filter(set => set.awayTeamScore > set.homeTeamScore).length;
    
    if (homeTeamWins >= 3 || awayTeamWins >= 3) {
      match.status = 'completed';
      match.finalScore = {
        homeTeam: homeTeamWins,
        awayTeam: awayTeamWins
      };
    }

    const updatedMatch = await match.save();
    res.json(updatedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar estadísticas de un partido
router.patch('/:id/stats', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }

    // Actualizar estadísticas
    if (req.body.stats) {
      match.stats = { ...match.stats, ...req.body.stats };
    }

    const updatedMatch = await match.save();
    res.json(updatedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Finalizar un partido
router.patch('/:id/finish', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }

    match.status = 'completed';
    match.score = req.body.score;

    const updatedMatch = await match.save();
    res.json(updatedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 