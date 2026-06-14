import { describe, expect, it, beforeEach, vi } from "vitest";
import { buildTrackedUrl } from "@/lib/attribution/build";
import { captureAttributionFromSearchParams } from "@/lib/attribution/capture";
import { ATTRIBUTION_STORAGE_KEY } from "@/lib/attribution/constants";
import { hasAttributionParams, parseAttributionFromSearchParams } from "@/lib/attribution/parse";
import { resolveTrafficSource } from "@/lib/attribution/resolve-source";
import { getAttribution } from "@/lib/attribution/storage";

describe("parseAttributionFromSearchParams", () => {
  it("parses standard UTMs and click ids", () => {
    const params = new URLSearchParams(
      "utm_source=instagram&utm_medium=paid&utm_campaign=launch&utm_term=test&utm_content=ad1&gclid=abc",
    );
    expect(parseAttributionFromSearchParams(params)).toEqual({
      utm_source: "instagram",
      utm_medium: "paid",
      utm_campaign: "launch",
      utm_term: "test",
      utm_content: "ad1",
      gclid: "abc",
    });
  });

  it("returns empty object when no attribution params", () => {
    expect(hasAttributionParams(parseAttributionFromSearchParams(new URLSearchParams("foo=bar")))).toBe(
      false,
    );
  });
});

describe("buildTrackedUrl", () => {
  it("appends preset UTMs and src without dropping existing query params", () => {
    const result = buildTrackedUrl("/u/alice/summer?ref=1", "share_collection", {
      username: "alice",
      slug: "summer",
    });
    const params = new URLSearchParams(result.split("?")[1]);
    expect(params.get("ref")).toBe("1");
    expect(params.get("utm_source")).toBe("velvet");
    expect(params.get("utm_medium")).toBe("share");
    expect(params.get("utm_campaign")).toBe("collection");
    expect(params.get("utm_content")).toBe("alice/summer");
    expect(params.get("src")).toBe("share");
  });
});

describe("resolveTrafficSource", () => {
  it("prefers src param", () => {
    expect(resolveTrafficSource("?src=explore&utm_campaign=share")).toBe("explore");
  });

  it("maps utm_campaign explore to explore", () => {
    expect(resolveTrafficSource("?utm_campaign=explore")).toBe("explore");
  });

  it("defaults to direct", () => {
    expect(resolveTrafficSource("")).toBe("direct");
  });
});

describe("last-touch capture", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal("sessionStorage", {
      getItem(key: string) {
        return store[key] ?? null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
      removeItem(key: string) {
        delete store[key];
      },
    });
  });

  it("overwrites prior attribution on new capture", () => {
    captureAttributionFromSearchParams(
      new URLSearchParams("utm_source=instagram&utm_medium=paid&utm_campaign=a"),
    );
    captureAttributionFromSearchParams(
      new URLSearchParams("utm_source=twitter&utm_medium=organic&utm_campaign=b"),
    );
    const stored = getAttribution();
    expect(stored?.utm_source).toBe("twitter");
    expect(stored?.utm_campaign).toBe("b");
    expect(sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)).toContain("twitter");
  });
});
