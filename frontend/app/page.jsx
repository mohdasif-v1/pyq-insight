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
  Flame,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center bg-slate-950 bg-grid-pattern">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-32 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-750 bg-slate-900/80 text-slate-300 text-xs font-medium shadow-flat">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400 font-mono">v1.0</span>
            <span className="text-slate-600">•</span>
            <span>AKTU Engineering Exam Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] text-balance">
            Exam intelligence,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              quantified by NLP.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed text-balance">
            Stop guessing semester questions. PYQ Insight decomposes university past papers into TF-IDF vector embeddings, reveals recurring high-yield units, and builds dynamic revision timetables.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 transition shadow-glow"
            >
              <span>Explore Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-750 bg-slate-900 text-slate-300 text-sm font-medium hover:bg-slate-850 hover:text-white transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Live Interactive Product Mockup / Telemetry Panel */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
          {/* Mac-style Window Top Bar */}
          <div className="h-10 border-b border-slate-800 bg-slate-950/70 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-750" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-750" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-750" />
              <span className="ml-3 text-[11px] font-mono text-slate-500">pyq-insight-engine // telemetry</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400">● 100% Extraction (191/191)</span>
              <span>•</span>
              <span>Avg Latency: 0.24s</span>
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/50">
            <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Top High-Yield Topic</span>
                <span className="text-blue-400">85.0% Index</span>
              </div>
              <p className="text-sm font-semibold text-slate-100">Three-Schema Architecture</p>
              <div className="flex gap-2 text-[10px] font-mono text-slate-500 pt-1">
                <span>Unit 1</span>
                <span>•</span>
                <span>Freq: 1.0</span>
                <span>•</span>
                <span>Recency: 1.0</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>NLP Topic Mapping</span>
                <span className="text-cyan-400">TF-IDF Vector</span>
              </div>
              <p className="text-sm font-semibold text-slate-100">Cosine Similarity Matching</p>
              <div className="flex gap-2 text-[10px] font-mono text-slate-500 pt-1">
                <span>Threshold: 0.15</span>
                <span>•</span>
                <span>Fallback: Review Queue</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Adaptive Allocation</span>
                <span className="text-emerald-400">Greedy Knapsack</span>
              </div>
              <p className="text-sm font-semibold text-slate-100">Weighted Study Timetable</p>
              <div className="flex gap-2 text-[10px] font-mono text-slate-500 pt-1">
                <span>Weak Boost: 1.5×</span>
                <span>•</span>
                <span>Buffer: Revision Day</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Pillars */}
      <section className="py-12 pb-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/60 space-y-3">
            <div className="w-8 h-8 rounded-md bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Structural OCR &amp; Segmentation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Regex grammar rules extract subparts (1a–1j, 2a–2e) and parse exact marks weightage without losing mathematical symbols or diagrams.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/60 space-y-3">
            <div className="w-8 h-8 rounded-md bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Syllabus Topic Vectorization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curriculum units and keyword profiles are vectorized using scikit-learn TF-IDF to eliminate manual examination categorization.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/60 space-y-3">
            <div className="w-8 h-8 rounded-md bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Scientific Priority Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Combines historical frequency, recency decay, and credit marks to calculate clear High, Medium, and Low preparation tiers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
