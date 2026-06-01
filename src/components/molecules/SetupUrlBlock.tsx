"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  getAppBaseUrl,
  getAuthCallbackUrl,
  getSupabaseRedirectUrlHints,
} from "@/lib/app-url";
import { velvetToast } from "@/lib/toast";

interface SetupUrlBlockProps {
  /** Server-detected base URL (ngrok, localhost, production). */
  initialBaseUrl: string;
}

function UrlLine({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      velvetToast.success("Copied", label);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      velvetToast.error("Couldn't copy", "Select the URL and copy manually.");
    }
  }, [url, label]);

  return (
    <div className="rounded-xl border border-outline-variant/25 bg-bg-elevated p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          Copy
        </button>
      </div>
      <code className="block break-all text-sm text-on-surface">{url}</code>
    </div>
  );
}

export function SetupUrlBlock({ initialBaseUrl }: SetupUrlBlockProps) {
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);

  useEffect(() => {
    const envBase = getAppBaseUrl();
    const live =
      typeof window !== "undefined" ? window.location.origin : initialBaseUrl;
    setBaseUrl(envBase || live || initialBaseUrl);
  }, [initialBaseUrl]);

  const siteUrl = baseUrl || "(open this page from your app URL)";
  const callbackUrl = baseUrl ? getAuthCallbackUrl(baseUrl) : "/auth/callback";
  const redirectHints = baseUrl ? getSupabaseRedirectUrlHints(baseUrl) : [];

  return (
    <div className="space-y-3">
      <p className="text-sm text-on-surface-variant">
        Use the URLs for <strong className="text-on-surface">this environment</strong> in
        Supabase → Authentication → URL Configuration. They update when you use ngrok,
        localhost, or set{" "}
        <code className="rounded bg-bg-elevated px-1.5 py-0.5 text-xs">
          NEXT_PUBLIC_APP_URL
        </code>{" "}
        in <code className="rounded bg-bg-elevated px-1.5 py-0.5 text-xs">.env.local</code>.
      </p>

      <UrlLine label="Site URL" url={siteUrl} />
      <UrlLine label="Redirect URL (required)" url={callbackUrl} />

      {redirectHints.length > 1 && (
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low/80 p-3">
          <p className="mb-2 text-xs font-semibold text-on-surface-variant">
            Optional: add all of these under Redirect URLs
          </p>
          <ul className="space-y-1 text-xs text-on-surface-variant">
            {redirectHints.map((u) => (
              <li key={u}>
                <code className="break-all">{u}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
