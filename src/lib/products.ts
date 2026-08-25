import kids from "@/assets/kids.jpg";
import multi from "@/assets/multi-vitamin.jpg";
import shilajit from "@/assets/shilajit.jpg";

export const IMG = {
  kids,
  multi,
  shilajit,
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

export const products: Product[] = [
  {
    slug: "biotin-multivitamin-gummies",
    name: "Biotin + Multivitamin Gummies",
    tagline: "Hair, skin, nails & daily nutrition",
    description:
      "A full-spectrum daily multivitamin with biotin, packed into a juicy orange citrus gummy. One-a-day nutrition without the chalky tablet.",
    image: IMG.multi,
    price: 649,
    mrp: 899,
    rating: 4.8,
    reviews: 1284,
    flavour: "Orange (Citrus)",
    flavourToken: "citrus",
    categories: ["Multivitamin", "Beauty", "Daily Wellness"],
    benefits: ["Supports Hair", "Supports Skin", "Supports Nails", "Immune Support", "Daily Nutrition"],
    goals: ["Daily Wellness", "Beauty", "Multivitamin", "Immunity"],
    badges: ["Best Seller"],
    ingredients: [
      { name: "Biotin", note: "5000 mcg for hair & nail strength" },
      { name: "Vitamin C", note: "Antioxidant support for glowing skin" },
      { name: "Vitamin E", note: "Helps protect cells from oxidative stress" },
      { name: "Zinc", note: "Everyday immune and skin support" },
      { name: "Orange Extract", note: "Real citrus for a clean, bright taste" },
    ],
    nutrition: [
      { label: "Serving size", value: "2 gummies (7 g)" },
      { label: "Energy", value: "26 kcal" },
      { label: "Total sugars", value: "4.2 g" },
      { label: "Biotin", value: "5000 mcg" },
      { label: "Vitamin C", value: "40 mg" },
    ],
    howToUse: "Chew 2 gummies daily, preferably after a meal. Do not exceed the recommended dose.",
    storage: "Store in a cool, dry place away from direct sunlight. Keep the lid tightly closed.",
    count: "60 Gummies",
  },
  {
    slug: "himalayan-shilajit-gummies",
    name: "Himalayan Shilajit Gummies",
    tagline: "Natural energy, strength & stamina",
    description:
      "Purified Himalayan shilajit in a tangy imli gummy. Ancient resin, modern format — no bitterness, no mess, no added sugar.",
    image: IMG.shilajit,
    price: 899,
    mrp: 1299,
    rating: 4.9,
    reviews: 942,
    flavour: "Imli (Tamarind)",
    flavourToken: "ink",
    categories: ["Energy", "Daily Wellness"],
    benefits: ["Natural Energy", "Strength", "Stamina", "No Added Sugar"],
    goals: ["Energy", "Daily Wellness"],
    badges: ["Best Seller", "No Added Sugar"],
    ingredients: [
      { name: "Himalayan Shilajit", note: "Purified resin rich in fulvic acid" },
      { name: "Tamarind", note: "Tangy imli flavour, naturally sourced" },
      { name: "Ashwagandha", note: "Traditional adaptogen for stamina" },
      { name: "Vitamin B12", note: "Supports normal energy metabolism" },
    ],
    nutrition: [
      { label: "Serving size", value: "1 gummy (3.5 g)" },
      { label: "Energy", value: "12 kcal" },
      { label: "Added sugar", value: "0 g" },
      { label: "Shilajit extract", value: "500 mg" },
    ],
    howToUse: "Chew 1 gummy daily in the morning. Best paired with a balanced diet.",
    storage: "Store below 25°C in a dry place. Avoid refrigeration.",
    count: "60 Gummies",
  },
  {
    slug: "kids-multivitamin-gummies",
    name: "Kid's Multivitamin Gummies",
    tagline: "Immunity booster for growing kids",
    description:
      "Mixed-fruit gummy bears kids actually ask for. Daily vitamins and minerals to support strong immunity, healthy growth and active days.",
    image: IMG.kids,
    price: 599,
    mrp: 799,
    rating: 4.7,
    reviews: 2130,
    flavour: "Mixed Fruit",
    flavourToken: "berry",
    categories: ["Kids", "Immunity", "Multivitamin"],
    benefits: ["Strong Immunity", "Healthy Growth", "Active Kids"],
    goals: ["Kids", "Immunity", "Multivitamin"],
    badges: ["New Arrival", "Kids Favourite"],
    ingredients: [
      { name: "Vitamin C", note: "Everyday immunity for little ones" },
      { name: "Vitamin D3", note: "Supports bone and muscle growth" },
      { name: "Zinc", note: "Helps the body's natural defences" },
      { name: "Mixed Fruit Blend", note: "Strawberry, orange, grape & pineapple" },
    ],
    nutrition: [
      { label: "Serving size", value: "1 gummy (3.5 g)" },
      { label: "Energy", value: "13 kcal" },
      { label: "Total sugars", value: "2.4 g" },
      { label: "Vitamin C", value: "30 mg" },
    ],
    howToUse: "1 gummy a day for kids above 4 years, under adult supervision.",
    storage: "Keep out of reach of young children. Store in a cool, dry place.",
    count: "60 Gummies",
  },
];

export const bundles: Product[] = [];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const flavours = [
  { name: "Strawberry", token: "berry", note: "Sweet, ripe, unmistakable" },
  { name: "Orange", token: "citrus", note: "Bright citrus lift" },
  { name: "Mixed Berry", token: "grape", note: "Deep, juicy, layered" },
  { name: "Lemon", token: "primary", note: "Zesty and clean" },
  { name: "Watermelon", token: "leaf", note: "Cool and refreshing" },
];

export const goals = [
  "Daily Wellness",
  "Energy",
  "Beauty",
  "Sleep",
  "Immunity",
  "Kids",
  "Multivitamin",
];

export const reviewsList = [
  {
    name: "Ananya Rao",
    city: "Bengaluru",
    rating: 5,
    text: "The biotin gummies actually taste like real orange, not medicine. Three months in and my nails have never been stronger.",
    product: "Biotin + Multivitamin",
  },
  {
    name: "Rohit Menon",
    city: "Mumbai",
    rating: 5,
    text: "I've tried shilajit resin before and hated it. This is tangy, easy and I never skip a day now.",
    product: "Himalayan Shilajit",
  },
  {
    name: "Priya Sharma",
    city: "Delhi",
    rating: 5,
    text: "My 6-year-old asks for his gummy bear every morning. Getting vitamins into him is no longer a fight.",
    product: "Kid's Multivitamin",
  },
  {
    name: "Kabir Sethi",
    city: "Pune",
    rating: 4,
    text: "Packaging is genuinely premium — the tube feels lovely. Delivery took three days to Pune.",
    product: "Himalayan Shilajit",
  },
  {
    name: "Meera Iyer",
    city: "Chennai",
    rating: 5,
    text: "Finally a supplement brand that doesn't look like a pharmacy. Sits nicely on my kitchen counter.",
    product: "Biotin + Multivitamin",
  },
  {
    name: "Aditya Nair",
    city: "Kochi",
    rating: 5,
    text: "Bought the family pack. Everyone has their own tube now. Zero sugar option is a big plus.",
    product: "Himalayan Shilajit",
  },
];

export const faqs = [
  {
    category: "Products",
    q: "What makes Sonrup gummies different?",
    a: "Every batch is built around a single promise: it has to taste good enough that you never skip it. We use real fruit flavours, clean actives at meaningful doses, and packaging designed to live on your counter, not hide in a cabinet.",
  },
  {
    category: "Ingredients",
    q: "What are the gummies made from?",
    a: "A pectin base (no gelatin), real fruit concentrates for flavour, and clinically-relevant actives such as biotin, vitamin C, D3, zinc and purified Himalayan shilajit depending on the product.",
  },
  {
    category: "Ingredients",
    q: "Are they vegetarian and free from added sugar?",
    a: "All our gummies are 100% vegetarian and pectin-based. The Shilajit range is made with no added sugar; the multivitamin ranges use a minimal sugar base for taste.",
  },
  {
    category: "Products",
    q: "How many gummies should I take a day?",
    a: "Follow the dose printed on each tube — usually 1 to 2 gummies daily. Do not exceed the recommended dose.",
  },
  {
    category: "Products",
    q: "Which flavours are available?",
    a: "Orange (Citrus), Imli (Tamarind) and Mixed Fruit today, with Strawberry, Lemon and Watermelon rolling out through the year.",
  },
  {
    category: "Shipping",
    q: "How long does delivery take?",
    a: "Orders are dispatched within 24 working hours. Metro cities receive orders in 2-3 days, rest of India in 4-6 days.",
  },
  {
    category: "Shipping",
    q: "Is shipping free?",
    a: "Shipping is free on every order above ₹499. Below that a flat ₹49 is added at checkout.",
  },
  {
    category: "Returns",
    q: "What is your return policy?",
    a: "Unopened tubes can be returned within 7 days of delivery. Damaged or incorrect items are replaced free of charge — just send us a photo within 48 hours.",
  },
  {
    category: "Returns",
    q: "How do refunds work?",
    a: "Approved refunds are processed to the original payment method within 5-7 working days of the return reaching our warehouse.",
  },
  {
    category: "Payments",
    q: "Which payment methods do you accept?",
    a: "UPI, all major credit and debit cards, net banking, popular wallets and Cash on Delivery on orders under ₹2,000.",
  },
  {
    category: "Orders",
    q: "Can I modify or cancel my order?",
    a: "Yes, as long as it hasn't been dispatched. Write to care@sonrup.in with your order number and we'll sort it out.",
  },
  {
    category: "Orders",
    q: "How do I track my order?",
    a: "You'll get a tracking link by SMS and email at dispatch, and you can always follow it live from your account's Orders page.",
  },
];

export const posts = [
  {
    slug: "why-gummies-beat-tablets",
    title: "Why a gummy you enjoy beats a tablet you forget",
    category: "Wellness",
    date: "12 Aug 2026",
    read: "5 min read",
    excerpt:
      "Adherence is the most underrated ingredient in any supplement. Here's what happens when taking your vitamins stops feeling like a chore.",
    accent: "citrus",
  },
  {
    slug: "shilajit-explained",
    title: "Himalayan shilajit, explained without the mysticism",
    category: "Ingredients",
    date: "02 Aug 2026",
    read: "7 min read",
    excerpt:
      "Fulvic acid, purification standards and what the research actually supports — a plain-language guide to the resin everyone is talking about.",
    accent: "grape",
  },
  {
    slug: "kids-immunity-routine",
    title: "Building a kids' immunity routine that survives school mornings",
    category: "Family",
    date: "24 Jul 2026",
    read: "4 min read",
    excerpt: "Six small habits that work better than any single supplement, plus where a daily gummy genuinely helps.",
    accent: "berry",
  },
  {
    slug: "biotin-hair-truth",
    title: "The honest truth about biotin and hair growth",
    category: "Beauty",
    date: "11 Jul 2026",
    read: "6 min read",
    excerpt: "What biotin can do, what it can't, and how long you should realistically give it before judging results.",
    accent: "primary",
  },
  {
    slug: "reading-a-label",
    title: "How to read a supplement label like a formulator",
    category: "Ingredients",
    date: "28 Jun 2026",
    read: "8 min read",
    excerpt: "Proprietary blends, %RDA, and the three lines on the back of the pack that tell you almost everything.",
    accent: "leaf",
  },
];

export const orders = [
  {
    id: "SNR-100482",
    date: "14 Aug 2026",
    status: "Delivered" as const,
    total: 1548,
    items: [products[0]!, products[1]!],
  },
  {
    id: "SNR-100511",
    date: "20 Aug 2026",
    status: "Shipped" as const,
    total: 599,
    items: [products[2]!],
  },
  {
    id: "SNR-100530",
    date: "23 Aug 2026",
    status: "Processing" as const,
    total: 899,
    items: [products[1]!],
  },
  {
    id: "SNR-100294",
    date: "02 Jul 2026",
    status: "Cancelled" as const,
    total: 649,
    items: [products[0]!],
  },
];

export const FREE_SHIPPING_THRESHOLD = 499;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
