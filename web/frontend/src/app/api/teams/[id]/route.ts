import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const team = await Team.findById(params.id).populate('players');
    if (!team) {
      return NextResponse.json({ message: 'Equipo no encontrado' }, { status: 404 });
    }
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    return NextResponse.json({ message: 'Error al obtener equipo' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }
    await connectDB();
    const team = await Team.findById(params.id);
    if (!team) {
      return NextResponse.json({ message: 'Equipo no encontrado' }, { status: 404 });
    }
    if (team.owner.toString() !== session.user.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }
    const data = await req.json();
    const updatedTeam = await Team.findByIdAndUpdate(params.id, data, { new: true }).populate('players');
    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    return NextResponse.json({ message: 'Error al actualizar equipo' }, { status: 500 });
  }
} 