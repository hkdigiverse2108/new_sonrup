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
  gallery?: string[];
  related_products?: string[];
  frequently_bought_together?: string[];
  bundle_price?: number;
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
  format?: string;
  shipping_info?: string;
  returns_info?: string;
  accordions?: { title: string; content: string }[];
  trust_badges?: { icon: string; text: string }[];
};

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

