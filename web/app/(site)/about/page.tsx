import type { Metadata } from "next";
import { Leaf, Scissors, Heart, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import ProductImage from "@/components/ProductImage";
import Newsletter from "@/components/Newsletter";

export const metadata: Metadata = {
  title: "Our Story",
  description: "The story behind Havenix — timeless apparel for women, men, and kids, made to last.",
};

const VALUES = [
  {
    icon: Scissors,
    title: "Considered Design",
    body: "Every piece starts with a question: will this still feel right to wear in five years? If the answer isn't yes, we don't make it.",
  },
  {
    icon: Leaf,
    title: "Honest Materials",
    body: "We work with fabrics that age well — natural fibers, real weight, the kind of quality you can feel before you even read the label.",
  },
  {
    icon: Users,
    title: "For The Whole Family",
    body: "Women, men, and kids shouldn't mean three different brands with three different standards. Havenix holds the same bar across all of them.",
  },
  {
    icon: Heart,
    title: "Made To Be Worn",
    body: "Not made for a season, not made for a photo. Made for the version of your life where you actually reach for it, again and again.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-10 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <Reveal>
          <div className="text-[12px] tracking-widest uppercase text-clay mb-4">Our Story</div>
          <h1 className="font-serif text-[36px] md:text-[48px] leading-[1.1] text-ink mb-6">
            Clothes built for real life, not just the rack.
          </h1>
          <p className="text-muted text-[15px] leading-relaxed max-w-md">
            Havenix started with a simple frustration: it was hard to find apparel that felt considered —
            quality fabric, a fit that lasted, a brand that treated women&apos;s, men&apos;s, and kids&apos;
            clothing with the same care. So we built one.
          </p>
        </Reveal>
        <Reveal delay={150} className="aspect-[4/3] overflow-hidden rounded-sm">
          <ProductImage alt="Havenix studio" className="w-full h-full object-cover" />
        </Reveal>
      </section>

      {/* Values */}
      <section className="bg-paper border-y border-line py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-12">
            <h2 className="font-serif text-[26px] text-ink mb-2">What We Stand For</h2>
            <p className="text-muted text-[14px]">The principles behind every piece we make.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 100} className="text-center">
                <div className="w-14 h-14 rounded-full bg-blush/40 flex items-center justify-center mx-auto mb-4">
                  <v.icon size={22} className="text-espresso" />
                </div>
                <h3 className="text-[15px] text-ink mb-2">{v.title}</h3>
                <p className="text-muted text-[13px] leading-relaxed">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Story detail */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <Reveal className="aspect-[4/3] overflow-hidden rounded-sm md:order-2">
          <ProductImage alt="Havenix craftsmanship" className="w-full h-full object-cover" />
        </Reveal>
        <Reveal className="md:order-1">
          <h2 className="font-serif text-[26px] md:text-[30px] text-ink mb-5 leading-tight">
            Every collection starts with a question, not a trend.
          </h2>
          <p className="text-muted text-[14px] leading-relaxed mb-4">
            We don&apos;t chase seasons for the sake of it. Before a piece goes into production, it has to
            earn its place — in the fabric, the fit, and the way it holds up after the fiftieth wear.
          </p>
          <p className="text-muted text-[14px] leading-relaxed">
            That standard applies whether we&apos;re designing a linen dress, a men&apos;s knit set, or a
            romper built to survive an actual toddler. Same care, every department.
          </p>
        </Reveal>
      </section>

      <Newsletter />
    </div>
  );
}
