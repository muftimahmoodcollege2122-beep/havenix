import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-32 text-center">
      <div className="font-serif text-[60px] text-ink mb-2">404</div>
      <p className="text-muted mb-8">We couldn&apos;t find the page you were looking for.</p>
      <Link href="/" className="bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
