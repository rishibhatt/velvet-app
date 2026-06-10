"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/atoms/Button";
import { SegmentButton } from "@/components/atoms/SegmentButton";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/atoms/PasswordStrengthIndicator";
import { authService } from "@/services/auth/auth.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/schemas/auth.schema";
import { confirmAction } from "@/lib/confirm";

const tabs = ["Account", "Security", "Privacy"] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Account");
  const { profile, user, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isEmailUser =
    user?.app_metadata?.provider === "email" || !user?.app_metadata?.provider;

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watchPassword("password", "");

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

  const onChangePassword = async (data: ChangePasswordInput) => {
    if (!user?.email) return;
    try {
      await authService.changePassword(
        user.email,
        data.currentPassword,
        data.password,
      );
      resetPasswordForm();
      velvetToast.success("Password updated", "Your new password is now active.");
    } catch (err) {
      velvetToast.error("Couldn't update password", getErrorMessage(err, "auth"));
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await confirmAction({
      title: "Delete your account?",
      description:
        "This permanently removes your profile, collections, and saved items. This cannot be undone.",
      confirmLabel: "Delete account",
      variant: "destructive",
    });
    if (!confirmed) return;

    if (deleteConfirm !== "DELETE") {
      velvetToast.error("Confirmation required", 'Type "DELETE" to confirm.');
      return;
    }

    setDeleting(true);
    try {
      await authService.deleteAccount();
      velvetToast.success("Account deleted");
      await signOut();
      window.location.assign(ROUTES.login);
    } catch (err) {
      velvetToast.error("Deletion failed", getErrorMessage(err, "auth"));
    } finally {
      setDeleting(false);
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

      {activeTab === "Security" && (
        <div className="space-y-6 rounded-3xl border border-outline-variant/25 bg-bg-elevated p-6 shadow-sm md:p-8">
          {isEmailUser ? (
            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-5">
              <div>
                <h2 className="font-display text-lg text-on-surface">Change password</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Update your password. You&apos;ll need your current password to confirm.
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">
                  Current password
                </label>
                <PasswordInput {...registerPassword("currentPassword")} />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-error">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">
                  New password
                </label>
                <PasswordInput {...registerPassword("password")} />
                <PasswordStrengthIndicator password={newPassword} className="mt-2" />
                {passwordErrors.password && (
                  <p className="mt-1 text-sm text-error">
                    {passwordErrors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">
                  Confirm new password
                </label>
                <PasswordInput {...registerPassword("confirmPassword")} />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-error">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" loading={passwordSubmitting}>
                Update password
              </Button>
            </form>
          ) : (
            <p className="text-on-surface-variant">
              You signed in with Google. Password changes are managed through your Google account.
            </p>
          )}
        </div>
      )}

      {activeTab === "Privacy" && (
        <div className="space-y-6 rounded-3xl border border-outline-variant/25 bg-white p-6 md:p-8">
          <div>
            <h2 className="font-display text-lg text-on-surface">Delete account</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              Type DELETE to confirm
            </label>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-on-surface focus:border-primary focus:outline-none"
              placeholder="DELETE"
            />
          </div>
          <Button
            variant="destructive"
            loading={deleting}
            onClick={() => void handleDeleteAccount()}
          >
            Delete Account
          </Button>
        </div>
      )}
    </main>
  );
}
