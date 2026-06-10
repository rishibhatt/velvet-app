import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";

export async function maybeRewriteAffiliateUrl(
  url: string,
  itemId?: string,
): Promise<string> {
  try {
    if (!isServiceRoleConfigured()) return url;
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, "");

    const supabase = createServiceClient();
    const { data: programs } = await supabase
      .from("affiliate_programs")
      .select("*")
      .eq("is_active", true);

    type ProgramRow = {
      id: string;
      base_domains: string[];
      tracking_param: string;
      affiliate_value: string;
      name: string;
    };

    const match = (programs as ProgramRow[] | null)?.find((p) =>
      p.base_domains.some((d) => domain.endsWith(d)),
    );
    if (!match) return url;

    const tag =
      process.env.AMAZON_ASSOCIATE_TAG &&
      match.tracking_param === "tag" &&
      match.name.includes("Amazon")
        ? process.env.AMAZON_ASSOCIATE_TAG
        : match.affiliate_value;

    parsed.searchParams.set(match.tracking_param, tag);
    const rewritten = parsed.toString();

    if (itemId) {
      void supabase.from("affiliate_clicks").insert({
        item_id: itemId,
        affiliate_program_id: match.id,
        original_url: url,
        rewritten_url: rewritten,
      });
    }

    return rewritten;
  } catch {
    return url;
  }
}
