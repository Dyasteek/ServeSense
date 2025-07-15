import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions) as { user: { id: string; role: string } } | null;
    await connectDB();
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('owner');
    // Si es admin y pide equipos de un owner específico
    if (session && session.user && session.user.role === 'admin' && ownerId) {
      const teams = await Team.find({ owner: ownerId }).populate('players');
      return NextResponse.json(teams);
    }
    // Si es usuario normal, solo sus equipos
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json([], { status: 200 });
    }
    const teams = await Team.find({ owner: session.user.id }).populate('players');
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    return NextResponse.json({ message: 'Error al obtener equipos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as { user: { id: string; role: string } } | null;
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }
    const data = await req.json();
    await connectDB();

    let ownerId = session.user.id;
    // Si el usuario es admin y se envía owner, validar y usar ese owner
    if (session.user.role === 'admin' && data.owner) {
      const ownerUser = await User.findById(data.owner);
      if (!ownerUser) {
        // Permitir crear el equipo aunque el owner no exista, pero dejarlo en null o pendiente
        const newTeam = new Team({ ...data, owner: null });
        await newTeam.save();
        return NextResponse.json({
          ...newTeam.toObject(),
          warning: 'El owner especificado no existe. El equipo fue creado sin owner.'
        }, { status: 201 });
      }
      if (ownerUser.role !== 'coach') {
        return NextResponse.json({ message: 'El owner debe ser un coach válido.' }, { status: 400 });
      }
      ownerId = data.owner;
    }

    const newTeam = new Team({ ...data, owner: ownerId });
    await newTeam.save();
    return NextResponse.json(newTeam, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear equipo:', error);
    return NextResponse.json({ message: 'Error al crear equipo', error: error?.message || String(error) }, { status: 500 });
  }
} 