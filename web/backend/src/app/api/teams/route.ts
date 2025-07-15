import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Team } from '../../../models/team';
import { ValidationError } from 'mongoose';

interface PlayerError {
  message: string;
  path: string;
}

export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find({});
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    return NextResponse.json({ error: 'Error al obtener equipos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Validaciones básicas
    if (!body.name || !body.division) {
      return NextResponse.json({ 
        error: 'Error de validación', 
        details: ['Nombre y división son campos requeridos']
      }, { status: 400 });
    }

    if (!Array.isArray(body.players) || body.players.length === 0) {
      return NextResponse.json({ 
        error: 'Error de validación', 
        details: ['El equipo debe tener al menos un jugador']
      }, { status: 400 });
    }

    // Validar datos de jugadores
    const playerErrors: string[] = [];
    body.players.forEach((player: any, index: number) => {
      if (!player.name || !player.number || !player.position) {
        playerErrors.push(`Jugador ${index + 1}: nombre, número y posición son requeridos`);
      }
      if (!player.senadeExpiration || !player.healthCardExpiration) {
        playerErrors.push(`Jugador ${index + 1}: fechas de SENADE y Ficha Médica son requeridas`);
      }
      if (!player.emergencyContact || !player.contactNumber) {
        playerErrors.push(`Jugador ${index + 1}: contacto de emergencia y número son requeridos`);
      }
    });

    if (playerErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Error de validación', 
        details: playerErrors
      }, { status: 400 });
    }

    // Asegurarse de que los jugadores tengan las estadísticas inicializadas
    const playersWithStats = body.players.map((player: any) => ({
      ...player,
      stats: {
        aces: 0,
        servicios: 0,
        ataques: 0,
        bloqueos: 0,
        defensas: 0,
        recepciones: 0,
        colocaciones: 0,
        errores: 0,
        ...player.stats
      }
    }));

    const teamData = {
      ...body,
      players: playersWithStats
    };

    const team = await Team.create(teamData);
    
    return NextResponse.json(team);
  } catch (error: any) {
    console.error('Error al crear equipo:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    if (error instanceof ValidationError) {
      return NextResponse.json({ 
        error: 'Error de validación', 
        details: Object.values(error.errors).map((err: PlayerError) => err.message)
      }, { status: 400 });
    }

    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Error de duplicación', 
        details: ['Ya existe un equipo con ese nombre']
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: 'Error interno del servidor',
      message: error.message
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { _id, ...updateData } = body;
    
    const team = await Team.findByIdAndUpdate(_id, updateData, { new: true });
    if (!team) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    return NextResponse.json({ error: 'Error al actualizar equipo' }, { status: 500 });
  }
} 