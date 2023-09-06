import { CallLLMRequestSchema, Models } from '@/type';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.API_BASE_URL,
  defaultQuery: { 'api-version': process.env.API_VERSION },
  defaultHeaders: { 'api-key': process.env.API_KEY },
  timeout: 5_000,
  maxRetries: 2,
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsedBody = CallLLMRequestSchema.safeParse(body);
  if (parsedBody.success === false) {
    return new NextResponse(null, {
      status: 500,
    });
  }
  console.log(body);

  const model = Models.find((x) => x.id === parsedBody.data.modelId);
  if (!model) {
    return new NextResponse(null, {
      status: 500,
    });
  }

  const userMessage = { role: 'user', content: parsedBody.data.userPrompt } as const;
  const response = await client.chat.completions.create({
    model: model.apiName,
    messages: parsedBody.data.systemPrompt
      ? [{ role: 'system', content: parsedBody.data.systemPrompt }, userMessage]
      : [userMessage],
    temperature: parsedBody.data.temperature,
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(c) {
      for await (const x of response) {
        const chunk = x.choices[0]?.delta?.content ?? '';
        if (chunk.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, model.streamSleepDuration));
          c.enqueue(encoder.encode(chunk));
        }
      }
      c.close();
    },
  });
  return new NextResponse(stream);
}
