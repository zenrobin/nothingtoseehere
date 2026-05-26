import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
  });
}
