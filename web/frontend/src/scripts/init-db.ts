import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Cargar variables de entorno desde .env.local
const envPath = resolve(process.cwd(), '.env.local');
const envConfig = readFileSync(envPath, 'utf-8')
  .split('\n')
  .reduce((acc: Record<string, string>, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});

// Asignar variables de entorno
Object.assign(process.env, envConfig);

import bcrypt from 'bcryptjs';
import User from '../models/User';
import Team from '../models/Team';
import League from '../models/League';
import connectDB from '../lib/mongodb';

async function initDB() {
  try {
    await connectDB();

    // Crear una liga
    const league = await League.create({
      name: 'LiVoSur',
      season: '2024',
    });

    // Crear un equipo
    const team = await Team.create({
      name: 'Equipo Administrador',
      division: 'Primera',
      leagueId: league._id,
    });

    // Crear un usuario administrador
    const hashedPassword = await bcrypt.hash('maraca123', 10);
    await User.create({
      email: 'admin@servesense.com',
      password: hashedPassword,
      name: 'Administrador',
      teamId: team._id,
      role: 'admin',
    });

    console.log('Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initDB(); 