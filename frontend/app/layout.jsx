import "./globals.css";
import Navbar from "@/components/navigation/Navbar";

export const metadata = {
  metadataBase: new URL("https://pyq-insight.vercel.app"),
  title: {
    default: "PYQ Insight — Engineering Examination Intelligence",
    template: "%s | PYQ Insight",
  },
  description:
    "Deconstruct university past year papers with Natural Language Processing. Uncover high-probability exam topics, credit distributions, and automated study schedules.",
  applicationName: "PYQ Insight",
  authors: [{ name: "Mohd Asif", url: "https://github.com/mohdasif-v1/pyq-insight" }],
  keywords: [
    "AKTU PYQ",
    "AKTU Exam Prep",
    "Previous Year Questions",
    "NLP Exam Analysis",
    "Engineering Question Papers",
  ],
  icons: {
    icon: "/brand/pyq-insight-mark.svg",
    apple: "/brand/pyq-insight-mark.svg",
  },
  openGraph: {
    title: "PYQ Insight — Engineering Examination Intelligence",
    description: "Quantified exam prep using NLP on AKTU past papers.",
    url: "https://pyq-insight.vercel.app",
    siteName: "PYQ Insight",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600/30 selection:text-blue-300">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-slate-400">PYQ INSIGHT // AKTU B.TECH CURRICULUM</span>
            <span className="text-slate-600 font-mono text-[11px]">NLP EXTRACTION &bull; GREEDY SCHEDULING &bull; CLUSTER VECTORIZATION</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
