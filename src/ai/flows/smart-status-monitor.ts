// This is an AI-powered tool that flags subscriptions with unusual end dates, such as those about to expire.
/**
 * @fileOverview Инструмент на базе ИИ для мониторинга подписок с необычными датами окончания или статусами.
 *
 * - smartStatusMonitor - Функция для анализа подписок и выявления проблемных.
 * - SmartStatusMonitorInput - Тип входных данных для функции smartStatusMonitor.
 * - SmartStatusMonitorOutput - Тип возвращаемых данных функции smartStatusMonitor.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubscriptionSchema = z.object({
  id: z.string().describe('Уникальный идентификатор подписки.'),
  userId: z.string().describe('ID пользователя, которому принадлежит подписка.'),
  productId: z.string().describe('ID товара, на который оформлена подписка.'),
  startDate: z.string().datetime().describe('Дата и время начала действия подписки.'),
  endDate: z.string().datetime().describe('Дата и время окончания действия подписки.'),
  status: z.enum(['active', 'inactive', 'pending', 'canceled', 'expired']).describe('Текущий статус подписки.'), // Added 'expired' to match types/index.ts
  autoRenew: z.boolean().describe('Указывает, настроено ли автопродление подписки.'),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

const SmartStatusMonitorInputSchema = z.array(SubscriptionSchema).describe('Массив подписок для анализа.');
export type SmartStatusMonitorInput = z.infer<typeof SmartStatusMonitorInputSchema>;

const FlaggedSubscriptionSchema = z.object({
  subscriptionId: z.string().describe('ID отмеченной подписки.'),
  reason: z.string().describe('Причина, по которой подписка была отмечена (на русском языке).'),
});

const SmartStatusMonitorOutputSchema = z.array(FlaggedSubscriptionSchema).describe('Массив подписок с необычными датами окончания или статусами.');
export type SmartStatusMonitorOutput = z.infer<typeof SmartStatusMonitorOutputSchema>;

export async function smartStatusMonitor(input: SmartStatusMonitorInput): Promise<SmartStatusMonitorOutput> {
  return smartStatusMonitorFlow(input);
}

const smartStatusMonitorPrompt = ai.definePrompt({
  name: 'smartStatusMonitorPrompt',
  input: {schema: SmartStatusMonitorInputSchema},
  output: {schema: SmartStatusMonitorOutputSchema},
  prompt: `Вы — ИИ-ассистент, предназначенный для анализа списка подписок и выявления тех, у которых необычные даты окончания или статусы. Необычные означает: срок действия скоро истекает (в течение 7 дней), или статус 'cancelled' (отменена) / 'expired' (истекла) при включенном автопродлении (autoRenew равно true).

Проанализируйте следующие подписки и отметьте те, которые соответствуют этим критериям. Верните JSON-массив объектов отмеченных подписок, содержащий subscriptionId и краткое описание причины на русском языке.

Подписки:
{{#each this}}
- ID: {{id}}, ID пользователя: {{userId}}, ID товара: {{productId}}, Дата начала: {{startDate}}, Дата окончания: {{endDate}}, Статус: {{status}}, Автопродление: {{autoRenew}}
{{/each}}`,
});

const smartStatusMonitorFlow = ai.defineFlow(
  {
    name: 'smartStatusMonitorFlow',
    inputSchema: SmartStatusMonitorInputSchema,
    outputSchema: SmartStatusMonitorOutputSchema,
  },
  async input => {
    const {output} = await smartStatusMonitorPrompt(input);
    return output!;
  }
);
