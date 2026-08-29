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
  category: "men" | "women" | "kids" | "accessories";
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
  sizeRange: string;
  variants: ProductVariant[];
}

const adultSizes = ["XS", "S", "M", "L", "XL"];
const kidsSizes = ["2Y", "3Y", "4Y", "5Y", "6Y", "7Y"];

const colorSwatch: Record<string, string> = {
  Blush: "#EFD3CE",
  Cream: "#F3ECDD",
  Rose: "#D98E8A",
  Sage: "#B7BFA8",
  Camel: "#C69C6D",
  Chocolate: "#5A4433",
  Black: "#1C1B19",
  Navy: "#2B3A55",
  White: "#FAFAF8",
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
    category: "women",
    subCategory: "Dresses",
    price: 8900,
    isNew: true,
    rating: 5,
    reviewCount: 24,
    images: [],
    description:
      "A sleeveless dress crafted from premium linen fabric. Soft, breathable, and perfect for every season.",
    material: "100% Premium Linen",
    care: "Hand wash cold, lay flat to dry",
    sizeRange: "XS-XL",
    variants: makeVariants(["Blush", "Cream", "Rose", "Chocolate"], adultSizes, "HV-WD-001"),
  },
  {
    id: "p2",
    slug: "floral-embroidered-dress",
    name: "Floral Embroidered Dress",
    category: "women",
    subCategory: "Dresses",
    price: 5600,
    isNew: true,
    rating: 4.8,
    reviewCount: 18,
    images: [],
    description: "Delicate floral embroidery on a soft cotton base, finished with a tailored collar.",
    material: "100% Organic Cotton",
    care: "Machine wash cold, gentle cycle",
    sizeRange: "XS-XL",
    variants: makeVariants(["Blush", "Cream"], adultSizes, "HV-WD-002"),
  },
  {
    id: "p3",
    slug: "knitted-cardigan",
    name: "Knitted Cardigan",
    category: "women",
    subCategory: "Knitwear",
    price: 4200,
    isNew: true,
    rating: 4.9,
    reviewCount: 12,
    images: [],
    description: "A cosy cable-knit cardigan, perfect for layering through every season.",
    material: "Cotton-wool blend",
    care: "Hand wash cold",
    sizeRange: "XS-XL",
    variants: makeVariants(["Rose", "Cream"], adultSizes, "HV-WC-003"),
  },
  {
    id: "p4",
    slug: "kids-collar-romper",
    name: "Kids Collar Romper",
    category: "kids",
    subCategory: "Rompers",
    price: 4400,
    isNew: true,
    rating: 4.7,
    reviewCount: 9,
    images: [],
    description: "A classic collared romper in soft brushed cotton, with easy snap closures.",
    material: "Brushed Cotton",
    care: "Machine wash warm",
    sizeRange: "2Y-7Y",
    variants: makeVariants(["Camel", "Cream"], kidsSizes, "HV-KR-004"),
  },
  {
    id: "p5",
    slug: "mens-knit-set",
    name: "Men's Knit Set",
    category: "men",
    subCategory: "Sets",
    price: 5400,
    isNew: true,
    rating: 4.9,
    reviewCount: 15,
    images: [],
    description: "A matching knit crewneck and trouser set, ribbed at the cuffs for a snug fit.",
    material: "Merino wool blend",
    care: "Hand wash cold",
    sizeRange: "XS-XL",
    variants: makeVariants(["Camel", "Sage", "Navy"], adultSizes, "HV-MS-005"),
  },
  {
    id: "p6",
    slug: "mens-linen-shirt-set",
    name: "Men's Linen Shirt Set",
    category: "men",
    subCategory: "Sets",
    price: 4800,
    isNew: true,
    rating: 4.6,
    reviewCount: 11,
    images: [],
    description: "A relaxed linen shirt paired with matching trousers, ideal for warm days.",
    material: "100% Linen",
    care: "Machine wash cold",
    sizeRange: "XS-XL",
    variants: makeVariants(["Camel", "Cream", "White"], adultSizes, "HV-MS-006"),
  },
  {
    id: "p7",
    slug: "leather-belt",
    name: "Leather Belt",
    category: "accessories",
    subCategory: "Belts",
    price: 3200,
    isNew: true,
    rating: 4.8,
    reviewCount: 7,
    images: [],
    description: "A full-grain leather belt with a brushed metal buckle, finished by hand.",
    material: "Full-Grain Leather",
    care: "Wipe clean with a damp cloth",
    sizeRange: "S-XL",
    variants: makeVariants(["Chocolate", "Black"], ["S", "M", "L", "XL"], "HV-AB-007"),
  },
];

export function findProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
