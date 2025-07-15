import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ message: 'El nombre del equipo es obligatorio.' }, { status: 400 });
  }
  await connectDB();
  // Buscar equipo por nombre (case-insensitive)
  const existing = await Team.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
  if (existing) {
    return NextResponse.json({ message: 'El equipo ya existe.' }, { status: 409 });
  }
  // Crear equipo (sin owner, se asociará después si es necesario)
  const newTeam = new Team({ name, division: 'Sin asignar', leagueId: null, owner: null });
  await newTeam.save();
  return NextResponse.json(newTeam, { status: 201 });
} 