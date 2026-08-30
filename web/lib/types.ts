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

export interface CartLine {
  sku: string;
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  qty: number;
}

export interface CartSummary {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  freeShippingRemaining: number;
}

export interface OrderItem {
  sku: string;
  name: string;
  color: string;
  size: string;
  price: number;
  qty: number;
  image: string;
}

export interface Order {
  id: string;
  placedOn: string;
  status: "Processing" | "Packed" | "Shipped" | "Delivered";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface FamilyProfile {
  id: string;
  name: string;
  ageYears: number;
  heightCm: number;
  weightKg: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  marketingOptIn: boolean;
}
