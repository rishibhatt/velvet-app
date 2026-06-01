import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display mb-4 text-4xl text-on-surface">
        This board has drifted away...
      </h1>
      <p className="mb-8 max-w-md text-on-surface-variant">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link href={ROUTES.home}>
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
