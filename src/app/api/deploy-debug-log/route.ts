import { mkdirSync, appendFileSync } from "node:fs";
import { NextResponse } from "next/server";

const LOG_PATH = "/Users/rishabbhatt/Desktop/Velvet/velvet-app/.cursor/debug-a73999.log";
const EMPTY_GIF = Uint8Array.from([
  71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0, 255, 255, 255, 33, 249, 4, 1,
  0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
]);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function writeLog(body: unknown) {
  mkdirSync("/Users/rishabbhatt/Desktop/Velvet/velvet-app/.cursor", { recursive: true });
  appendFileSync(LOG_PATH, `${JSON.stringify(body)}\n`, "utf8");
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const payload = url.searchParams.get("payload");
    if (payload) writeLog(JSON.parse(payload));
    return new NextResponse(EMPTY_GIF, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store",
        ...CORS_HEADERS,
      },
    });
  } catch {
    return new NextResponse(EMPTY_GIF, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store",
        ...CORS_HEADERS,
      },
    });
  }
}

/** Local-only sink for diagnostics emitted by the deployed Netlify app. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    writeLog(body);
    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: CORS_HEADERS });
  }
}
