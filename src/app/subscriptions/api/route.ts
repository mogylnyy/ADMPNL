import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получить все подписки
export async function GET() {
  const subscriptions = await prisma.subscriptions.findMany({ include: { user: true, product: true } });
  return NextResponse.json(subscriptions);
}

// Создать новую подписку
export async function POST(req: NextRequest) {
  const data = await req.json();
  const subscription = await prisma.subscriptions.create({ data });
  return NextResponse.json(subscription);
}

// Обновить подписку
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;
  const subscription = await prisma.subscriptions.update({ where: { id }, data: updateData });
  return NextResponse.json(subscription);
}

// Удалить подписку
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.subscriptions.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 