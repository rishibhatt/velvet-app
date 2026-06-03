import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";

const TAG_SUGGESTIONS: Record<string, string[]> = {
  wedding: ["Romantic", "Floral", "Elegant", "Blush"],
  travel: ["Adventure", "Minimalist", "Landscape", "WarmIvory"],
  fashion: ["Streetwear", "Silhouette", "Monochrome", "Editorial"],
  home: ["MidCentury", "Organic", "WarmIvory", "Minimalist"],
  default: ["Minimalist", "WarmIvory", "Inspiration", "Curated"],
};

export async function POST(request: Request) {
  const { error } = await requireApiUser();
  if (error) return error;

  try {
    const { title } = await request.json();
    const lower = (title ?? "").toLowerCase();

    let tags = TAG_SUGGESTIONS.default;
    if (lower.includes("wedding") || lower.includes("bridal"))
      tags = TAG_SUGGESTIONS.wedding;
    else if (lower.includes("travel") || lower.includes("landscape"))
      tags = TAG_SUGGESTIONS.travel;
    else if (lower.includes("fashion") || lower.includes("outfit"))
      tags = TAG_SUGGESTIONS.fashion;
    else if (lower.includes("home") || lower.includes("interior"))
      tags = TAG_SUGGESTIONS.home;
    else {
      const words = (title ?? "")
        .split(/\s+/)
        .filter((w: string) => w.length > 4)
        .slice(0, 2)
        .map((w: string) => w.replace(/[^a-zA-Z]/g, ""));
      tags = [...new Set([...words, ...TAG_SUGGESTIONS.default])].slice(0, 4);
    }

    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json(
      { tags: ["Minimalist", "WarmIvory", "Inspiration"] },
      { status: 200 },
    );
  }
}
