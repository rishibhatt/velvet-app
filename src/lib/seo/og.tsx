import { ImageResponse } from "next/og";
import { BRAND } from "@/constants/brand";

const OG_SIZE = { width: 1200, height: 630 };

function OgBrandMark() {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 28,
        color: "#8a4f45",
        marginBottom: 20,
        fontWeight: 600,
      }}
    >
      {BRAND.name}
    </div>
  );
}

function OgPreviewGrid({ urls }: { urls: string[] }) {
  const images = urls.filter(Boolean).slice(0, 4);
  const count = images.length;

  if (count === 0) {
    return (
      <div
        style={{
          display: "flex",
          width: 520,
          height: "100%",
          background: "linear-gradient(135deg, #f3e8ff 0%, #fce7f3 50%, #ffedd5 100%)",
        }}
      />
    );
  }

  if (count === 1) {
    return (
      <div style={{ display: "flex", width: 520, height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt="" width={520} height={630} style={{ objectFit: "cover" }} />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div style={{ display: "flex", width: 520, height: "100%" }}>
        {images.map((src, i) => (
          <div key={i} style={{ display: "flex", flex: 1, height: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" width={260} height={630} style={{ objectFit: "cover" }} />
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: 520,
          height: "100%",
        }}
      >
        {images.slice(0, 2).map((src, i) => (
          <div key={i} style={{ display: "flex", width: "50%", height: "50%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" width={260} height={315} style={{ objectFit: "cover" }} />
          </div>
        ))}
        <div style={{ display: "flex", width: "100%", height: "50%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[2]} alt="" width={520} height={315} style={{ objectFit: "cover" }} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: 520,
        height: "100%",
      }}
    >
      {images.map((src, i) => (
        <div key={i} style={{ display: "flex", width: "50%", height: "50%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" width={260} height={315} style={{ objectFit: "cover" }} />
        </div>
      ))}
    </div>
  );
}

export function collectionOgImage(input: {
  title: string;
  creator: string;
  previewUrls?: string[];
}) {
  const previews = (input.previewUrls ?? []).filter(Boolean).slice(0, 4);

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
        <OgPreviewGrid urls={previews} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: 56,
            minWidth: 0,
          }}
        >
          <OgBrandMark />
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.08,
              display: "flex",
            }}
          >
            {input.title.slice(0, 80)}
          </div>
          <div style={{ fontSize: 30, marginTop: 24, color: "#6b5751", display: "flex" }}>
            Curated by {input.creator}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

export function profileOgImage(input: {
  name: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #faf5f2 0%, #f3e8ff 45%, #fce7f3 100%)",
          color: "#241916",
          fontFamily: "Arial, sans-serif",
          alignItems: "center",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 220,
            height: 220,
            borderRadius: 110,
            overflow: "hidden",
            border: "6px solid #fff",
            boxShadow: "0 12px 40px rgba(36,25,22,0.12)",
            marginRight: 56,
            flexShrink: 0,
            background: "#e8ddd8",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {input.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={input.avatarUrl}
              alt=""
              width={220}
              height={220}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div style={{ fontSize: 72, fontWeight: 700, color: "#8a4f45" }}>
              {(input.name[0] ?? "@").toUpperCase()}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <OgBrandMark />
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, display: "flex" }}>
            {input.name.slice(0, 48)}
          </div>
          <div style={{ fontSize: 32, marginTop: 16, color: "#8a4f45", display: "flex" }}>
            @{input.username}
          </div>
          {input.bio ? (
            <div
              style={{
                fontSize: 26,
                marginTop: 28,
                color: "#6b5751",
                lineHeight: 1.35,
                display: "flex",
              }}
            >
              {input.bio.slice(0, 120)}
            </div>
          ) : null}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
