import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/atoms/Button";
import { VelvetLogo } from "@/components/atoms/VelvetLogo";
import { SetupUrlBlock } from "@/components/molecules/SetupUrlBlock";
import { getAppBaseUrlFromHeaders } from "@/lib/app-url";

export default async function SetupPage() {
  const headerStore = await headers();
  const appBaseUrl = getAppBaseUrlFromHeaders(headerStore);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-6">
        <VelvetLogo variant="auth" href={null} />
      </div>
      <h1 className="font-display mb-2 text-4xl text-primary">Setup</h1>
      <p className="mb-10 text-on-surface-variant">
        Follow these steps to connect your Supabase backend and use live data.
      </p>

      <ol className="space-y-8 text-left">
        <li className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="font-display mb-2 text-xl text-on-surface">
            1. Create a Supabase project
          </h2>
          <p className="text-on-surface-variant">
            Go to{" "}
            <a
              href="https://supabase.com/dashboard"
              className="font-medium text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              supabase.com/dashboard
            </a>{" "}
            and create a new project.
          </p>
        </li>

        <li className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="font-display mb-2 text-xl text-on-surface">
            2. Run database migrations
          </h2>
          <p className="mb-3 text-on-surface-variant">
            In the SQL Editor, run these files in order:
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-on-surface">
            <li>
              <code className="rounded bg-bg-elevated px-2 py-0.5">
                supabase/migrations/001_initial_schema.sql
              </code>
            </li>
            <li>
              <code className="rounded bg-bg-elevated px-2 py-0.5">
                supabase/migrations/002_rls_policies.sql
              </code>
            </li>
            <li>
              <code className="rounded bg-bg-elevated px-2 py-0.5">
                supabase/migrations/002_profile_banner.sql
              </code>{" "}
              (profile banner column)
            </li>
            <li>
              <code className="rounded bg-bg-elevated px-2 py-0.5">
                supabase/migrations/003_fix_rls_and_storage.sql
              </code>{" "}
              (required — fixes boards / storage)
            </li>
            <li>
              <code className="rounded bg-bg-elevated px-2 py-0.5">
                supabase/migrations/004_slug_and_item_policies.sql
              </code>{" "}
              (public share URLs)
            </li>
            <li>
              <code className="rounded bg-white px-2 py-0.5">
                supabase/migrations/005_board_likes.sql
              </code>{" "}
              (likes + trending sort)
            </li>
            <li>
              <code className="rounded bg-white px-2 py-0.5">
                supabase/migrations/012_notifications_and_invitations.sql
              </code>{" "}
              (notifications + collaboration approvals)
            </li>
            <li>
              <code className="rounded bg-white px-2 py-0.5">
                supabase/migrations/013_owner_scoped_collection_slugs.sql
              </code>{" "}
              (owner-scoped public URLs)
            </li>
            <li>
              <code className="rounded bg-primary/10 px-2 py-0.5 text-primary">
                supabase/migrations/014_security_hardening.sql
              </code>{" "}
              (production security + performance — required)
            </li>
          </ul>
        </li>

        <li className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="font-display mb-3 text-xl text-on-surface">
            2b. Supabase Dashboard — auth &amp; security
          </h2>
          <ul className="mb-4 list-inside list-disc space-y-2 text-sm text-on-surface-variant">
            <li>
              Authentication → Providers → Email: enable email sign-in. For production,
              enable &quot;Confirm email&quot; so users must verify before access.
            </li>
            <li>
              Authentication → Providers → Google: add OAuth Client ID and Secret from
              Google Cloud Console. Add redirect URI from Supabase Auth settings.
            </li>
            <li>
              Authentication → URL Configuration: set Site URL to your{" "}
              <code className="rounded bg-bg-elevated px-2 py-0.5">NEXT_PUBLIC_APP_URL</code>.
              Add redirect URLs for <code className="rounded bg-bg-elevated px-2 py-0.5">/auth/callback</code>,{" "}
              <code className="rounded bg-bg-elevated px-2 py-0.5">/reset-password</code>, and{" "}
              <code className="rounded bg-bg-elevated px-2 py-0.5">/verify-email</code>.
            </li>
            <li>
              Enable leaked password protection (HaveIBeenPwned) under Auth settings.
            </li>
            <li>
              Configure custom SMTP (Resend/SendGrid) for branded verification and reset emails.
            </li>
            <li>
              Storage: bucket{" "}
              <code className="rounded bg-bg-elevated px-2 py-0.5">velvet-uploads</code>{" "}
              is created by migration 003.
            </li>
            <li>
              Add <code className="rounded bg-bg-elevated px-2 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> to
              server env for account deletion (never expose to the browser).
            </li>
          </ul>
          <SetupUrlBlock initialBaseUrl={appBaseUrl} />
        </li>

        <li className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="font-display mb-2 text-xl text-on-surface">
            3. Environment variables
          </h2>
          <p className="mb-3 text-on-surface-variant">
            Copy{" "}
            <code className="rounded bg-bg-elevated px-2 py-0.5">.env.example</code> to{" "}
            <code className="rounded bg-bg-elevated px-2 py-0.5">.env.local</code> in the{" "}
            <code className="rounded bg-bg-elevated px-2 py-0.5">velvet-app</code> folder,
            then fill in your Supabase keys:
          </p>
          <pre className="overflow-x-auto rounded-xl bg-inverse-surface p-4 text-left text-sm text-text-inverse">
{`copy .env.example .env.local   # Windows
# cp .env.example .env.local    # macOS / Linux`}
          </pre>
          <p className="mt-3 text-sm text-on-surface-variant">
            See <code className="rounded bg-bg-elevated px-1.5 py-0.5 text-xs">.env.example</code>{" "}
            for every variable (required vs optional) and short descriptions.
          </p>
          <p className="mt-3 text-sm text-on-surface-variant">
            For ngrok, either open the app via your ngrok link (URLs below will match), or set{" "}
            <code className="rounded bg-bg-elevated px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_APP_URL=https://YOUR-SUBDOMAIN.ngrok-free.app
            </code>{" "}
            and restart <code className="rounded bg-bg-elevated px-1.5 py-0.5 text-xs">npm run dev</code>.
          </p>
        </li>

        <li className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="font-display mb-2 text-xl text-on-surface">
            4. Enable Google OAuth (optional)
          </h2>
          <p className="text-on-surface-variant">
            In Supabase → Authentication → Providers, enable Google. Use the same{" "}
            <strong>Redirect URL</strong> shown in step 2b (your app&apos;s{" "}
            <code className="rounded bg-bg-elevated px-1.5 py-0.5 text-xs">/auth/callback</code>
            ). Google Cloud should use Supabase&apos;s callback URL from the provider settings,
            not your ngrok URL directly.
          </p>
        </li>

        <li className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="font-display mb-2 text-xl text-on-surface">
            5. ngrok + Next.js 16
          </h2>
          <p className="text-sm text-on-surface-variant">
            This project allows ngrok origins in{" "}
            <code className="rounded bg-bg-elevated px-1.5 py-0.5 text-xs">next.config.ts</code>{" "}
            (<code className="rounded bg-bg-elevated px-1.5 py-0.5 text-xs">allowedDevOrigins</code>
            ). After changing config or env, restart the dev server. Always open the app via your
            ngrok HTTPS URL — not localhost — when testing auth through the tunnel.
          </p>
        </li>

        <li className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="font-display mb-2 text-xl text-on-surface">
            6. Restart the dev server
          </h2>
          <pre className="rounded-xl bg-inverse-surface p-4 text-sm text-text-inverse">
            npm run dev
          </pre>
        </li>
      </ol>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/signup">
          <Button size="lg">Go to Sign Up</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" size="lg">
            Sign In
          </Button>
        </Link>
      </div>
    </main>
  );
}
