"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Avatar } from "@/components/atoms/Avatar";
import { VelvetInputShell } from "@/components/atoms/VelvetInputShell";
import { cn } from "@/lib/utils";

export interface ProfileSuggestion {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface CollaboratorSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectProfile?: (profile: ProfileSuggestion) => void;
  inputId?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CollaboratorSearchInput({
  value,
  onChange,
  onSelectProfile,
  inputId,
  label = "Username",
  placeholder = "theirusername",
  className,
  inputClassName,
  required = false,
  disabled = false,
}: CollaboratorSearchInputProps) {
  const fallbackId = useId();
  const fieldId = inputId ?? fallbackId;
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const normalized = useMemo(
    () => value.trim().replace(/^@/, "").toLowerCase(),
    [value],
  );

  useEffect(() => {
    if (normalized.length < 2) {
      setSuggestions([]);
      setLoading(false);
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
        setPickerOpen(true);
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

  const showSuggestions = pickerOpen && normalized.length >= 2;

  const handleSelect = (profile: ProfileSuggestion) => {
    setPickerOpen(false);
    setSuggestions([]);
    if (onSelectProfile) {
      onSelectProfile(profile);
      onChange("");
    } else {
      onChange(profile.username);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={fieldId}
        className="text-xs font-bold tracking-widest text-on-surface-variant uppercase"
      >
        {label}
      </label>
      <VelvetInputShell
        prefix={<span className="shrink-0 text-on-surface-variant">@</span>}
      >
        <input
          id={fieldId}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value.trim().replace(/^@/, "").length >= 2) {
              setPickerOpen(true);
            }
          }}
          onFocus={() => {
            if (normalized.length >= 2) setPickerOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setPickerOpen(false), 150);
          }}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
          required={required}
          className={cn("text-sm", inputClassName)}
        />
      </VelvetInputShell>

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
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(profile)}
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
