import Link from "next/link";
import {
  FileText,
  Binary,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Shield,
  BarChart2,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center bg-app-bg">
      {/* Hero Section */}
      <section className="py-20 md:py-28 border-b border-app-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-royal/40 border border-app-border text-indigo-lavender text-xs font-mono">
            <span>AKTU Engineering Exam Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-text-primary max-w-3xl mx-auto leading-tight">
            Analyze Past Examination Papers with Precision NLP
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
            PYQ Insight deconstructs university past papers into TF-IDF vector representations, identifies high-frequency syllabus topics, and optimizes revision scheduling through algorithmic topic scoring.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-indigo-royal text-text-primary font-medium text-xs sm:text-sm hover:bg-indigo-muted transition"
            >
              <span>View Curriculum Analytics</span>
              <ArrowRight className="w-4 h-4 text-indigo-lavender" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded border border-app-border bg-app-surface text-text-secondary text-xs sm:text-sm font-medium hover:text-text-primary hover:bg-app-elevated transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Telemetry / Ingestion Overview Table & Metrics */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-8">
        <div className="border-b border-app-border pb-3">
          <h2 className="text-base font-semibold text-text-primary">System Processing &amp; Architecture</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Ingestion throughput and classification pipeline metrics across university examination papers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded border border-app-border bg-app-surface space-y-1.5">
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">Extraction Model</span>
            <p className="text-sm font-semibold text-text-primary">pdfplumber + OCR Fallback</p>
            <p className="text-xs text-text-secondary">Dual-layer document parser for scanned and vector university PDFs.</p>
          </div>

          <div className="p-4 rounded border border-app-border bg-app-surface space-y-1.5">
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">Topic Classification</span>
            <p className="text-sm font-semibold text-text-primary">TF-IDF Vector Matching</p>
            <p className="text-xs text-text-secondary">Cosine similarity mapping against syllabus keyword taxonomy (&gt;0.15 threshold).</p>
          </div>

          <div className="p-4 rounded border border-app-border bg-app-surface space-y-1.5">
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">Revision Allocation</span>
            <p className="text-sm font-semibold text-text-primary">Dynamic Knapsack Optimizer</p>
            <p className="text-xs text-text-secondary">Distributes preparation hours across high-weightage topics with mandatory revision buffers.</p>
          </div>
        </div>

        {/* Dense Architecture Summary Table */}
        <div className="border border-app-border rounded bg-app-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-app-border bg-app-elevated/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary">Curriculum Coverage Telemetry</span>
            <span className="text-[11px] font-mono text-indigo-lavender">B.Tech CSE &bull; 5th Semester</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-app-border text-[11px] font-mono text-text-muted bg-app-surface">
                <tr>
                  <th className="px-4 py-2.5 font-normal">Subject</th>
                  <th className="px-4 py-2.5 font-normal">Code</th>
                  <th className="px-4 py-2.5 font-normal">Units</th>
                  <th className="px-4 py-2.5 font-normal">NLP Accuracy</th>
                  <th className="px-4 py-2.5 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border text-text-secondary">
                <tr className="hover:bg-app-elevated/40 transition">
                  <td className="px-4 py-2.5 font-medium text-text-primary">Database Management Systems</td>
                  <td className="px-4 py-2.5 font-mono text-text-muted">KCS501</td>
                  <td className="px-4 py-2.5 font-mono">5 Units / 25 Topics</td>
                  <td className="px-4 py-2.5 font-mono text-text-primary">100% Ingestion</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-400 text-[11px]">VERIFIED</td>
                </tr>
                <tr className="hover:bg-app-elevated/40 transition">
                  <td className="px-4 py-2.5 font-medium text-text-primary">Data Analytics</td>
                  <td className="px-4 py-2.5 font-mono text-text-muted">KCS051</td>
                  <td className="px-4 py-2.5 font-mono">5 Units / 25 Topics</td>
                  <td className="px-4 py-2.5 font-mono text-text-primary">100% Ingestion</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-400 text-[11px]">VERIFIED</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
