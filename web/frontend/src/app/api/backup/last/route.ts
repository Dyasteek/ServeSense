import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions) as { user: { id: string } } | null;
  if (!session || !session.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await connectDB();
  const Backup = mongoose.models.Backup || mongoose.model('Backup', new mongoose.Schema({
    userId: String,
    backup: Object,
    createdAt: Date
  }, { collection: 'backups' }));

  const lastBackup = await Backup.findOne({ userId: session.user.id }).sort({ createdAt: -1 });
  if (!lastBackup) return NextResponse.json({ backup: null });

  return NextResponse.json({ backup: lastBackup.backup });
} 