import { NextResponse } from 'next/server';

export async function GET() {
  const hasApiKey = !!process.env.API_KEY;
  const hasApiVersion = !!process.env.API_VERSION;
  return NextResponse.json({ hasApiKey, hasApiVersion });
}
