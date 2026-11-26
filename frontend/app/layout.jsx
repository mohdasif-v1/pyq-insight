import "./globals.css";
import Navbar from "@/components/navigation/Navbar";

export const metadata = {
  metadataBase: new URL("https://pyq-insight.vercel.app"),
  title: {
    default: "PYQ Insight — Engineering Examination Intelligence",
    template: "%s | PYQ Insight",
  },
  description:
    "Analyze past examination question papers with NLP. Topic importance distributions, credit weightage, and structured study planning.",
  applicationName: "PYQ Insight",
  authors: [{ name: "Mohd Asif", url: "https://github.com/mohdasif-v1/pyq-insight" }],
  icons: {
    icon: "/brand/pyq-insight-mark.svg",
    apple: "/brand/pyq-insight-mark.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-app-bg text-text-primary selection:bg-indigo-muted/40 selection:text-text-primary">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="border-t border-app-border bg-app-bg py-5 text-xs text-text-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-text-secondary">PYQ INSIGHT &bull; AKTU B.TECH CURRICULUM</span>
            <span className="text-[11px] text-text-muted">NLP Question Ingestion &bull; TF-IDF Classification &bull; Study Optimization</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
