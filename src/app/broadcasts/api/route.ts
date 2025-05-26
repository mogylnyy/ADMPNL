import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TELEGRAM_BOT_TOKEN = '7201712576:AAF7M8WZBcCrkuUqMDPw2VISaWXaXIDHbDY';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Отправляет сообщение через Telegram Bot API
 */
async function sendTelegramMessage(chat_id: string | number, message: string, parse_mode?: string) {
  const response = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id,
      text: message,
      parse_mode
    })
  });
  return response.json();
}

/**
 * Отправляет фото через Telegram Bot API
 */
async function sendTelegramPhoto(chat_id: string | number, photo_url: string, caption?: string, parse_mode?: string) {
  const response = await fetch(`${TELEGRAM_API_BASE}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id,
      photo: photo_url,
      caption,
      parse_mode
    })
  });
  return response.json();
}

/**
 * Отправляет документ через Telegram Bot API
 */
async function sendTelegramDocument(chat_id: string | number, document_url: string, caption?: string, parse_mode?: string) {
  const response = await fetch(`${TELEGRAM_API_BASE}/sendDocument`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id,
      document: document_url,
      caption,
      parse_mode
    })
  });
  return response.json();
}

/**
 * Сохраняет рассылку для отложенной отправки
 */
async function saveScheduledBroadcast(data: any) {
  // TODO: Реализовать сохранение в базу данных
  console.log('Сохранение запланированной рассылки:', data);
  return { id: `scheduled_${Date.now()}`, ...data };
}

// POST /broadcasts/api
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      parse_mode,
      photo_url,
      document_url,
      schedule_at,
      filterSubscriptionActivity,
      filterPurchasedProducts,
      selectedCategories
    } = body;

    // Проверка наличия контента для отправки
    if (!message && !photo_url && !document_url) {
      return NextResponse.json({ error: 'Message, photo_url or document_url is required' }, { status: 400 });
    }

    // Проверка времени отправки (если задано)
    const isScheduled = !!schedule_at;
    const scheduleDate = schedule_at ? new Date(schedule_at) : null;
    const isScheduleInFuture = scheduleDate && scheduleDate > new Date();

    // Формируем фильтр пользователей
    let where: any = {};
    
    // Фильтр по активности подписок
    if (filterSubscriptionActivity === 'purchased_any') {
      where.subscription = { some: {} };
    } else if (filterSubscriptionActivity === 'not_purchased_any') {
      where.subscription = { none: {} };
    }
    
    // Фильтр по купленным товарам
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
    
    // Фильтр по категориям
    if (selectedCategories && selectedCategories.length > 0) {
      where.orders = {
        some: {
          products: {
            category_id: { in: selectedCategories.map(Number).filter(Boolean) }
          }
        }
      };
    }

    // Получаем пользователей по фильтру
    const users = await prisma.users.findMany({
      where,
      select: { telegram_id: true }
    });

    // Если это запланированная рассылка в будущем - сохраняем задачу
    if (isScheduled && isScheduleInFuture) {
      const scheduledData = {
        message,
        parse_mode,
        photo_url,
        document_url,
        schedule_at: scheduleDate,
        filter: where,
        user_count: users.length,
        created_at: new Date()
      };
      
      const savedSchedule = await saveScheduledBroadcast(scheduledData);
      return NextResponse.json({ 
        scheduled: true, 
        schedule_at: scheduleDate, 
        user_count: users.length,
        schedule_id: savedSchedule.id
      });
    }

    // Иначе отправляем сообщения сразу
    const results = await Promise.all(users.map(async (user) => {
      if (!user.telegram_id) return { telegram_id: null, ok: false };
      
      try {
        let result;
        
        if (photo_url) {
          // Отправка фото с опциональной подписью
          result = await sendTelegramPhoto(
            user.telegram_id.toString(),
            photo_url,
            message, // используем message как caption
            parse_mode
          );
        } else if (document_url) {
          // Отправка документа с опциональной подписью
          result = await sendTelegramDocument(
            user.telegram_id.toString(),
            document_url,
            message, // используем message как caption
            parse_mode
          );
        } else {
          // Отправка обычного текстового сообщения
          result = await sendTelegramMessage(
            user.telegram_id.toString(),
            message,
            parse_mode
          );
        }
        
        return { telegram_id: user.telegram_id, ok: result.ok };
      } catch (error) {
        console.error(`Ошибка отправки сообщения для ${user.telegram_id}:`, error);
        return { telegram_id: user.telegram_id, ok: false, error };
      }
    }));

    return NextResponse.json({ 
      sent: results.filter(r => r.ok).length, 
      failed: results.filter(r => !r.ok).length,
      total: users.length 
    });
  } catch (e) {
    console.error('Ошибка обработки запроса:', e);
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// GET /broadcasts/api
export async function GET(req: NextRequest) {
  // TODO: Реализовать получение списка запланированных рассылок
  return NextResponse.json({ 
    scheduled: [] // В будущем здесь будет список запланированных рассылок
  });
}

// DELETE /broadcasts/api
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Broadcast ID is required' }, { status: 400 });
    }
    
    // TODO: Реализовать удаление запланированной рассылки из базы данных
    console.log(`Удаление запланированной рассылки с ID: ${id}`);
    
    return NextResponse.json({ success: true, id });
  } catch (e) {
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : 'Unknown error' 
    }, { status: 500 });
  }
} 