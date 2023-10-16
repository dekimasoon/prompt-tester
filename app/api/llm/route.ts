import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CallLLMRequestSchema, Models } from '@/type';

export async function POST(req: Request) {
  const body = await req.json();
  const parsedBody = CallLLMRequestSchema.safeParse(body);
  if (parsedBody.success === false) {
    return new NextResponse(null, {
      status: 500,
    });
  }

  const { request, config } = parsedBody.data;
  const model = Models.find((x) => x.id === request.modelId);
  if (!model) {
    return new NextResponse(null, {
      status: 500,
    });
  }

  const apiKey = process.env.API_KEY || config?.apiKey;
  const baseUrl = process.env.API_BASE_URL || config?.apiBaseURL;
  const apiVersion = process.env.API_VERSION || config?.apiVersion;
  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl || undefined,
    defaultQuery: apiVersion ? { 'api-version': apiVersion } : undefined,
    defaultHeaders: { 'api-key': apiKey },
    maxRetries: 2,
  });

  const userMessage = { role: 'user', content: request.userPrompt } as const;
  const response = await client.chat.completions.create({
    model: model.apiName,
    messages: request.systemPrompt
      ? [{ role: 'system', content: request.systemPrompt }, userMessage]
      : [userMessage],
    temperature: request.temperature,
  });
  return NextResponse.json({ result: response.choices[0].message.content ?? '' });
}
