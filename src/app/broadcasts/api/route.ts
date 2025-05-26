import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TELEGRAM_BOT_TOKEN = '7201712576:AAF7M8WZBcCrkuUqMDPw2VISaWXaXIDHbDY';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// POST /api/broadcasts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, filterSubscriptionActivity, filterPurchasedProducts } = body;
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Формируем фильтр пользователей
    let where: any = {};
    if (filterSubscriptionActivity === 'purchased_any') {
      where.subscription = { some: {} };
    } else if (filterSubscriptionActivity === 'not_purchased_any') {
      where.subscription = { none: {} };
    }
    if (filterPurchasedProducts) {
      const productIds = filterPurchasedProducts.split(',').map((id: string) => id.trim()).filter(Boolean);
      if (productIds.length > 0) {
        where.orders = {
          some: {
            product_id: { in: productIds.map(Number).filter(Boolean) }
          }
        };
      }
    }

    // Получаем пользователей по фильтру
    const users = await prisma.users.findMany({
      where,
      select: { telegram_id: true }
    });

    // Отправляем сообщение каждому пользователю
    const results = await Promise.all(users.map(async (user) => {
      if (!user.telegram_id) return { telegram_id: null, ok: false };
      const res = await fetch(TELEGRAM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegram_id.toString(),
          text: message
        })
      });
      return { telegram_id: user.telegram_id, ok: res.ok };
    }));

    return NextResponse.json({ sent: results.filter(r => r.ok).length, total: users.length });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
} 