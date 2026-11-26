import "./globals.css";
import Navbar from "@/components/navigation/Navbar";

export const metadata = {
  metadataBase: new URL("https://pyq-insight.vercel.app"),
  title: {
    default: "PYQ Insight — Previous Year Question Paper Intelligence",
    template: "%s | PYQ Insight",
  },
  description:
    "Analyze previous-year examination papers, map questions to syllabus topics, understand exam priority trends, and build adaptive study schedules.",
  applicationName: "PYQ Insight",
  authors: [{ name: "Mohd Asif", url: "https://github.com/mohdasif-v1/pyq-insight" }],
  keywords: [
    "PYQ",
    "AKTU",
    "Previous Year Questions",
    "Exam Intelligence",
    "Study Planner",
    "NLP",
    "Syllabus Analytics",
  ],
  icons: {
    icon: "/brand/pyq-insight-mark.svg",
    apple: "/brand/pyq-insight-mark.svg",
  },
  openGraph: {
    title: "PYQ Insight — Exam Preparation Intelligence",
    description:
      "Transforming university previous year question papers into actionable syllabus insights and adaptive exam preparation plans.",
    url: "https://pyq-insight.vercel.app",
    siteName: "PYQ Insight",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-dark-bg text-slate-100 selection:bg-brand-primary/20 selection:text-brand-primary">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="border-t border-dark-border bg-dark-bg py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>PYQ Insight • Academic Examination Intelligence &amp; NLP Planner</span>
            <span className="text-slate-600 font-mono text-[11px]">AKTU B.Tech Curriculum</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
