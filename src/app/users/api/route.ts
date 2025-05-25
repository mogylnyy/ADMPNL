import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получить всех пользователей с балансом
export async function GET() {
  const users = await prisma.users.findMany({
    include: {
      balances: true,
    },
  });
  // Добавляем поле balance (берём первый баланс или 0)
  const usersWithBalance = users.map(u => ({
    ...u,
    balance: u.balances?.[0]?.amount ?? 0,
  }));
  return NextResponse.json(usersWithBalance);
}

// Создать нового пользователя
export async function POST(req: NextRequest) {
  const data = await req.json();
  const user = await prisma.users.create({ data });
  return NextResponse.json(user);
}

// Обновить пользователя
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;
  const user = await prisma.users.update({ where: { id }, data: updateData });
  return NextResponse.json(user);
}

// Удалить пользователя
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.users.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 