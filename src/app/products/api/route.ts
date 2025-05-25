import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получить все товары
export async function GET() {
  const products = await prisma.products.findMany();
  return NextResponse.json(products);
}

// Создать новый товар
export async function POST(req: NextRequest) {
  const data = await req.json();
  const product = await prisma.products.create({ data });
  return NextResponse.json(product);
}

// Обновить товар
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;
  const product = await prisma.products.update({ where: { id }, data: updateData });
  return NextResponse.json(product);
}

// Удалить товар
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.products.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 