"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/atoms/Button";
import { Avatar } from "@/components/atoms/Avatar";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { authService } from "@/services/auth/auth.service";
import { uploadImage } from "@/services/storage/storage.service";
import type { Profile } from "@/types/board.types";

interface ProfileEditorProps {
  profile: Profile;
  onCancel: () => void;
  onSaved: () => void;
}

export function ProfileEditor({ profile, onCancel, onSaved }: ProfileEditorProps) {
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleImageUpload = async (
    file: File,
    folder: "avatars" | "banners",
    onUrl: (url: string) => void,
    setUploading: (v: boolean) => void,
  ) => {
    if (!file.type.startsWith("image/")) {
      velvetToast.error("Invalid file", "Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      velvetToast.error("File too large", "Image must be under 5MB.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onUrl(url);
      if (folder === "avatars") {
        await authService.updateProfile({ avatar_url: url });
        await queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
        await queryClient.refetchQueries({ queryKey: ["profile", profile.id] });
      }
      velvetToast.success(folder === "avatars" ? "Photo updated" : "Banner updated");
    } catch (err) {
      velvetToast.error("Upload failed", getErrorMessage(err, "upload"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        website: website.trim() || null,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      });
      queryClient.setQueryData(["profile", profile.id], updated);
      await queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
      velvetToast.success("Profile saved!");
      onSaved();
    } catch (err) {
      velvetToast.error("Update failed", getErrorMessage(err, "profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative h-40 overflow-hidden rounded-3xl bg-surface-container md:h-52">
        {bannerUrl ? (
          <VelvetImage
            src={bannerUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-accent-blush via-accent-coral to-accent-lavender" />
        )}
        <button
          type="button"
          onClick={() => bannerInputRef.current?.click()}
          disabled={uploadingBanner}
          className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-bg-elevated/95 px-4 py-2 text-sm font-medium text-on-surface shadow-sm transition hover:bg-bg-elevated"
        >
          {uploadingBanner ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          Change banner
        </button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void handleImageUpload(file, "banners", setBannerUrl, setUploadingBanner);
            }
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <div className="relative">
          <Avatar
            src={avatarUrl}
            name={fullName || profile.username}
            size="lg"
            className="!h-24 !w-24 ring-4 ring-surface shadow-md md:!h-28 md:!w-28"
          />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute right-0 bottom-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-md"
            aria-label="Change profile photo"
          >
            {uploadingAvatar ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void handleImageUpload(file, "avatars", setAvatarUrl, setUploadingAvatar);
              }
              e.target.value = "";
            }}
          />
        </div>
        <p className="text-center text-sm text-on-surface-variant sm:text-left">
          JPG, PNG or WebP · max 5MB
        </p>
      </div>

      <div className="space-y-5 rounded-3xl border border-outline-variant/25 bg-bg-elevated p-6 shadow-sm md:p-8">
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">
            Display name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-on-surface focus:border-primary focus:outline-none"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={280}
            className="w-full resize-none rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-on-surface focus:border-primary focus:outline-none"
            placeholder="Tell others about your style and collections..."
          />
          <p className="mt-1 text-right text-xs text-on-surface-variant">{bio.length}/280</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Website</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-on-surface focus:border-primary focus:outline-none"
            placeholder="https://yoursite.com"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} loading={saving}>
            Save profile
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
