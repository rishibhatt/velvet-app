"use client";

import { useEffect, useState } from "react";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/atoms/Button";
import { SegmentButton } from "@/components/atoms/SegmentButton";
import { authService } from "@/services/auth/auth.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
const tabs = ["Account", "Privacy"] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Account");
  const { profile, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await authService.updateProfile({ full_name: fullName, bio });
      velvetToast.success("Profile updated!");
    } catch (err) {
      velvetToast.error("Update failed", getErrorMessage(err, "profile"));
    }
  };

  return (
    <main className="page-container max-w-2xl py-stack-lg md:py-12">
      <h1 className="font-display mb-8 text-3xl text-on-surface">Settings</h1>

      <SegmentButton
        options={tabs.map((t) => ({ value: t, label: t }))}
        value={activeTab}
        onChange={(v) => setActiveTab(v as (typeof tabs)[number])}
        className="mb-8"
      />

      {activeTab === "Account" && (
        <div className="space-y-6 rounded-3xl border border-outline-variant/25 bg-bg-elevated p-6 shadow-sm md:p-8">
          <p className="text-sm text-on-surface-variant">
            For profile photo, banner, and bio, use{" "}
            <a href={ROUTES.profile} className="font-medium text-primary hover:underline">
              Edit profile
            </a>{" "}
            on your profile page.
          </p>
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="secondary" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {activeTab === "Privacy" && (
        <div className="space-y-4 rounded-3xl border border-outline-variant/25 bg-white p-6 md:p-8">
          <p className="text-on-surface-variant">
            Manage your privacy settings and data.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </div>
      )}
    </main>
  );
}
