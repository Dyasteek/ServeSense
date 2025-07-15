import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    await connectDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'El correo ya está registrado.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'coach', // Cambiado de 'user' a 'coach'
    });
    await newUser.save();

    return NextResponse.json({ message: 'Usuario creado exitosamente.' }, { status: 201 });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({ message: 'Error en el servidor.' }, { status: 500 });
  }
} 