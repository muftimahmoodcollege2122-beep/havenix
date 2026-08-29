export const customer = {
  id: "c1",
  name: "Haniya Ilhan",
  email: "haniya.ilhan@email.com",
};

export const childProfiles = [
  { id: "ch1", name: "Amna", ageYears: 5, heightCm: 108, weightKg: 18 },
  { id: "ch2", name: "Hamza", ageYears: 3, heightCm: 96, weightKg: 15 },
];

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

export const orders: Order[] = [
  {
    id: "HV-10482",
    placedOn: "2026-05-02",
    status: "Delivered",
    items: [
      {
        sku: "HV-GD-001-BL-4Y",
        name: "Linen Meadow Dress",
        color: "Blush",
        size: "4Y",
        price: 8900,
        qty: 1,
        image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=200",
      },
      {
        sku: "HV-GC-003-CR-4Y",
        name: "Knit Cardigan",
        color: "Cream",
        size: "4Y",
        price: 6400,
        qty: 1,
        image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=200",
      },
    ],
    subtotal: 15300,
    shipping: 0,
    total: 15300,
    trackingNumber: "1234567890",
    estimatedDelivery: "2026-05-05",
  },
  {
    id: "HV-10331",
    placedOn: "2026-04-21",
    status: "Delivered",
    items: [
      {
        sku: "HV-GD-002-BL-5Y",
        name: "Floral Pink Dress",
        color: "Blush",
        size: "5Y",
        price: 12300,
        qty: 1,
        image: "https://images.unsplash.com/photo-1519457851430-31b60c9e5484?w=200",
      },
    ],
    subtotal: 12300,
    shipping: 0,
    total: 12300,
  },
  {
    id: "HV-10211",
    placedOn: "2026-04-10",
    status: "Processing",
    items: [
      {
        sku: "HV-GD-001-BL-4Y",
        name: "Linen Meadow Dress",
        color: "Blush",
        size: "4Y",
        price: 8900,
        qty: 1,
        image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=200",
      },
    ],
    subtotal: 8900,
    shipping: 0,
    total: 8900,
  },
];
