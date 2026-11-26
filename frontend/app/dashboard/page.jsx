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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <span>Curriculum Intelligence</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-royal text-indigo-lavender font-mono font-medium">
              AKTU
            </span>
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Statistical topic frequency, unit weightage, and recurring examination patterns
          </p>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted font-medium">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded border border-app-border bg-app-surface px-3 py-1.5 text-xs text-text-primary focus:border-indigo-lavender focus:outline-none transition font-mono"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.code || "Sem " + s.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-xs text-text-muted">Loading curriculum analytics...</div>
      ) : (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded border border-app-border bg-app-surface">
              <span className="text-[11px] font-mono text-text-muted uppercase">Subject Code</span>
              <p className="text-lg font-semibold text-text-primary font-mono mt-0.5">{currentSub?.code || "KCS501"}</p>
              <p className="text-xs text-text-secondary mt-1">Semester {currentSub?.semester || 5} Examination Curriculum</p>
            </div>

            <div className="p-4 rounded border border-app-border bg-app-surface">
              <span className="text-[11px] font-mono text-text-muted uppercase">Indexed Topics</span>
              <p className="text-lg font-semibold text-text-primary font-mono mt-0.5">{scoresData.length}</p>
              <p className="text-xs text-text-secondary mt-1">Categorized into 5 syllabus modules</p>
            </div>

            <div className="p-4 rounded border border-app-border bg-app-surface flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-text-muted uppercase">Structured Actions</span>
                <p className="text-xs text-text-secondary mt-1">Generate dynamic timetable or solve clustered questions</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Link
                  href="/planner"
                  className="inline-flex items-center gap-1 text-xs text-indigo-lavender hover:underline font-medium"
                >
                  <span>Open Planner</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="text-text-muted">&bull;</span>
                <Link
                  href="/practice"
                  className="inline-flex items-center gap-1 text-xs text-indigo-lavender hover:underline font-medium"
                >
                  <span>Practice PYQs</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Section: Topic Importance Matrix */}
          <div className="border border-app-border rounded bg-app-surface p-5 space-y-4">
            <div className="border-b border-app-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Topic Frequency &amp; Priority Heatmap</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  NLP scoring calculated across past exam papers using TF-IDF term density and repetition recency.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> High</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Medium</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Low</span>
              </div>
            </div>

            {scoresData.length > 0 ? (
              <Heatmap topics={scoresData} />
            ) : (
              <div className="text-center py-10 text-xs text-text-muted">
                No topic scores computed for this subject yet. Upload past papers in Admin Console to index questions.
              </div>
            )}
          </div>

          {/* Section: Historical Volume Trends */}
          <div className="border border-app-border rounded bg-app-surface p-5 space-y-4">
            <div className="border-b border-app-border pb-3">
              <h2 className="text-sm font-semibold text-text-primary">Historical Exam Paper Trend</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Total examination questions segmented and processed per academic session.
              </p>
            </div>

            <TrendChart data={trendData} />
          </div>

          {/* Section: Progress Checklist */}
          {scoresData.length > 0 && (
            <div className="border border-app-border rounded bg-app-surface p-5 space-y-4">
              <div className="border-b border-app-border pb-3">
                <h2 className="text-sm font-semibold text-text-primary">Revision Status &amp; Mastery Tracker</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Mark syllabus topics as mastered or flagged for additional revision before the semester exam.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-app-border text-[11px] font-mono text-text-muted bg-app-surface">
                    <tr>
                      <th className="px-3 py-2 font-normal">Topic</th>
                      <th className="px-3 py-2 font-normal">Unit</th>
                      <th className="px-3 py-2 font-normal">Priority Score</th>
                      <th className="px-3 py-2 font-normal text-right">Mastery Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-border text-text-secondary">
                    {scoresData.slice(0, 10).map((t) => {
                      const isMastered = progress[t.id] === "mastered";
                      return (
                        <tr key={t.id} className="hover:bg-app-elevated/40 transition">
                          <td className="px-3 py-2.5 font-medium text-text-primary">{t.name}</td>
                          <td className="px-3 py-2.5 font-mono text-text-muted">{t.unit}</td>
                          <td className="px-3 py-2.5 font-mono">{t.score}%</td>
                          <td className="px-3 py-2.5 text-right">
                            <button
                              onClick={() => updateProgress(t.id, isMastered ? "pending" : "mastered")}
                              className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                                isMastered
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-app-elevated text-text-secondary hover:text-text-primary border border-app-border"
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
