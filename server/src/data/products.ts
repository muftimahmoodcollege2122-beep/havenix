export interface ProductVariant {
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  inventory: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: "girls" | "boys" | "baby" | "accessories";
  subCategory: string;
  price: number;
  compareAtPrice?: number;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  material: string;
  care: string;
  ageRange: string;
  variants: ProductVariant[];
}

const sizesFor = (ageRange: string) =>
  ["2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y"].filter((_, i) => i < 6);

const colorSwatch: Record<string, string> = {
  Blush: "#EFD3CE",
  Cream: "#F3ECDD",
  Rose: "#D98E8A",
  Sage: "#B7BFA8",
  Camel: "#C69C6D",
  Chocolate: "#5A4433",
};

function makeVariants(colors: string[], sizes: string[], skuPrefix: string): ProductVariant[] {
  const variants: ProductVariant[] = [];
  colors.forEach((color, ci) => {
    sizes.forEach((size, si) => {
      variants.push({
        sku: `${skuPrefix}-${color.slice(0, 2).toUpperCase()}-${size}`,
        color,
        colorHex: colorSwatch[color] || "#D8C6AE",
        size,
        inventory: (ci + si) % 5 === 0 ? 0 : 12 - ((ci + si) % 8),
      });
    });
  });
  return variants;
}

export const products: Product[] = [
  {
    id: "p1",
    slug: "linen-meadow-dress",
    name: "Linen Meadow Dress",
    category: "girls",
    subCategory: "Dresses",
    price: 8900,
    isNew: true,
    rating: 5,
    reviewCount: 24,
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800",
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800",
    ],
    description:
      "A sleeveless dress crafted from premium linen fabric. Soft, breathable, and perfect for every season.",
    material: "100% Premium Linen",
    care: "Hand wash cold, lay flat to dry",
    ageRange: "2-8 years",
    variants: makeVariants(["Blush", "Cream", "Rose", "Chocolate"], sizesFor("2-8"), "HV-GD-001"),
  },
  {
    id: "p2",
    slug: "floral-embroidered-dress",
    name: "Floral Embroidered Dress",
    category: "girls",
    subCategory: "Dresses",
    price: 5600,
    isNew: true,
    rating: 4.8,
    reviewCount: 18,
    images: [
      "https://images.unsplash.com/photo-1519457851430-31b60c9e5484?w=800",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800",
    ],
    description: "Delicate floral embroidery on a soft cotton base, finished with a peter pan collar.",
    material: "100% Organic Cotton",
    care: "Machine wash cold, gentle cycle",
    ageRange: "2-8 years",
    variants: makeVariants(["Blush", "Cream"], sizesFor("2-8"), "HV-GD-002"),
  },
  {
    id: "p3",
    slug: "knitted-cardigan",
    name: "Knitted Cardigan",
    category: "girls",
    subCategory: "Knitwear",
    price: 4200,
    isNew: true,
    rating: 4.9,
    reviewCount: 12,
    images: [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
    ],
    description: "A cosy cable-knit cardigan with a hand-tied bow, perfect for layering.",
    material: "Cotton-wool blend",
    care: "Hand wash cold",
    ageRange: "2-8 years",
    variants: makeVariants(["Rose", "Cream"], sizesFor("2-8"), "HV-GC-003"),
  },
  {
    id: "p4",
    slug: "collar-romper",
    name: "Collar Romper",
    category: "baby",
    subCategory: "Rompers",
    price: 4400,
    isNew: true,
    rating: 4.7,
    reviewCount: 9,
    images: [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800",
    ],
    description: "A classic collared romper in soft brushed cotton, with easy snap closures.",
    material: "Brushed Cotton",
    care: "Machine wash warm",
    ageRange: "0-2 years",
    variants: makeVariants(["Camel", "Cream"], ["3M", "6M", "12M", "18M", "2Y"], "HV-BR-004"),
  },
  {
    id: "p5",
    slug: "cozy-knit-set",
    name: "Cozy Knit Set",
    category: "boys",
    subCategory: "Sets",
    price: 5400,
    isNew: true,
    rating: 4.9,
    reviewCount: 15,
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800",
      "https://images.unsplash.com/photo-1519457851430-31b60c9e5484?w=800",
    ],
    description: "A matching knit top and trouser set, ribbed at the cuffs for a snug fit.",
    material: "Merino wool blend",
    care: "Hand wash cold",
    ageRange: "2-8 years",
    variants: makeVariants(["Camel", "Sage"], sizesFor("2-8"), "HV-BS-005"),
  },
  {
    id: "p6",
    slug: "linen-shirt-set",
    name: "Linen Shirt Set",
    category: "boys",
    subCategory: "Sets",
    price: 4800,
    isNew: true,
    rating: 4.6,
    reviewCount: 11,
    images: [
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
    ],
    description: "A relaxed linen shirt paired with matching shorts, ideal for warm days.",
    material: "100% Linen",
    care: "Machine wash cold",
    ageRange: "2-8 years",
    variants: makeVariants(["Camel", "Cream"], sizesFor("2-8"), "HV-BS-006"),
  },
];

export function findProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
