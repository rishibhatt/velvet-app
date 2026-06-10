import type { Metadata } from "next";
import { AdaptiveNavbar } from "@/components/organisms/AdaptiveNavbar";
import { BRAND } from "@/constants/brand";
import { generateCanonicalUrl } from "@/lib/seo/canonical";
import { BrandsPageStats } from "@/features/brands/components/BrandsPageStats";

export const metadata: Metadata = {
  title: `Reach India's most inspired audience | ${BRAND.name}`,
  description:
    "Partner with Velvet to place your brand in front of people planning weddings, home renovations, travel, and fashion — India's most intentional shoppers.",
  alternates: { canonical: generateCanonicalUrl("/brands") },
  openGraph: {
    title: "Your brand, curated. | Velvet",
    description: "Brand collections, promoted items, and category sponsorship on Velvet.",
    images: [{ url: BRAND.logo.og, width: 1200, height: 630 }],
  },
};

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-background pb-16">
      <AdaptiveNavbar />
      <div className="page-container py-12">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl text-on-surface sm:text-5xl">Your brand, curated.</h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            Reach people actively planning weddings, travel, home, and fashion — when inspiration
            turns into intent.
          </p>
        </header>

        <BrandsPageStats />

        <section className="mx-auto mt-12 max-w-2xl space-y-6">
          <div className="rounded-2xl border border-outline-variant/20 bg-bg-elevated p-6">
            <h2 className="font-display text-xl text-on-surface">Brand Collections</h2>
            <p className="mt-2 text-on-surface-variant">
              Curated boards created by your team, featured in Explore and mood feeds.
            </p>
          </div>
          <div className="rounded-2xl border border-outline-variant/20 bg-bg-elevated p-6">
            <h2 className="font-display text-xl text-on-surface">Promoted Items</h2>
            <p className="mt-2 text-on-surface-variant">
              Your products in context — native cards inside inspiration feeds.
            </p>
          </div>
          <div className="rounded-2xl border border-outline-variant/20 bg-bg-elevated p-6">
            <h2 className="font-display text-xl text-on-surface">Category Sponsorship</h2>
            <p className="mt-2 text-on-surface-variant">
              Own a mood category for a month and connect with high-intent audiences.
            </p>
          </div>
        </section>

        <div className="mx-auto mt-12 max-w-md text-center">
          <a
            href="mailto:hello@velvet.app?subject=Velvet%20brand%20partnership"
            className="inline-flex rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary shadow-md"
          >
            Talk to us
          </a>
        </div>
      </div>
    </main>
  );
}
