
'use server';
/**
 * @fileOverview AI flow for sales analysis and recommendations.
 *
 * - analyzeSales - Analyzes sales based on user query.
 * - SalesAnalysisInput - Input schema.
 * - SalesAnalysisOutput - Output schema.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SalesAnalysisInputSchema = z.object({
  userQuery: z.string().describe('Запрос пользователя для анализа продаж или получения рекомендаций (например, "проанализируй продажи за последний месяц по категории Подписки", "какие товары были самые продаваемые в этом году?", "посоветуй, как увеличить продажи").'),
});
export type SalesAnalysisInput = z.infer<typeof SalesAnalysisInputSchema>;

const SalesAnalysisOutputSchema = z.object({
  report: z.string().describe('Сгенерированный ИИ отчет по продажам или рекомендация на основе запроса пользователя. Ответ должен быть на русском языке и может использовать Markdown для форматирования.'),
});
export type SalesAnalysisOutput = z.infer<typeof SalesAnalysisOutputSchema>;

export async function analyzeSales(input: SalesAnalysisInput): Promise<SalesAnalysisOutput> {
  return salesAnalysisFlow(input);
}

const salesAnalysisPrompt = ai.definePrompt({
  name: 'salesAnalysisPrompt',
  input: {schema: SalesAnalysisInputSchema},
  output: {schema: SalesAnalysisOutputSchema},
  prompt: `Ты — гениальный AI-аналитик продаж и опытный продажник для сервиса подписок SubMan Admin.
Тебе доступны все данные о продажах, товарах, категориях, пользователях и их заказах за всё время (это гипотетическое допущение для генерации ответа).

Твои задачи:
1.  **Генерировать отчеты по продажам**:
    *   Понимать запросы на анализ за определенные периоды (например, "прошлый месяц", "последний квартал", "с 1 января по 15 февраля").
    *   Анализировать продажи по конкретным товарам или категориям, если указано в запросе.
    *   В отчете должны быть ключевые метрики (например, объем продаж, количество проданных единиц, популярные товары/категории) и краткие выводы. Ответ должен быть на русском языке.
2.  **Давать рекомендации по продажам (в роли "гениального продажника")**:
    *   Если пользователь спрашивает "что лучше продается?", "куда держать направление?", "какие товары продвигать?", давай конкретные, основанные на (гипотетических) данных, рекомендации на русском языке.
    *   Учитывай сезонность, тренды (если можешь их предположить на основе общих знаний).
    *   Предлагай возможные акции или маркетинговые ходы.

Обрабатывай запрос пользователя:
"{{userQuery}}"

Если запрос неясный или требует данных, которых у тебя гипотетически не может быть (например, специфические внешние рыночные данные, которых нет в системе SubMan Admin, или данные о конкретных пользователях, если это не разрешено), вежливо уточни или сообщи об ограничении.
Формируй ответ в виде структурированного, но легко читаемого текста на русском языке. Используй Markdown для форматирования (например, списки, заголовки, выделение жирным шрифтом), если это улучшит читаемость отчета.
Например, для отчета о продажах можно использовать заголовки Markdown (##) и списки.
Для рекомендаций можно использовать маркированные списки.
Старайся делать отчет содержательным и полезным.
`,
});

const salesAnalysisFlow = ai.defineFlow(
  {
    name: 'salesAnalysisFlow',
    inputSchema: SalesAnalysisInputSchema,
    outputSchema: SalesAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await salesAnalysisPrompt(input);
    if (!output) {
        throw new Error("AI не смог сгенерировать отчет по продажам.");
    }
    return output;
  }
);
