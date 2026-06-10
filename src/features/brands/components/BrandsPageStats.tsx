"use client";

import { useEffect, useState } from "react";

export function BrandsPageStats() {
  const [stats, setStats] = useState({ collections: 0, saves: 0, moods: 6 });

  useEffect(() => {
    void fetch("/api/stats/platform")
      .then((r) => r.json())
      .then((data: { collections?: number; saves?: number; moods?: number }) => {
        setStats({
          collections: data.collections ?? 0,
          saves: data.saves ?? 0,
          moods: data.moods ?? 6,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-6 text-center">
      <div>
        <p className="font-display text-3xl text-primary">{stats.collections.toLocaleString()}</p>
        <p className="text-sm text-on-surface-variant">collections</p>
      </div>
      <div>
        <p className="font-display text-3xl text-primary">{stats.saves.toLocaleString()}</p>
        <p className="text-sm text-on-surface-variant">saves this month</p>
      </div>
      <div>
        <p className="font-display text-3xl text-primary">{stats.moods}</p>
        <p className="text-sm text-on-surface-variant">mood categories</p>
      </div>
    </div>
  );
}
