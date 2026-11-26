import "./globals.css";
import Navbar from "@/components/navigation/Navbar";

export const viewport = {
  themeColor: "#0A0915",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL("https://pyq-insight.vercel.app"),
  title: {
    default: "PYQ Insight — Smart Previous-Year Question Paper Analysis",
    template: "%s | PYQ Insight",
  },
  description:
    "Analyse university previous-year question papers with NLP. Explore topic-wise examination patterns, organise syllabus questions and prepare more effectively with PYQ Insight.",
  applicationName: "PYQ Insight",
  authors: [{ name: "Mohd Asif", url: "https://github.com/mohdasif-v1/pyq-insight" }],
  creator: "Mohd Asif",
  publisher: "PYQ Insight",
  keywords: [
    "AKTU PYQ",
    "Previous Year Questions",
    "Engineering Exam Intelligence",
    "NLP Question Paper Analysis",
    "TF-IDF Topic Weightage",
    "AKTU B.Tech CSE",
    "Adaptive Study Scheduler",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/icon.svg"],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pyq-insight.vercel.app",
    siteName: "PYQ Insight",
    title: "PYQ Insight — Smart Previous-Year Question Paper Analysis",
    description:
      "Analyse university previous-year question papers with NLP. Explore topic-wise examination patterns, organise syllabus questions and prepare more effectively with PYQ Insight.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PYQ Insight — Exam Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PYQ Insight — Smart Previous-Year Question Paper Analysis",
    description:
      "Analyse university previous-year question papers with NLP. Explore topic-wise examination patterns, organise syllabus questions and prepare more effectively with PYQ Insight.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  // Structured Data: WebSite & SoftwareApplication JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://pyq-insight.vercel.app/#website",
        url: "https://pyq-insight.vercel.app",
        name: "PYQ Insight",
        description: "Smart Previous-Year Question Paper Analysis using NLP",
        publisher: {
          "@type": "Person",
          name: "Mohd Asif",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://pyq-insight.vercel.app/#software",
        name: "PYQ Insight",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        description:
          "Analyse university previous-year question papers with NLP. Explore topic-wise examination patterns and prepare with greater clarity.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
    ],
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-canvas-base text-ink-primary selection:bg-brand-royal/60 selection:text-white">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="border-t border-canvas-border bg-canvas-base/80 backdrop-blur-md py-6 text-xs text-ink-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink-secondary">PYQ Insight</span>
              <span>&bull;</span>
              <span>AKTU B.Tech Curriculum Intelligence</span>
            </div>
            <div className="text-[11px] font-mono text-ink-muted flex items-center gap-3">
              <span>Dual-Engine PDF Parser</span>
              <span>&bull;</span>
              <span>TF-IDF Vector Mapping</span>
              <span>&bull;</span>
              <span>0/1 Knapsack Optimizer</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
