"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import Heatmap from "@/components/Heatmap";
import TrendChart from "@/components/TrendChart";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [scoresData, setScoresData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth protection
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

  // Load subject scores and trends
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
      alert("Failed to update topic status: " + err.message);
    }
  }

  const currentSub = subjects.find((s) => s._id === selectedSubject);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Subject Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">Analytics Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            AKTU Question Paper Insights &amp; Exam Weightage Analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-400 whitespace-nowrap">Target Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-dark-border bg-dark-card px-3 py-2 text-xs sm:text-sm text-slate-200 font-medium shadow-subtle focus:border-brand-primary focus:outline-none"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code ? `${s.code} • ` : ""}{s.name} (Sem {s.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-status-error/10 border border-status-error/25 p-4 text-xs sm:text-sm text-status-error font-medium">
          {error}
        </div>
      )}

      {/* Quick Access KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-dark-border bg-dark-card p-5 shadow-card flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center text-brand-primary">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">Adaptive Planner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate a personalized study timetable with weak topic weighting and revision buffers.
            </p>
          </div>
          <Link
            href="/planner"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:text-brand-hover"
          >
            <span>Open Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-dark-border bg-dark-card p-5 shadow-card flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center text-brand-accent">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">Practice Mode</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solve repeated question clusters identified by TF-IDF K-Means across past exam sessions.
            </p>
          </div>
          <Link
            href="/practice"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-accent hover:underline"
          >
            <span>Open Practice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-dark-border bg-dark-card p-5 shadow-card flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center text-status-success">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">Syllabus Overview</h3>
            <p className="text-xs text-slate-300 font-medium">
              {currentSub ? `${currentSub.name} (${currentSub.code || "KCS"})` : "No Subject Selected"}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[11px] text-status-success bg-status-success-muted border border-status-success/30 px-2.5 py-0.5 rounded font-medium">
              {currentSub?.unitCount || 5} Units Configured
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {scoresData.length} Analyzed Topics
            </span>
          </div>
        </div>
      </div>

      {/* Topic Importance Heatmap */}
      <div className="rounded-xl border border-dark-border bg-dark-card p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-dark-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Topic Priority Heatmap</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Normalized Formula: 0.4 × Frequency + 0.3 × Recency + 0.3 × Marks Weight
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-status-error" /> High Priority (≥66%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-status-warning" /> Medium (≥33%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-status-success" /> Low (&lt;33%)
            </span>
          </div>
        </div>

        {loading ? (
          <p className="py-12 text-center text-xs text-slate-500">Loading topic analytics...</p>
        ) : scoresData.length > 0 ? (
          <Heatmap topics={scoresData} />
        ) : (
          <p className="py-12 text-center text-xs text-slate-500">
            No papers processed yet for this subject. Upload papers in the Admin portal to view priority heatmap.
          </p>
        )}
      </div>

      {/* Annual Question Trend Chart */}
      <div className="rounded-xl border border-dark-border bg-dark-card p-6 shadow-card space-y-4">
        <div className="border-b border-dark-border pb-3">
          <h2 className="text-lg font-bold text-slate-100">Exam Question Volume Trend</h2>
          <p className="text-xs text-slate-400 mt-0.5">Total questions segmented per university examination year</p>
        </div>

        {trendData.length > 0 ? (
          <div className="pt-2">
            <TrendChart data={trendData} />
          </div>
        ) : (
          <p className="py-12 text-center text-xs text-slate-500">
            No question count trend available yet.
          </p>
        )}
      </div>

      {/* Student Progress Tracker */}
      {scoresData.length > 0 && (
        <div className="rounded-xl border border-dark-border bg-dark-card p-6 shadow-card space-y-4">
          <div className="border-b border-dark-border pb-4">
            <h2 className="text-lg font-bold text-slate-100">Personal Progress Tracker</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mark topics you have mastered, or flag weak topics to automatically receive higher weighting in the Study Planner.
            </p>
          </div>

          <div className="divide-y divide-dark-border max-h-96 overflow-y-auto pr-1">
            {scoresData.map((t) => {
              const currentStatus = progress[t.id] || "pending";
              return (
                <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 font-mono block">{t.unit}</span>
                    <span className="font-medium text-xs sm:text-sm text-slate-200">{t.name}</span>
                    <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-dark-surface border border-dark-border text-slate-300">
                      {t.score}% Priority
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateProgress(t.id, "done")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition ${
                        currentStatus === "done"
                          ? "bg-status-success text-dark-bg font-semibold"
                          : "border border-dark-border text-slate-300 hover:bg-dark-surface"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mastered</span>
                    </button>
                    <button
                      onClick={() => updateProgress(t.id, "weak")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition ${
                        currentStatus === "weak"
                          ? "bg-status-error text-dark-bg font-semibold"
                          : "border border-dark-border text-slate-300 hover:bg-dark-surface"
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Weak Area</span>
                    </button>
                    <button
                      onClick={() => updateProgress(t.id, "pending")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition ${
                        currentStatus === "pending"
                          ? "bg-dark-surface text-slate-100 border border-slate-500"
                          : "border border-dark-border text-slate-400 hover:bg-dark-surface"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>Pending</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
