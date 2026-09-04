import { getSiteUrl } from "@/lib/site";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  category: string;
  readMinutes: number;
  /** Markdown-ish sections rendered as HTML blocks */
  sections: Array<{ heading?: string; paragraphs: string[] }>;
  relatedHrefs?: Array<{ href: string; label: string }>;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-ai-tools-nepal-2026",
    title: "Best AI Tools in Nepal (2026) — ChatGPT, Gemini, CapCut & More",
    description:
      "Compare the best AI tools available in Nepal with NPR pricing, website checkout, bank QR payment, and WhatsApp support from TRIHEX DIGITAL.",
    keywords: [
      "best AI tools Nepal",
      "ChatGPT Nepal",
      "Gemini Nepal",
      "AI tools price Nepal",
      "digital tools Nepal 2026",
    ],
    publishedAt: "2026-07-22",
    updatedAt: "2026-07-22",
    category: "Guides",
    readMinutes: 7,
    sections: [
      {
        paragraphs: [
          "Nepal creators, students, freelancers, and small businesses are adopting AI faster than ever. The challenge is not finding tools — it is buying them with clear NPR prices, a trusted checkout, and local support.",
          "TRIHEX DIGITAL is a Nepal-first digital storefront. You browse packages on the website, pay with bank QR / eSewa / Khalti, upload payment proof, and get fulfillment after verification — with WhatsApp help when you need it.",
        ],
      },
      {
        heading: "Top AI tools Nepalis are buying right now",
        paragraphs: [
          "ChatGPT Plus — strong for writing, coding help, and daily productivity. Ideal if you want a reliable assistant with Plus features.",
          "Google Gemini / AI Pro packages — useful for research, multimodal work, and long-duration plans that include larger storage on selected packages.",
          "Grok Super — a strong option for users who want xAI’s Grok experience for a set duration.",
          "CapCut Pro — the go-to video editor for Reels, TikTok, and YouTube Shorts creators in Nepal.",
          "Canva / Grammarly / Coursera — design, writing quality, and learning plans that pair well with AI workflows.",
        ],
      },
      {
        heading: "How to choose the right package",
        paragraphs: [
          "Match duration to your workload. A 1-month plan is fine for testing; longer plans usually cost less per month.",
          "Use packages marked Available as a starting point on the website. Every package is confirmed through a WhatsApp availability check before payment.",
          "Always inquire if you are unsure — prices can move with supply. TRIHEX shows final NPR prices before checkout.",
        ],
      },
      {
        heading: "Why website checkout matters",
        paragraphs: [
          "The website is the order of record. WhatsApp is for support and payment verification — not for replacing checkout.",
          "After you pay, upload your payment screenshot and message WhatsApp so TRIHEX can verify and deliver for your order number.",
        ],
      },
    ],
    relatedHrefs: [
      { href: "/ai-tools-nepal", label: "Shop AI tools" },
      { href: "/products", label: "All products" },
      { href: "/how-it-works", label: "How ordering works" },
    ],
  },
  {
    slug: "buy-chatgpt-plus-nepal",
    title: "How to Buy ChatGPT Plus in Nepal (NPR) — Safe Website Checkout",
    description:
      "Step-by-step guide to buying ChatGPT Plus in Nepal with NPR pricing, bank QR / wallet payment, payment screenshot upload, and WhatsApp verification.",
    keywords: [
      "buy ChatGPT Plus Nepal",
      "ChatGPT Plus price Nepal",
      "ChatGPT Nepal NPR",
      "OpenAI Plus Nepal",
    ],
    publishedAt: "2026-07-22",
    updatedAt: "2026-07-22",
    category: "How-to",
    readMinutes: 6,
    sections: [
      {
        paragraphs: [
          "If you searched for “ChatGPT Plus Nepal” or “ChatGPT Plus price in NPR”, you want a clear path: transparent price, local payment, and support that answers on WhatsApp.",
          "Here is the TRIHEX DIGITAL flow used by customers across Nepal.",
        ],
      },
      {
        heading: "1) Open the ChatGPT Plus product page",
        paragraphs: [
          "Go to Products → ChatGPT Plus (or search on the site). Confirm duration and the listed price in NPR, then tap Check Availability to message TRIHEX.",
          "If the package shows Check Availability / Under Review, message WhatsApp first — do not force checkout.",
        ],
      },
      {
        heading: "2) Place the order on the website",
        paragraphs: [
          "Tap Check Availability and message TRIHEX on WhatsApp. Confirm the package, payment method, and delivery details with the support team before paying.",
          "You will get an order number. Keep it — payment remarks and WhatsApp messages should include this number.",
        ],
      },
      {
        heading: "3) Pay with bank QR, eSewa, or Khalti",
        paragraphs: [
          "Pay the exact NPR amount shown. For bank QR, scan the TRIHEX QR on checkout / success and put the order number in remarks when possible.",
          "Prices can vary with supply — inquire before paying if anything looks unclear.",
        ],
      },
      {
        heading: "4) Upload screenshot + WhatsApp verify",
        paragraphs: [
          "Upload your payment screenshot on the success page. Then tap WhatsApp for payment verification and send the same screenshot in chat.",
          "After TRIHEX verifies payment, your package is fulfilled for that order number via the stated delivery method / WhatsApp.",
        ],
      },
    ],
    relatedHrefs: [
      { href: "/products", label: "Browse ChatGPT packages" },
      { href: "/checkout", label: "Go to checkout" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    slug: "capcut-pro-nepal-price",
    title: "CapCut Pro Nepal Price Guide — 7 Days, 1 Month & 6 Months",
    description:
      "CapCut Pro prices in Nepal (NPR): compare short and long plans, checkout online, pay by QR, and get verified fulfillment from TRIHEX DIGITAL.",
    keywords: [
      "CapCut Pro Nepal",
      "CapCut Pro price Nepal",
      "buy CapCut Pro Nepal",
      "CapCut Pro NPR",
    ],
    publishedAt: "2026-07-22",
    updatedAt: "2026-07-22",
    category: "Pricing",
    readMinutes: 5,
    sections: [
      {
        paragraphs: [
          "CapCut Pro is one of the most requested creator tools in Nepal. Editors need export quality, effects, and Pro features without guessing black-market pricing.",
          "TRIHEX lists CapCut plans with clear NPR sell prices and website checkout.",
        ],
      },
      {
        heading: "Which CapCut duration should you pick?",
        paragraphs: [
          "7-day plans — good for a single campaign or to test Pro features.",
          "1-month plans — best for regular short-form editors.",
          "6-month plans — better value if CapCut is part of your weekly workflow.",
        ],
      },
      {
        heading: "How payment works",
        paragraphs: [
          "Checkout on trihexdigital.shop → pay exact NPR via bank QR / eSewa / Khalti → upload screenshot → WhatsApp verification → delivery after confirmation.",
          "Always use the website order number in payment remarks and chats.",
        ],
      },
    ],
    relatedHrefs: [
      { href: "/categories/video-editing", label: "Video & editing tools" },
      { href: "/creator-tools-nepal", label: "Creator tools Nepal" },
      { href: "/deals", label: "Current deals" },
    ],
  },
  {
    slug: "gemini-ai-pro-nepal",
    title: "Gemini AI Pro in Nepal — NPR Packages, Storage & Checkout",
    description:
      "Buy Gemini / Google AI Pro style packages in Nepal with NPR pricing, transparent duration, website order tracking, and WhatsApp support.",
    keywords: [
      "Gemini Nepal",
      "Gemini AI Pro Nepal",
      "Google AI Pro Nepal",
      "Gemini price Nepal",
    ],
    publishedAt: "2026-07-22",
    updatedAt: "2026-07-22",
    category: "Guides",
    readMinutes: 6,
    sections: [
      {
        paragraphs: [
          "Gemini packages are popular in Nepal for students and professionals who want strong AI assistance plus longer plan durations on selected offers.",
          "TRIHEX shows package details, NPR price, and availability status before you pay.",
        ],
      },
      {
        heading: "What to check on the product page",
        paragraphs: [
          "Duration (months) and what the plan includes.",
          "Whether the package is listed as Available or needs a WhatsApp availability confirmation.",
          "Compare-at vs sell price so savings are clear — final charge is the sell price in NPR.",
        ],
      },
      {
        heading: "Fulfillment after payment",
        paragraphs: [
          "Upload payment proof and message WhatsApp for verification. Delivery / activation steps are shared for your order once payment is confirmed.",
          "TRIHEX is an independent retailer. Brand names belong to their owners; affiliation is stated only where verified.",
        ],
      },
    ],
    relatedHrefs: [
      { href: "/ai-tools-nepal", label: "AI tools Nepal" },
      { href: "/pricing-transparency", label: "Pricing transparency" },
      { href: "/verified-supply", label: "Authorization policy" },
    ],
  },
  {
    slug: "pay-digital-tools-nepal-esewa-khalti-bank-qr",
    title: "Pay for Digital Tools in Nepal — eSewa, Khalti & Bank QR",
    description:
      "How Nepali customers pay for AI and digital tools online: bank QR scan-to-pay, eSewa, Khalti, payment screenshots, and WhatsApp verification.",
    keywords: [
      "pay digital tools Nepal",
      "eSewa digital products",
      "Khalti AI tools",
      "bank QR payment Nepal",
    ],
    publishedAt: "2026-07-22",
    updatedAt: "2026-07-22",
    category: "Payments",
    readMinutes: 5,
    sections: [
      {
        paragraphs: [
          "International cards are not always practical for every buyer in Nepal. TRIHEX supports local payment paths that customers already trust.",
        ],
      },
      {
        heading: "Bank QR (recommended for many orders)",
        paragraphs: [
          "Scan the TRIHEX bank QR shown at checkout / order success.",
          "Pay the exact NPR amount. Put your order number in remarks when the banking app allows it.",
          "Upload the payment screenshot on the website, then send it on WhatsApp for verification.",
        ],
      },
      {
        heading: "eSewa & Khalti (manual verification)",
        paragraphs: [
          "Choose eSewa or Khalti at checkout when offered. Send the exact amount with the order number in remarks, then upload proof.",
          "Payment is marked paid only after TRIHEX verifies your screenshot / funds — opening WhatsApp alone does not complete payment.",
        ],
      },
      {
        heading: "Stay safe",
        paragraphs: [
          "Only pay using details shown on trihexdigital.shop for your order.",
          "Never share passwords, OTPs, or recovery codes in chat.",
          "Use Track Order on the website for status, and WhatsApp for payment / delivery questions.",
        ],
      },
    ],
    relatedHrefs: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/track-order", label: "Track order" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    slug: "digital-services-store-nepal",
    title: "Nepal’s Trusted Digital Services Store — Why TRIHEX DIGITAL",
    description:
      "TRIHEX DIGITAL is a Nepal-first store for AI and digital tools: transparent NPR prices, website checkout, stock status, and WhatsApp support.",
    keywords: [
      "digital services Nepal",
      "buy digital products Nepal",
      "AI store Nepal",
      "TRIHEX DIGITAL",
    ],
    publishedAt: "2026-07-22",
    updatedAt: "2026-07-22",
    category: "Company",
    readMinutes: 4,
    sections: [
      {
        paragraphs: [
          "TRIHEX DIGITAL builds a website-first shopping experience for Nepal: catalogue, cart, checkout, payment proof, order tracking, and admin-verified fulfillment.",
          "We focus on clarity — Available vs Under Review, stock labels, price inquiry notices, and local WhatsApp support at +977 9702910130.",
        ],
      },
      {
        heading: "What you get",
        paragraphs: [
          "Transparent NPR pricing with list vs sell clarity where shown.",
          "Bank QR / wallet payment options suited to Nepal.",
          "Order numbers and tracking on the website.",
          "Human verification before delivery.",
        ],
      },
      {
        heading: "Independent retailer disclosure",
        paragraphs: [
          "TRIHEX DIGITAL is an independent digital-services retailer. Third-party product names and trademarks belong to their respective owners. Affiliation or authorization is stated only where verified.",
        ],
      },
    ],
    relatedHrefs: [
      { href: "/about", label: "About TRIHEX" },
      { href: "/business-disclosures", label: "Business disclosures" },
      { href: "/products", label: "Shop now" },
    ],
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  );
}

export function getBlogPost(slug: string): BlogPost | null {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

export function blogPostUrl(slug: string): string {
  return `${getSiteUrl()}/blog/${slug}`;
}
