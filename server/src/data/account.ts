export const customer = {
  id: "c1",
  name: "Haniya Ilhan",
  email: "haniya.ilhan@email.com",
};

export const familyProfiles = [
  { id: "fp1", name: "Haniya", department: "women", heightCm: 165, weightKg: 58 },
  { id: "fp2", name: "Amna", department: "kids", ageYears: 5, heightCm: 108, weightKg: 18 },
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
        sku: "HV-WD-001-BL-M",
        name: "Linen Meadow Dress",
        color: "Blush",
        size: "M",
        price: 8900,
        qty: 1,
        image: "",
      },
      {
        sku: "HV-WC-003-CR-M",
        name: "Knit Cardigan",
        color: "Cream",
        size: "M",
        price: 6400,
        qty: 1,
        image: "",
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
        sku: "HV-WD-002-BL-L",
        name: "Floral Pink Dress",
        color: "Blush",
        size: "L",
        price: 12300,
        qty: 1,
        image: "",
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
        sku: "HV-WD-001-BL-M",
        name: "Linen Meadow Dress",
        color: "Blush",
        size: "M",
        price: 8900,
        qty: 1,
        image: "",
      },
    ],
    subtotal: 8900,
    shipping: 0,
    total: 8900,
  },
];
