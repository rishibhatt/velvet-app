"use client";

import { useMemo, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import {
  CollaboratorSearchInput,
  type ProfileSuggestion,
} from "@/components/molecules/CollaboratorSearchInput";
import { formatMemberRole } from "@/lib/collaborators";
import { useInviteMember } from "@/queries/board/mutations";
import type { BoardRole } from "@/types/board.types";
import { cn } from "@/lib/utils";
import { velvetToast } from "@/lib/toast";

const MAX_PENDING = 5;

export interface PendingCollaboratorInvite {
  profile: ProfileSuggestion;
  role: BoardRole;
}

interface CollaboratorInviteFieldsProps {
  boardId: string;
  isPublic?: boolean;
  existingUsernames?: string[];
  className?: string;
  onInvitesSent?: () => void;
}

export function CollaboratorInviteFields({
  boardId,
  isPublic = true,
  existingUsernames = [],
  className,
  onInvitesSent,
}: CollaboratorInviteFieldsProps) {
  const invite = useInviteMember(boardId);
  const [searchValue, setSearchValue] = useState("");
  const [pending, setPending] = useState<PendingCollaboratorInvite[]>([]);
  const defaultRole: BoardRole = isPublic ? "editor" : "viewer";

  const blockedUsernames = useMemo(() => {
    const set = new Set(
      [...existingUsernames, ...pending.map((p) => p.profile.username)].map((u) =>
        u.toLowerCase(),
      ),
    );
    return set;
  }, [existingUsernames, pending]);

  const atCapacity = pending.length >= MAX_PENDING;

  const addProfile = (profile: ProfileSuggestion) => {
    if (blockedUsernames.has(profile.username.toLowerCase())) {
      velvetToast.info(
        "Already added",
        "This person is already on the list or is a member.",
      );
      return;
    }
    if (atCapacity) {
      velvetToast.info("Limit reached", `You can invite up to ${MAX_PENDING} people at once.`);
      return;
    }
    setPending((prev) => [...prev, { profile, role: defaultRole }]);
    setSearchValue("");
  };

  const updateRole = (userId: string, role: BoardRole) => {
    setPending((prev) =>
      prev.map((entry) =>
        entry.profile.id === userId ? { ...entry, role } : entry,
      ),
    );
  };

  const removePending = (userId: string) => {
    setPending((prev) => prev.filter((entry) => entry.profile.id !== userId));
  };

  const sendInvites = async () => {
    if (pending.length === 0) return;
    const count = pending.length;
    try {
      for (const entry of pending) {
        await invite.mutateAsync({
          username: entry.profile.username,
          role: entry.role,
          silent: true,
        });
      }
      setPending([]);
      velvetToast.success(
        count > 1 ? `${count} invites sent` : "Invite sent",
        "They'll get a notification to accept or deny the collaboration.",
      );
      onInvitesSent?.();
    } catch {
      /* toast via mutation */
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <CollaboratorSearchInput
        value={searchValue}
        onChange={setSearchValue}
        onSelectProfile={addProfile}
        placeholder="username"
        disabled={atCapacity || invite.isPending}
      />

      {!isPublic && (
        <p className="rounded-xl bg-surface-container-low px-3 py-2 text-xs leading-relaxed text-on-surface-variant">
          Private collections are only visible to people you invite. New collaborators
          default to <span className="font-semibold text-on-surface">Viewer</span> unless
          you change their role.
        </p>
      )}

      {pending.length > 0 && (
        <ul className="space-y-2">
          {pending.map((entry) => (
            <li
              key={entry.profile.id}
              className="flex items-center gap-2 rounded-2xl border border-outline-variant/30 bg-surface-container-low px-3 py-2"
            >
              <Avatar
                src={entry.profile.avatar_url}
                name={entry.profile.full_name ?? entry.profile.username}
                size="sm"
                className="!h-8 !w-8 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {entry.profile.full_name ?? entry.profile.username}
                </p>
                <p className="truncate text-xs text-on-surface-variant">
                  @{entry.profile.username}
                </p>
              </div>
              <select
                value={entry.role}
                onChange={(e) =>
                  updateRole(entry.profile.id, e.target.value as BoardRole)
                }
                className="velvet-field max-w-[6.5rem] shrink-0 rounded-xl px-2 py-1.5 text-xs"
                aria-label={`Role for ${entry.profile.username}`}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="button"
                onClick={() => removePending(entry.profile.id)}
                className="shrink-0 rounded-full p-1.5 text-on-surface-variant transition hover:bg-error-container/30 hover:text-error"
                aria-label={`Remove ${entry.profile.username}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-on-surface-variant">
        {pending.length}/{MAX_PENDING} selected
        {pending.length > 0 &&
          ` · ${pending.map((p) => formatMemberRole(p.role)).join(", ")}`}
      </p>

      <Button
        type="button"
        size="sm"
        icon={UserPlus}
        className="w-full"
        loading={invite.isPending}
        disabled={pending.length === 0}
        onClick={() => void sendInvites()}
      >
        {pending.length > 1
          ? `Send ${pending.length} invites`
          : pending.length === 1
            ? "Send invite"
            : "Add people above"}
      </Button>
    </div>
  );
}
