import { NextResponse } from 'next/server';

export async function GET() {
  const hasConfig = !!process.env.API_KEY;
  return NextResponse.json({ hasConfig: hasConfig });
}
