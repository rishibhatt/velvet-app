import type { Board, BoardMember, Profile } from "@/types/board.types";

/** Profiles to show on collection cards (members with avatars, deduped). */
export function getBoardCollaboratorProfiles(board: Board): Profile[] {
  const seen = new Set<string>();
  const profiles: Profile[] = [];

  for (const member of board.members ?? []) {
    const profile = member.profile;
    if (!profile?.id || seen.has(profile.id)) continue;
    seen.add(profile.id);
    profiles.push(profile);
  }

  return profiles;
}

export function getCollaboratorCount(board: Board): number {
  return getBoardCollaboratorProfiles(board).length;
}

export function hasMultipleCollaborators(board: Board): boolean {
  return getCollaboratorCount(board) > 1;
}

export function formatMemberRole(role: BoardMember["role"]): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "editor":
      return "Editor";
    case "viewer":
      return "Viewer";
    default:
      return role;
  }
}
