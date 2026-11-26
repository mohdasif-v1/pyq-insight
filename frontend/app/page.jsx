import Link from "next/link";
import {
  FileText,
  Sparkles,
  BarChart3,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Layers,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-dark-border">
        {/* Subtle backdrop glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-dark-border bg-dark-surface text-slate-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-status-success" />
            <span>AKTU B.Tech Examination Intelligence Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
            Understand Previous Year Questions.{" "}
            <span className="text-brand-primary">Prioritize Smarter.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            PYQ Insight parses previous year question papers using Natural Language Processing, maps questions to syllabus units, and builds high-yield study schedules.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-primary text-dark-bg font-semibold text-sm hover:bg-brand-hover transition shadow-subtle"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-dark-border bg-dark-surface text-slate-200 text-sm font-medium hover:bg-dark-card hover:border-slate-500 transition"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Structured Academic Intelligence</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            End-to-end analytical pipeline designed specifically for university semester examinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-dark-border bg-dark-card p-6 space-y-3 shadow-card">
            <div className="w-9 h-9 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center text-brand-primary">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-100">Automated PDF Parsing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts examination questions, section structures, and marks distribution from university question papers with OCR fallback.
            </p>
          </div>

          <div className="rounded-xl border border-dark-border bg-dark-card p-6 space-y-3 shadow-card">
            <div className="w-9 h-9 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center text-brand-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-100">NLP Topic Mapping</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes TF-IDF cosine similarity against syllabus keyword representations to link questions to curriculum topics.
            </p>
          </div>

          <div className="rounded-xl border border-dark-border bg-dark-card p-6 space-y-3 shadow-card">
            <div className="w-9 h-9 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center text-status-success">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-100">Weight &amp; Priority Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes frequency, recency, and marks weight into normalized topic priority scores to highlight high-yield examination areas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
