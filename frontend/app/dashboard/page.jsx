"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import Heatmap from "@/components/Heatmap";
import TrendChart from "@/components/TrendChart";
import {
  Calendar,
  Layers,
  ArrowRight,
  Check,
  AlertTriangle,
  Clock,
  BookOpen,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [scoresData, setScoresData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api("/subjects")
      .then((subs) => {
        setSubjects(subs);
        if (subs.length > 0) {
          setSelectedSubject(subs[0]._id);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!selectedSubject) return;
    setLoading(true);
    setError("");

    Promise.all([
      api(`/dashboard/${selectedSubject}/scores`).catch(() => ({})),
      api(`/dashboard/${selectedSubject}/trend`).catch(() => []),
    ])
      .then(([scoresObj, trends]) => {
        const topicsList = Object.entries(scoresObj).map(([id, s]) => ({
          id,
          name: s.name || `Topic ${id}`,
          unit: s.unit || `Unit ${s.unitNo || "General"}`,
          score: s.score,
          level: s.level,
        }));
        setScoresData(topicsList);
        setTrendData(trends);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedSubject]);

  async function updateProgress(topicId, status) {
    try {
      await api(`/progress/${topicId}`, { method: "PUT", body: { status } });
      setProgress((prev) => ({ ...prev, [topicId]: status }));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  }

  const currentSub = subjects.find((s) => s._id === selectedSubject);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
      {/* Header & Subject Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-canvas-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Curriculum Intelligence</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-royal border border-brand-lavender/30 text-brand-lavender font-mono font-medium">
              AKTU CURRICULUM
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Statistical topic distribution, credit weightage, and recurring examination patterns
          </p>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs text-ink-muted font-mono uppercase tracking-wider">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-xl glass-input px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id} className="bg-canvas-deep text-white">
                {s.name} ({s.code || "Sem " + s.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-xs text-ink-muted font-mono animate-pulse">
          Analyzing NLP examination embeddings...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <span className="text-[11px] font-mono text-ink-muted uppercase">Course Code</span>
              <p className="text-xl font-bold text-white font-mono">{currentSub?.code || "KCS501"}</p>
              <p className="text-xs text-ink-secondary">Semester {currentSub?.semester || 5} Curriculum</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <span className="text-[11px] font-mono text-ink-muted uppercase">Indexed Topics</span>
              <p className="text-xl font-bold text-white font-mono">{scoresData.length}</p>
              <p className="text-xs text-ink-secondary">Distributed across 5 syllabus units</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-ink-muted uppercase">Actionable Planning</span>
                <p className="text-xs text-ink-secondary mt-1">Generate adaptive timetable or solve clusters</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Link
                  href="/planner"
                  className="inline-flex items-center gap-1 text-xs text-brand-lavender hover:text-white font-semibold transition"
                >
                  <span>Open Planner</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="text-ink-muted">&bull;</span>
                <Link
                  href="/practice"
                  className="inline-flex items-center gap-1 text-xs text-brand-lavender hover:text-white font-semibold transition"
                >
                  <span>PYQ Practice</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Section: Topic Importance Matrix */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-canvas-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white">Topic Frequency &amp; Priority Heatmap</h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  NLP priority score calculated using TF-IDF term density and repetition recency.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-ink-muted">
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> High</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Medium</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Low</span>
              </div>
            </div>

            {scoresData.length > 0 ? (
              <Heatmap topics={scoresData} />
            ) : (
              <div className="text-center py-12 text-xs text-ink-muted">
                No topic scores computed for this subject yet. Upload past papers in Admin Console to index questions.
              </div>
            )}
          </div>

          {/* Section: Historical Volume Trends */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-canvas-border pb-4">
              <h2 className="text-base font-bold text-white">Historical Exam Paper Trend</h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                Total examination questions segmented and processed per academic session.
              </p>
            </div>

            <TrendChart data={trendData} />
          </div>

          {/* Section: Progress Checklist */}
          {scoresData.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-canvas-border pb-4">
                <h2 className="text-base font-bold text-white">Revision Status &amp; Mastery Tracker</h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Track topics as mastered or pending additional revision before semester exams.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-canvas-border text-[11px] font-mono text-ink-muted bg-canvas-elevated/40">
                    <tr>
                      <th className="px-4 py-3 font-normal">Topic</th>
                      <th className="px-4 py-3 font-normal">Unit</th>
                      <th className="px-4 py-3 font-normal">Priority Score</th>
                      <th className="px-4 py-3 font-normal text-right">Mastery Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-canvas-border text-ink-secondary">
                    {scoresData.slice(0, 10).map((t) => {
                      const isMastered = progress[t.id] === "mastered";
                      return (
                        <tr key={t.id} className="hover:bg-white/5 transition">
                          <td className="px-4 py-3.5 font-medium text-white">{t.name}</td>
                          <td className="px-4 py-3.5 font-mono text-ink-muted">{t.unit}</td>
                          <td className="px-4 py-3.5 font-mono">{t.score}%</td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => updateProgress(t.id, isMastered ? "pending" : "mastered")}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                                isMastered
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-brand-royal/60 text-brand-lavender hover:bg-brand-royal border border-brand-lavender/30"
                              }`}
                            >
                              {isMastered ? "Mastered" : "Mark Mastered"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
