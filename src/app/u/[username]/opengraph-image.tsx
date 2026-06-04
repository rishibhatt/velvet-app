import { getPublicProfile } from "@/lib/public-collection";
import { profileOgImage } from "@/lib/seo/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) {
    return profileOgImage({ name: "Velvet", username: "creator" });
  }

  return profileOgImage({
    name: data.profile.full_name ?? data.profile.username,
    username: data.profile.username,
    avatarUrl: data.profile.avatar_url,
    bio: data.profile.bio,
  });
}
