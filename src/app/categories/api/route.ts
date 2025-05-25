import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получить все категории
export async function GET() {
  const categories = await prisma.categories.findMany();
  return NextResponse.json(categories);
}

// Создать новую категорию
export async function POST(req: NextRequest) {
  const data = await req.json();
  const category = await prisma.categories.create({ data });
  return NextResponse.json(category);
}

// Обновить категорию
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;
  const category = await prisma.categories.update({ where: { id }, data: updateData });
  return NextResponse.json(category);
}

// Удалить категорию
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.categories.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 