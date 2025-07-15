import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as { user: { id: string } } | null;
  if (!session || !session.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { backup } = await req.json();
  if (!backup) return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 });

  await connectDB();
  // Usar modelo dinámico para backups
  const Backup = mongoose.models.Backup || mongoose.model('Backup', new mongoose.Schema({
    userId: String,
    backup: Object,
    createdAt: Date
  }, { collection: 'backups' }));

  await Backup.create({
    userId: session.user.id,
    backup,
    createdAt: new Date()
  });

  return NextResponse.json({ ok: true });
} 