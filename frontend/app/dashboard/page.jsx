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
  Activity,
  Flame,
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
      alert("Failed to update status: " + err.message);
    }
  }

  const currentSub = subjects.find((s) => s._id === selectedSubject);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header & Subject Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Curriculum Intelligence</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/50 text-blue-400 font-mono font-medium">
              LIVE NLP
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical topic distribution, credit weightage, and recurring exam patterns
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-md border border-slate-750 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 font-medium focus:border-blue-500 focus:outline-none shadow-flat font-mono"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} &mdash; {s.name} (Sem {s.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-rose-950/40 border border-rose-800/50 p-3 text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      {/* Module Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-panel flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Preparation Schedule</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">Study Timetable</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Greedy knapsack allocation biased toward high-frequency topics and weak areas.
            </p>
          </div>
          <Link
            href="/planner"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300"
          >
            <span>Configure Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-panel flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Paraphrase Clusters</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">PYQ Practice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              K-Means clusters of repeated questions across university exam sessions.
            </p>
          </div>
          <Link
            href="/practice"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
          >
            <span>Solve Question Sets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-panel flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Active Syllabus</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm truncate">
              {currentSub ? currentSub.name : "Curriculum"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentSub?.unitCount || 5} Units &bull; {scoresData.length} Quantified Topics
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
            <span>● Status: Ingested</span>
          </div>
        </div>
      </div>

      {/* Priority Heatmap */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-panel space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Topic Weightage Heatmap</h2>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Index = 0.4*Frequency + 0.3*Recency + 0.3*MarksWeight
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> High (≥66%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium (≥33%)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low (&lt;33%)
            </span>
          </div>
        </div>

        {loading ? (
          <p className="py-12 text-center text-xs text-slate-500 font-mono">Computing topic vectors...</p>
        ) : scoresData.length > 0 ? (
          <Heatmap topics={scoresData} />
        ) : (
          <p className="py-12 text-center text-xs text-slate-500">
            No papers processed yet for this subject. Ingest papers in the Admin console to view heatmap.
          </p>
        )}
      </div>

      {/* Volume Trend */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-panel space-y-3">
        <div className="border-b border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Examination Question Volume</h2>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">Segmented questions per academic year</p>
        </div>

        {trendData.length > 0 ? (
          <div className="pt-2">
            <TrendChart data={trendData} />
          </div>
        ) : (
          <p className="py-10 text-center text-xs text-slate-500 font-mono">
            No volume history available.
          </p>
        )}
      </div>

      {/* Progress Matrix */}
      {scoresData.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-panel space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Personal Mastery Tracker</h2>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Mark topics to boost priority weighting in the adaptive scheduler
            </p>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto pr-1">
            {scoresData.map((t) => {
              const currentStatus = progress[t.id] || "pending";
              return (
                <div key={t.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">{t.unit}</span>
                    <span className="font-medium text-xs text-slate-200">{t.name}</span>
                    <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {t.score}% Yield
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateProgress(t.id, "done")}
                      className={`px-2.5 py-1 text-[11px] rounded font-medium transition ${
                        currentStatus === "done"
                          ? "bg-emerald-600 text-white font-semibold"
                          : "border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      Mastered
                    </button>
                    <button
                      onClick={() => updateProgress(t.id, "weak")}
                      className={`px-2.5 py-1 text-[11px] rounded font-medium transition ${
                        currentStatus === "weak"
                          ? "bg-rose-600 text-white font-semibold"
                          : "border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      Weak Area
                    </button>
                    <button
                      onClick={() => updateProgress(t.id, "pending")}
                      className={`px-2.5 py-1 text-[11px] rounded font-medium transition ${
                        currentStatus === "pending"
                          ? "bg-slate-800 text-slate-200 border border-slate-700"
                          : "border border-slate-800 text-slate-500 hover:bg-slate-800"
                      }`}
                    >
                      Pending
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
