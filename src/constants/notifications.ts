import type { NotificationType } from "@/types/board.types";

export function getNotificationLabel(
  type: NotificationType,
  metadata?: Record<string, unknown> | null,
): { title: string; body?: string } {
  switch (type) {
    case "board_viewed_milestone":
      return {
        title: `${metadata?.title ?? "Your collection"} hit ${metadata?.count ?? ""} views!`,
        body: "Keep sharing your inspiration.",
      };
    case "item_resaved":
      return {
        title: "Someone saved your item",
        body: "A creator added one of your saves to their collection.",
      };
    case "board_featured":
      return {
        title: `Velvet featured "${metadata?.title ?? "your collection"}"`,
        body: "Your board is highlighted in Explore.",
      };
    case "weekly_digest":
      return {
        title: "Your weekly creator recap",
        body: `Your boards were seen by ${metadata?.views ?? 0} people this week.`,
      };
    case "badge_earned":
      return {
        title: "Badge earned",
        body: `You earned the ${String(metadata?.badge_type ?? "creator").replace(/_/g, " ")} badge.`,
      };
    case "collaborator_added":
      return {
        title: "Added to a collection",
        body: String(metadata?.title ?? "You were added as a collaborator."),
      };
    default:
      return { title: "Notification" };
  }
}
