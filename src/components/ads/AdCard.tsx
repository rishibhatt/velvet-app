"use client";

import { VelvetImage } from "@/components/atoms/VelvetImage";
import type { AdUnit } from "@/types/board.types";
import { COLLECTION_CARD_SHELL } from "@/constants/collection-ui";
import { cn } from "@/lib/utils";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

interface AdCardProps {
  ad: AdUnit;
  className?: string;
}

export function AdCard({ ad, className }: AdCardProps) {
  const brandName = ad.campaign?.brand_name ?? "Brand";
  const logo = ad.campaign?.brand_logo_url;

  const handleClick = () => {
    track(ANALYTICS_EVENTS.AD_CLICKED, {
      ad_unit_id: ad.id,
      placement: ad.placement,
    });
    void fetch("/api/ads/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_unit_id: ad.id }),
    }).catch(() => {});
    window.open(ad.cta_url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(COLLECTION_CARD_SHELL, "group relative block w-full text-left", className)}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[inherit] bg-surface-container-low">
        {ad.image_url ? (
          <VelvetImage
            src={ad.image_url}
            alt={ad.headline ?? brandName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 280px"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-fixed/40 to-secondary-fixed/30 p-6">
            <p className="font-display text-center text-lg text-on-surface">
              {ad.headline ?? brandName}
            </p>
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
          {logo && (
            <VelvetImage
              src={logo}
              alt=""
              width={16}
              height={16}
              className="rounded-full"
            />
          )}
          Sponsored
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
          <p className="font-display line-clamp-2 text-sm text-white">
            {ad.headline ?? brandName}
          </p>
          <span className="mt-1 inline-block text-xs font-semibold text-white/90">
            {ad.cta_text ?? "View Collection"}
          </span>
        </div>
      </div>
    </button>
  );
}
