import { NextResponse } from "next/server";
import { runDogAgent } from "../../../lib/dog-agent/graph";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { question?: unknown };
    const question = typeof body.question === "string" ? body.question.trim() : "";

    if (!question || question.length > 500) {
      return NextResponse.json({ error: "Ask a question up to 500 characters long." }, { status: 400 });
    }

    return NextResponse.json(await runDogAgent(question));
  } catch {
    return NextResponse.json({ error: "The dog assistant is unavailable right now." }, { status: 500 });
  }
}