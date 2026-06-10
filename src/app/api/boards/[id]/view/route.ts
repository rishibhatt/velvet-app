import { viewsService } from "@/services/views/views.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: boardId } = await params;
    const body = await request.json().catch(() => ({}));
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const userAgent = request.headers.get("user-agent") ?? "";

    await viewsService.trackView({
      boardId,
      source: typeof body.source === "string" ? body.source : "direct",
      referrer: typeof body.referrer === "string" ? body.referrer : null,
      ip,
      userAgent,
    });
  } catch {
    // silent
  }
  return Response.json({ ok: true });
}
