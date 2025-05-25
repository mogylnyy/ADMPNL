import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Пример вызова:
// const completion = await openai.chat.completions.create({ ... });
