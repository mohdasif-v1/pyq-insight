"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  FileText,
  Binary,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";

// Dynamically load Three.js canvas to preserve initial SSR and performance
const ExamIntelligenceHeroVisual = dynamic(
  () => import("@/components/hero/ExamIntelligenceHeroVisual"),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="flex-1 flex flex-col bg-canvas-base bg-radial-hero bg-noise">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Narrative Column */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] text-balance">
                Turn Previous-Year Papers Into{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lavender via-brand-cyan to-white text-glow">
                  Exam Intelligence.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-ink-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed text-balance">
                Upload university question papers. Discover recurring topics, explore examination patterns, and prepare with greater clarity using Natural Language Processing.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-royal via-brand-muted to-brand-royal text-white font-semibold text-sm shadow-cta hover:shadow-glass-hover hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Explore the Platform</span>
                  <ArrowRight className="w-4 h-4 text-brand-lavender" />
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass-panel text-ink-secondary text-sm font-medium hover:text-ink-primary hover:border-brand-lavender/40 hover:bg-white/5 transition-all"
                >
                  <span>See How It Works</span>
                </a>
              </div>

              {/* Verified Benchmark Metrics Pill */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-ink-muted font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>100% Extraction Accuracy (191/191)</span>
                </div>
                <span>&bull;</span>
                <div>0.24s NLP Ingestion Latency</div>
                <span>&bull;</span>
                <div>AKTU Syllabus Aligned</div>
              </div>
            </motion.div>

            {/* Right Dimensional Visual Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative flex items-center justify-center"
            >
              <div className="w-full max-w-[480px] lg:max-w-none">
                <ExamIntelligenceHeroVisual />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION: PROBLEM & SOLUTION */}
      <section className="py-24 border-y border-canvas-border bg-canvas-deep/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-widest">
              The Examination Challenge
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Engineering students spend weeks manually flipping through PDFs without understanding actual question frequency.
            </h3>
            <p className="text-base text-ink-secondary leading-relaxed">
              University exams follow structured patterns, yet students rely on arbitrary guesses and unverified guides. PYQ Insight automates PDF deconstruction to extract, vectorize, and rank question importance mathematically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-2xl space-y-4 border-l-4 border-l-rose-500/80">
              <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider block">
                The Manual Paradigm
              </span>
              <h4 className="text-lg font-semibold text-white">Scattered Papers &amp; Guesswork</h4>
              <ul className="space-y-2.5 text-xs text-ink-muted leading-relaxed">
                <li>&times; Manually reading dozens of scanned university question papers.</li>
                <li>&times; Subjective guesses on which unit carries highest exam weightage.</li>
                <li>&times; No method to group paraphrased question variations.</li>
                <li>&times; Unstructured exam preparation leading to revision bottlenecks.</li>
              </ul>
            </div>

            <div className="glass-panel p-8 rounded-2xl space-y-4 border-l-4 border-l-brand-lavender">
              <span className="text-xs font-mono font-semibold text-brand-lavender uppercase tracking-wider block">
                The PYQ Insight Solution
              </span>
              <h4 className="text-lg font-semibold text-white">Algorithmic Academic Intelligence</h4>
              <ul className="space-y-2.5 text-xs text-ink-secondary leading-relaxed">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dual-engine PDF extraction using vector text parsing with OCR fallback.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>TF-IDF cosine similarity mapping directly into syllabus units.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dynamic Knapsack study scheduler allocating daily preparation targets.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>K-Means clustering grouping recurring question patterns.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: HOW IT WORKS (Upload -> Extract -> Analyse -> Review -> Discover) */}
      <section id="how-it-works" className="py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-mono font-bold text-brand-lavender uppercase tracking-widest">
              End-to-End Pipeline
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              From Raw PDF to Quantified Topic Priority
            </h3>
            <p className="text-sm text-ink-secondary">
              A 5-stage automated ingestion pipeline that transforms examination documents into actionable intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "Upload",
                desc: "Ingest university question paper PDFs through the administrative interface.",
              },
              {
                step: "02",
                title: "Extract",
                desc: "Dual-layer extraction decomposes sections, marks, and question boundaries.",
              },
              {
                step: "03",
                title: "Analyse",
                desc: "TF-IDF vector matching measures similarity against syllabus topic profiles.",
              },
              {
                step: "04",
                title: "Review",
                desc: "Low-confidence questions (&lt;0.15 score) trigger human admin review.",
              },
              {
                step: "05",
                title: "Discover",
                desc: "Students explore interactive heatmaps, trend lines, and optimized timetables.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl relative space-y-3 hover:border-brand-lavender/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-lavender/80 group-hover:text-brand-cyan transition-colors">
                    {item.step}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-royal group-hover:bg-brand-cyan transition-colors" />
                </div>
                <h4 className="text-base font-semibold text-white">{item.title}</h4>
                <p className="text-xs text-ink-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: LIVE DATA SHOWCASE */}
      <section className="py-24 border-t border-canvas-border bg-canvas-deep/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-widest">
                Curriculum Ingestion Telemetry
              </h2>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                Validated Across Real AKTU Examination Sessions
              </h3>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-lavender hover:text-white transition"
            >
              <span>Explore Student Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-canvas-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-canvas-border text-[11px] font-mono text-ink-muted bg-canvas-elevated/40">
                  <tr>
                    <th className="px-6 py-3.5 font-normal">Subject Code &bull; Name</th>
                    <th className="px-6 py-3.5 font-normal">Curriculum Scope</th>
                    <th className="px-6 py-3.5 font-normal">NLP Accuracy</th>
                    <th className="px-6 py-3.5 font-normal">Classification Mode</th>
                    <th className="px-6 py-3.5 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-border text-ink-secondary">
                  <tr className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 font-medium text-white">
                      <span className="font-mono text-brand-lavender mr-2">KCS501</span>
                      Database Management Systems
                    </td>
                    <td className="px-6 py-4 font-mono text-ink-muted">5 Units / 25 Syllabus Topics</td>
                    <td className="px-6 py-4 font-mono text-white">100% Text Ingestion</td>
                    <td className="px-6 py-4 text-ink-muted">TF-IDF Vector Cosine Sim</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                        VERIFIED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 font-medium text-white">
                      <span className="font-mono text-brand-lavender mr-2">KCS051</span>
                      Data Analytics
                    </td>
                    <td className="px-6 py-4 font-mono text-ink-muted">5 Units / 25 Syllabus Topics</td>
                    <td className="px-6 py-4 font-mono text-white">100% Text Ingestion</td>
                    <td className="px-6 py-4 text-ink-muted">TF-IDF Vector Cosine Sim</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                        VERIFIED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 relative overflow-hidden border-t border-canvas-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Stop guessing your semester exam.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lavender via-brand-cyan to-white">
              Start preparing with data.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary max-w-xl mx-auto">
            Experience intelligent previous-year question analysis built specifically for engineering university curricula.
          </p>

          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-royal via-brand-muted to-brand-royal text-white font-semibold text-sm shadow-cta hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4 text-brand-lavender" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
