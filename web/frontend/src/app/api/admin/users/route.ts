import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const users = await User.find({});
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ message: 'Error al obtener usuarios', error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { name, email, password, role, teamId } = await req.json();
  if (!name || !email || !password || !role) {
    return NextResponse.json({ message: 'Faltan datos' }, { status: 400 });
  }
  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: 'El usuario ya existe' }, { status: 409 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed, role, teamId });
  await user.save();
  return NextResponse.json(user, { status: 201 });
} 