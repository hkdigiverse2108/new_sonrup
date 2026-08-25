export const IMG = {
  kids: "/kids.jpg",
  multi: "/multi-vitamin.jpg",
  shilajit: "/shilajit.jpg",
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  flavour: string;
  flavourToken: string;
  categories: string[];
  benefits: string[];
  goals: string[];
  badges: string[];
  ingredients: { name: string; note: string }[];
  nutrition: { label: string; value: string }[];
  howToUse: string;
  storage: string;
  count: string;
};

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const FREE_SHIPPING_THRESHOLD = 499;

