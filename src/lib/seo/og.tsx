import { ImageResponse } from "next/og";
import { BRAND } from "@/constants/brand";

export function collectionOgImage(input: {
  title: string;
  creator: string;
  coverUrl?: string | null;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "#f8f2ee",
          color: "#241916",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {input.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={input.coverUrl} width="520" height="630" style={{ objectFit: "cover" }} />
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: 72 }}>
          <div style={{ fontSize: 30, color: "#8a4f45", marginBottom: 28 }}>{BRAND.name}</div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>{input.title}</div>
          <div style={{ fontSize: 34, marginTop: 32, color: "#6b5751" }}>Curated by {input.creator}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
