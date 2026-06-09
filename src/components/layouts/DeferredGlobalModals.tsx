"use client";

import dynamic from "next/dynamic";

const GlobalModals = dynamic(
  () =>
    import("@/components/layouts/GlobalModals").then((m) => ({
      default: m.GlobalModals,
    })),
  { ssr: false },
);

export function DeferredGlobalModals() {
  return <GlobalModals />;
}
