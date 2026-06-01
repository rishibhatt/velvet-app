import Link from "next/link";
import { Button } from "@/components/atoms/Button";

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display mb-2 text-4xl text-primary">Velvet Setup</h1>
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
              <code className="rounded bg-white px-2 py-0.5">
                supabase/migrations/001_initial_schema.sql
              </code>
            </li>
            <li>
              <code className="rounded bg-white px-2 py-0.5">
                supabase/migrations/002_rls_policies.sql
              </code>
            </li>
            <li>
              <strong className="text-error">
                supabase/migrations/003_fix_rls_and_storage.sql
              </strong>{" "}
              (required — fixes &quot;Failed to fetch&quot; / boards not loading)
            </li>
            <li>
              <code className="rounded bg-white px-2 py-0.5">
                supabase/migrations/004_slug_and_item_policies.sql
              </code>{" "}
              (public share URLs + item delete)
            </li>
          </ul>
        </li>

        <li className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="font-display mb-2 text-xl text-on-surface">
            2b. Supabase Dashboard settings
          </h2>
          <ul className="list-inside list-disc space-y-2 text-on-surface-variant">
            <li>
              Authentication → Providers → Email: enable email sign-in. For dev,
              disable &quot;Confirm email&quot; so signup works instantly.
            </li>
            <li>
              Authentication → URL Configuration: Site URL{" "}
              <code className="rounded bg-white px-2 py-0.5">http://localhost:3000</code>
              , Redirect URLs:{" "}
              <code className="rounded bg-white px-2 py-0.5">http://localhost:3000/auth/callback</code>
            </li>
            <li>Storage: bucket <code className="rounded bg-white px-2 py-0.5">velvet-uploads</code> is created by migration 003.</li>
          </ul>
        </li>

        <li className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="font-display mb-2 text-xl text-on-surface">
            3. Add environment variables
          </h2>
          <p className="mb-3 text-on-surface-variant">
            Create <code className="rounded bg-white px-2 py-0.5">.env.local</code>{" "}
            in the <code className="rounded bg-white px-2 py-0.5">velvet-app</code>{" "}
            folder:
          </p>
          <pre className="overflow-x-auto rounded-xl bg-inverse-surface p-4 text-left text-sm text-text-inverse">
{`NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
          </pre>
        </li>

        <li className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="font-display mb-2 text-xl text-on-surface">
            4. Enable Google OAuth (optional)
          </h2>
          <p className="text-on-surface-variant">
            In Supabase → Authentication → Providers, enable Google. Add redirect
            URL:{" "}
            <code className="rounded bg-white px-2 py-0.5">
              http://localhost:3000/auth/callback
            </code>
          </p>
        </li>

        <li className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="font-display mb-2 text-xl text-on-surface">
            5. Restart the dev server
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
