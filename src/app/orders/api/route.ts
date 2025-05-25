import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получить все заказы
export async function GET() {
  const orders = await prisma.orders.findMany({ include: { user: true, products: true } });
  return NextResponse.json(orders);
}

// Создать новый заказ
export async function POST(req: NextRequest) {
  const data = await req.json();
  const order = await prisma.orders.create({ data });
  return NextResponse.json(order);
}

// Обновить заказ
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;
  const order = await prisma.orders.update({ where: { id }, data: updateData });
  return NextResponse.json(order);
}

// Удалить заказ
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.orders.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 