"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/atoms/Avatar";
import { cn } from "@/lib/utils";

interface ProfileSuggestion {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface CollaboratorSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function CollaboratorSearchInput({
  value,
  onChange,
  inputId,
  label = "Username",
  placeholder = "theirusername",
  className,
  inputClassName,
}: CollaboratorSearchInputProps) {
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const normalized = useMemo(
    () => value.trim().replace(/^@/, "").toLowerCase(),
    [value],
  );

  useEffect(() => {
    if (normalized.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/profiles/search?q=${encodeURIComponent(normalized)}`,
          { signal: controller.signal },
        );
        const json = (await response.json()) as {
          profiles?: ProfileSuggestion[];
        };
        setSuggestions(json.profiles ?? []);
      } catch {
        if (!controller.signal.aborted) setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [normalized]);

  const showSuggestions = normalized.length >= 2;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={inputId}
        className="text-xs font-bold tracking-widest text-on-surface-variant uppercase"
      >
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 focus-within:border-primary">
        <span className="text-on-surface-variant">@</span>
        <input
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "min-w-0 flex-1 bg-transparent text-on-surface placeholder:text-outline/70 focus:outline-none",
            inputClassName,
          )}
          required
        />
      </div>

      {showSuggestions && (
        <div className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-bg-elevated shadow-sm">
          {loading ? (
            <p className="px-3 py-3 text-sm text-on-surface-variant">
              Searching people...
            </p>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
              {suggestions.map((profile) => (
                <li key={profile.id}>
                  <button
                    type="button"
                    onClick={() => onChange(profile.username)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-surface-container-low"
                  >
                    <Avatar
                      src={profile.avatar_url}
                      name={profile.full_name ?? profile.username}
                      size="sm"
                      className="!h-8 !w-8 shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-on-surface">
                        {profile.full_name ?? profile.username}
                      </span>
                      <span className="block truncate text-xs text-on-surface-variant">
                        @{profile.username}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-on-surface-variant">
              No matching people found.
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-on-surface-variant">
        Type at least 2 characters to search existing Velvet users.
      </p>
    </div>
  );
}
