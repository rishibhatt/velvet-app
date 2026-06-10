import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";
import { createClient } from "@/services/supabase/server";
import type { AdUnit } from "@/types/board.types";

export const adsService = {
  async serveAds(input: {
    placement: string;
    mood?: string | null;
    limit?: number;
  }): Promise<AdUnit[]> {
    const limit = input.limit ?? 2;
    const supabase = isServiceRoleConfigured()
      ? createServiceClient()
      : await createClient();

    const today = new Date().toISOString().split("T")[0]!;

    const { data: units } = await supabase
      .from("ad_units")
      .select("*")
      .eq("is_active", true)
      .eq("placement", input.placement);

    const campaignIds = [...new Set((units ?? []).map((u) => u.campaign_id))];
    const { data: campaigns } = campaignIds.length
      ? await supabase.from("ad_campaigns").select("*").in("id", campaignIds)
      : { data: [] as Array<{
          id: string;
          brand_name: string;
          brand_logo_url: string | null;
          status: string | null;
          target_moods: string[] | null;
          start_date: string | null;
          end_date: string | null;
        }> };

    const campaignMap = new Map((campaigns ?? []).map((c) => [c.id, c]));

    const filtered = (units ?? []).filter((u) => {
      const campaign = campaignMap.get(u.campaign_id);
      if (!campaign || campaign.status !== "active") return false;
      const moods = campaign.target_moods ?? [];
      if (input.mood && moods.length > 0 && !moods.includes(input.mood)) {
        return false;
      }
      if (campaign.start_date && campaign.start_date > today) return false;
      if (campaign.end_date && campaign.end_date < today) return false;
      return true;
    });

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, limit);

    for (const unit of selected) {
      void supabase.from("ad_events").insert({
        ad_unit_id: unit.id,
        event_type: "impression",
        mood_context: input.mood ?? null,
      });
      void supabase
        .from("ad_units")
        .update({ impressions: (unit.impressions ?? 0) + 1 })
        .eq("id", unit.id);
    }

    return selected.map((u) => {
      const campaign = campaignMap.get(u.campaign_id);
      return {
        ...u,
        campaign: campaign
          ? { brand_name: campaign.brand_name, brand_logo_url: campaign.brand_logo_url }
          : undefined,
      } as AdUnit;
    });
  },

  async trackClick(adUnitId: string, fingerprint?: string, userId?: string | null) {
    const supabase = isServiceRoleConfigured()
      ? createServiceClient()
      : await createClient();

    const { data: unit } = await supabase
      .from("ad_units")
      .select("cta_url, clicks")
      .eq("id", adUnitId)
      .single();

    if (!unit) return null;

    await supabase.from("ad_events").insert({
      ad_unit_id: adUnitId,
      event_type: "click",
      fingerprint: fingerprint ?? null,
      user_id: userId ?? null,
    });

    await supabase
      .from("ad_units")
      .update({ clicks: (unit.clicks ?? 0) + 1 })
      .eq("id", adUnitId);

    return unit.cta_url;
  },
};
