import { appendFileSync } from "node:fs";
import { NextResponse } from "next/server";

const LOG_PATH = "/Users/rishabbhatt/Desktop/Velvet/velvet-app/.cursor/debug-a73999.log";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** Local-only sink for diagnostics emitted by the deployed Netlify app. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    appendFileSync(LOG_PATH, `${JSON.stringify(body)}\n`, "utf8");
    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: CORS_HEADERS });
  }
}
