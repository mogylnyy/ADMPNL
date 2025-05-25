import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получить всех пользователей
export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

// Создать нового пользователя
export async function POST(req: NextRequest) {
  const data = await req.json();
  const user = await prisma.user.create({ data });
  return NextResponse.json(user);
}

// Обновить пользователя
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;
  const user = await prisma.user.update({ where: { id }, data: updateData });
  return NextResponse.json(user);
}

// Удалить пользователя
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 