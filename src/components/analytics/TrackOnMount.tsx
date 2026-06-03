"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import type { AnalyticsEventName, AnalyticsProperties } from "@/lib/analytics/events";

export function TrackOnMount({
  event,
  properties,
}: {
  event: AnalyticsEventName;
  properties?: AnalyticsProperties;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track(event, properties);
  }, [event, properties]);

  return null;
}
