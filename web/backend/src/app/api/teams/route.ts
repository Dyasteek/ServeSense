import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Team } from '@/models/team';

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
    
    // Log para debug
    console.log('Datos recibidos:', body);

    // Asegurarse de que los jugadores tengan las estadísticas inicializadas
    const playersWithStats = body.players.map(player => ({
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
    
    // Log para debug
    console.log('Equipo creado:', team);
    
    return NextResponse.json(team);
  } catch (error) {
    // Log detallado del error
    console.error('Error detallado al crear equipo:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'Error de validación', 
        details: Object.values(error.errors).map(err => err.message)
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Error al crear equipo',
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