
'use server';
/**
 * @fileOverview AI flow for generating broadcast messages.
 *
 * - generateBroadcastMessage - Generates a broadcast message based on user instructions.
 * - GenerateBroadcastMessageInput - Input schema.
 * - GenerateBroadcastMessageOutput - Output schema.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBroadcastMessageInputSchema = z.object({
  instructions: z.string().describe('Инструкции от пользователя для содержания рассылки (например, "анонсируй новый продукт X", "распродажа подписок", "напомни о товаре Y тем, кто покупал категорию Z").'),
  targetAudienceDescription: z.string().optional().describe('Опционально: Описание целевой аудитории на основе выбранных фильтров (например, "пользователи с премиум подпиской", "пользователи, покупавшие товары из категорий: Категория1, Категория2", "пользователи, интересовавшиеся товарами: ТоварА, ТоварБ"). ИИ адаптирует сообщение, если предоставлено.'),
});
export type GenerateBroadcastMessageInput = z.infer<typeof GenerateBroadcastMessageInputSchema>;

const GenerateBroadcastMessageOutputSchema = z.object({
  generatedMessage: z.string().describe('Сгенерированное ИИ сообщение для рассылки, подходящее для Telegram.'),
});
export type GenerateBroadcastMessageOutput = z.infer<typeof GenerateBroadcastMessageOutputSchema>;

export async function generateBroadcastMessage(input: GenerateBroadcastMessageInput): Promise<GenerateBroadcastMessageOutput> {
  return generateBroadcastMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBroadcastMessagePrompt',
  input: {schema: GenerateBroadcastMessageInputSchema},
  output: {schema: GenerateBroadcastMessageOutputSchema},
  prompt: `Ты — эксперт-копирайтер по маркетингу для сервиса подписок, работающего через Telegram.
Твоя задача — сгенерировать краткое, привлекательное и дружелюбное сообщение для пользователей, которое будет отправлено через Telegram-бота.
Сообщение должно быть основано на инструкциях пользователя.

Инструкции пользователя:
"{{instructions}}"

{{#if targetAudienceDescription}}
При генерации учти, что целевая аудитория: "{{targetAudienceDescription}}"
Это может включать информацию о категориях товаров, которые они покупали, или о конкретных товарах, которыми они интересовались. Постарайся адаптировать стиль и содержание сообщения под эту аудиторию.
{{/if}}

Если в инструкциях пользователя или описании целевой аудитории упоминаются конкретные названия товаров или категорий, постарайся органично вписать их в сообщение или адаптировать предложение для пользователей, интересующихся этими товарами/категориями.

Сгенерируй текст сообщения для рассылки. Сделай его относительно коротким и по существу, подходящим для сообщения в Telegram.
Избегай слишком формального языка. Используй эмодзи уместно, если они улучшают сообщение.
Результатом должен быть только сам текст сообщения.
`,
});

const generateBroadcastMessageFlow = ai.defineFlow(
  {
    name: 'generateBroadcastMessageFlow',
    inputSchema: GenerateBroadcastMessageInputSchema,
    outputSchema: GenerateBroadcastMessageOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    // Ensure output is not null, if it can be.
    // For this prompt, it's expected to always return content or an error.
    if (!output) {
        throw new Error("AI failed to generate a message.");
    }
    return output;
  }
);


    