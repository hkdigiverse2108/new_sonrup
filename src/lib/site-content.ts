export type PolicyDoc = {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

export const policies: PolicyDoc[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    updated: "Last updated 1 August 2026",
    intro:
      "This policy explains what information Sonrup Nutrition collects when you browse or order from our store, why we collect it, and the control you have over it.",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "When you place an order we collect your name, email address, phone number and shipping address so we can deliver your gummies and keep you updated.",
          "When you browse the store we collect basic usage data such as pages viewed and device type. This is used only to improve the shopping experience.",
        ],
      },
      {
        heading: "How we use your information",
        body: [
          "To process, pack and deliver your orders, and to contact you about the status of an order.",
          "To send marketing updates only when you have opted in. Every email carries a one-click unsubscribe link.",
          "To detect fraud and keep our store secure.",
        ],
      },
      {
        heading: "Sharing",
        body: [
          "We share the minimum data necessary with delivery partners and payment processors. We never sell your personal data to third parties.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can request a copy of the data we hold about you, ask for corrections, or ask us to delete your account entirely by writing to care@sonrup.in. We respond within seven working days.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We use essential cookies to keep your bag and session working, and analytics cookies to understand which pages are useful. You can clear cookies at any time from your browser settings.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    updated: "Last updated 1 August 2026",
    intro:
      "By using sonrup.in and placing an order you agree to the terms below. Please read them before you check out.",
    sections: [
      {
        heading: "Using the store",
        body: [
          "You must be 18 or older to place an order. Products for children should be purchased and administered by a parent or guardian.",
          "All content on this site — copy, photography, illustration and design — belongs to Sonrup Nutrition and may not be reproduced without written permission.",
        ],
      },
      {
        heading: "Products and pricing",
        body: [
          "We work hard to describe every product accurately. Colours and gummy shapes may vary slightly between batches because we use natural fruit concentrates.",
          "All prices are in Indian Rupees and inclusive of applicable taxes. We may revise pricing at any time; the price shown when you place your order is the price you pay.",
        ],
      },
      {
        heading: "Health disclaimer",
        body: [
          "Our gummies are nutraceutical food supplements, not medicine. They are not intended to diagnose, treat, cure or prevent any disease. If you are pregnant, nursing, on medication or managing a health condition, speak to your doctor before use.",
        ],
      },
      {
        heading: "Orders",
        body: [
          "We reserve the right to cancel an order in case of pricing errors, stock issues or suspected fraud. Any amount already paid is refunded in full.",
        ],
      },
    ],
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    updated: "Last updated 1 August 2026",
    intro: "Everything you need to know about how your gummies reach you.",
    sections: [
      {
        heading: "Dispatch",
        body: [
          "Orders placed before 4 PM on a working day are dispatched the same day. Orders placed later, or on Sundays and public holidays, go out on the next working day.",
        ],
      },
      {
        heading: "Delivery timelines",
        body: [
          "Metro cities: 2-3 working days from dispatch.",
          "Rest of India: 4-6 working days from dispatch.",
          "Remote pincodes may take up to 8 working days.",
        ],
      },
      {
        heading: "Shipping charges",
        body: [
          "Shipping is free on all orders above ₹499. Below that, a flat ₹49 is added at checkout.",
        ],
      },
      {
        heading: "Tracking",
        body: [
          "As soon as your parcel leaves our warehouse you receive a tracking link over email and SMS. You can also track any order from your account under Orders.",
        ],
      },
      {
        heading: "Damaged parcels",
        body: [
          "If your parcel arrives damaged or tampered with, please refuse delivery where possible and write to care@sonrup.in within 48 hours with photographs. We will replace it at no cost.",
        ],
      },
    ],
  },
  {
    slug: "refund-policy",
    title: "Refund & Cancellation Policy",
    updated: "Last updated 1 August 2026",
    intro: "We want you to enjoy every tube. If something is not right, here is how we fix it.",
    sections: [
      {
        heading: "Cancellations",
        body: [
          "Orders can be cancelled free of charge any time before dispatch. Write to care@sonrup.in or cancel from your account under Orders.",
          "Once an order has been dispatched it can no longer be cancelled, but you may refuse delivery and we will process a refund on return.",
        ],
      },
      {
        heading: "Returns",
        body: [
          "Unopened tubes with an intact seal can be returned within 7 days of delivery. For food safety reasons we cannot accept opened or partially used products.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "Approved refunds are processed within 5-7 working days to the original payment method. Prepaid orders are refunded to the source; COD orders are refunded by bank transfer.",
        ],
      },
      {
        heading: "Wrong or missing items",
        body: [
          "If you received the wrong product or an item is missing, write to us within 48 hours of delivery with your order number and a photograph. We ship a replacement immediately.",
        ],
      },
    ],
  },
];

export function getPolicy(slug: string) {
  return policies.find((p) => p.slug === slug);
}

export const articleBody: Record<string, string[]> = {
  "why-gummies-beat-tablets": [
    "The best supplement in the world does nothing if it stays in the cupboard. Adherence — actually taking the thing, most days, for months — is the single biggest predictor of whether a supplement will do anything for you at all.",
    "Tablets lose on adherence for boring, human reasons. They are large, they taste of nothing pleasant, they need water, and they live in a bottle that looks medical. Every one of those is a tiny reason to skip today.",
    "A gummy solves the format problem, not the science problem. The actives are the same; what changes is the number of days you remember to take them. In our own customer data, people who switch from tablets to gummies report roughly twice as many taken days per month.",
    "That is not magic. It is the compound effect of a routine you look forward to. Keep the tube on the kitchen counter, take it with your morning coffee, and the habit builds itself.",
    "The catch: a gummy is only as good as its formula. Ask two questions before you buy. What is the actual dose of the active, and how much sugar is carrying it? If a brand will not tell you clearly, that is your answer.",
  ],
  "shilajit-explained": [
    "Shilajit is a resin that seeps out of Himalayan rock in the summer months. It has been used in Ayurveda for centuries, and in the last decade it has become one of the most talked about — and most misrepresented — ingredients in wellness.",
    "The active fraction most researchers focus on is fulvic acid, alongside dibenzo-alpha-pyrones and a spread of trace minerals. The research base is genuinely promising around energy metabolism, stamina and recovery, and genuinely thin around the bigger claims you see on social media.",
    "Purification matters more than potency claims. Raw resin can carry heavy metals and microbial load. Every batch we use is purified and third-party tested for lead, arsenic, mercury and cadmium before it enters a gummy.",
    "The traditional format — a sticky black resin dissolved in warm water — tastes strongly bitter and mineral. That is exactly why so many people buy it once and never finish the jar.",
    "Pairing it with tamarind is not just a flavour trick. Imli's natural tartness sits on top of the earthy notes and makes a daily dose something you can genuinely look forward to.",
  ],
  "kids-immunity-routine": [
    "Parents ask us for the one supplement that will stop their child getting sick. That product does not exist. What does exist is a set of small, repeatable habits that measurably help.",
    "Sleep first. School-age children need nine to eleven hours. Immune function suffers faster from short sleep than from almost any dietary gap.",
    "Then colour on the plate. Aim for three colours at lunch and three at dinner. It is easier to enforce than any nutrient target and it gets you most of the way there.",
    "Sunlight before screens. Twenty minutes of outdoor play in the morning supports vitamin D and sets the body clock for better sleep that night.",
    "Handwashing, hydration and a consistent mealtime round out the list. A daily multivitamin gummy sits on top of these — it covers the gaps on the days when the plate was beige and the schedule fell apart. Which, if you have children, is most days.",
  ],
  "biotin-hair-truth": [
    "Biotin has become shorthand for hair growth. The honest version is more specific and more useful.",
    "Biotin is a B vitamin involved in keratin infrastructure. If you are deficient, supplementing can visibly improve hair and nail quality. If you are not deficient, the effect on hair growth rate is small.",
    "Where biotin reliably delivers is nail strength — several studies show reduced brittleness and splitting over three to six months of consistent use.",
    "Timeline matters. Hair grows about a centimetre a month, so any change takes a full growth cycle to show. Judging results at four weeks is judging nothing.",
    "Pair biotin with adequate protein, iron and vitamin D, and be suspicious of any product that promises a transformation in thirty days.",
  ],
  "reading-a-label": [
    "The front of the pack is marketing. The back of the pack is information. Here is how to read it quickly.",
    "Start with serving size. A dose that looks impressive often assumes four gummies, not one. Normalise everything to a single serving before comparing brands.",
    "Then find the actives and their amounts in milligrams or micrograms, with the %RDA where one exists. If an ingredient is listed without a number, it is likely present in a token amount.",
    "Watch for proprietary blends. A blend lets a brand list ten exciting ingredients while disclosing only the total weight — which can be almost entirely the cheapest one.",
    "Finally, check the base: sugar content, gelatin versus pectin, and the preservative list. A clean base is a good proxy for how much care went into the rest of the formula.",
  ],
};

export const brandValues = [
  {
    title: "Taste is a feature",
    body: "If it does not taste good, you will not take it. We reformulate until the flavour panel scores it above eight out of ten — then we look at the actives.",
  },
  {
    title: "Doses you can check",
    body: "Every active is listed with its exact amount. No proprietary blends, no fairy dust, nothing hidden behind a trademarked name.",
  },
  {
    title: "Tested, batch by batch",
    body: "Heavy metals, microbial load and active potency are tested on every single batch by an independent NABL-accredited lab.",
  },
  {
    title: "Made to sit on the counter",
    body: "Packaging designed to be seen, not hidden in a cabinet. Visibility is the cheapest adherence tool there is.",
  },
];

export const milestones = [
  { year: "2023", text: "Two founders, one kitchen, and a stubborn belief that supplements should taste like something." },
  { year: "2024", text: "First batch of Biotin + Multivitamin gummies. Sold out in eleven days." },
  { year: "2025", text: "Himalayan Shilajit launches with zero added sugar. Our hardest formulation to date." },
  { year: "2026", text: "Over 120,000 tubes shipped across India and a kids' range parents actually trust." },
];
