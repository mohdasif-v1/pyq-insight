"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import Heatmap from "@/components/Heatmap";
import TrendChart from "@/components/TrendChart";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            AKTU Question Paper Insights &amp; Exam Weightage Analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium shadow-sm focus:border-indigo-500 focus:outline-none"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code ? `${s.code} - ` : ""}{s.name} (Sem {s.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Adaptive Planner</h3>
            <p className="text-xs text-slate-500 mt-1">
              Generate a personalized study timetable with weak topic weighting.
            </p>
          </div>
          <Link
            href="/planner"
            className="mt-4 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Open Planner &rarr;
          </Link>
        </div>

        <div className="p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Practice Mode</h3>
            <p className="text-xs text-slate-500 mt-1">
              Solve repeated question clusters identified across multiple exam sessions.
            </p>
          </div>
          <Link
            href="/practice"
            className="mt-4 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Open Practice &rarr;
          </Link>
        </div>

        <div className="p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Selected Subject Info</h3>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {currentSub ? `${currentSub.name} [Code: ${currentSub.code || "N/A"}]` : "No Subject Selected"}
            </p>
          </div>
          <span className="mt-4 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded w-fit font-medium">
            5 Units Configured
          </span>
        </div>
      </div>

      {/* Topic Importance Heatmap */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Topic Priority Heatmap</h2>
            <p className="text-xs text-slate-500">
              Score = 0.4*Frequency + 0.3*Recency + 0.3*MarksWeight (High &ge; 66, Medium &ge; 33, Low &lt; 33)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500"></span> High Priority</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-300"></span> Medium</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-200"></span> Low</span>
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading topic analytics...</p>
        ) : scoresData.length > 0 ? (
          <Heatmap topics={scoresData} />
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            No papers processed yet for this subject. Upload papers in the Admin dashboard to view priority heatmap.
          </p>
        )}
      </div>

      {/* Annual Question Trend Chart */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Exam Question Volume Trend</h2>
          <p className="text-xs text-slate-500">Total questions asked per examination year</p>
        </div>

        {trendData.length > 0 ? (
          <div className="pt-2">
            <TrendChart data={trendData} />
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            No question count trend available yet.
          </p>
        )}
      </div>

      {/* Student Progress Tracker */}
      {scoresData.length > 0 && (
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-slate-900">Personal Progress Tracker</h2>
            <p className="text-xs text-slate-500">
              Mark topics you feel confident with, or weak topics to prioritize in the Study Planner.
            </p>
          </div>

          <div className="divide-y max-h-96 overflow-y-auto">
            {scoresData.map((t) => {
              const currentStatus = progress[t.id] || "pending";
              return (
                <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-400 block">{t.unit}</span>
                    <span className="font-medium text-sm text-slate-800">{t.name}</span>
                    <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {t.score}% Priority
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateProgress(t.id, "done")}
                      className={`px-3 py-1 text-xs rounded font-medium transition ${
                        currentStatus === "done"
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Done ✓
                    </button>
                    <button
                      onClick={() => updateProgress(t.id, "weak")}
                      className={`px-3 py-1 text-xs rounded font-medium transition ${
                        currentStatus === "weak"
                          ? "bg-rose-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Weak ⚠
                    </button>
                    <button
                      onClick={() => updateProgress(t.id, "pending")}
                      className={`px-3 py-1 text-xs rounded font-medium transition ${
                        currentStatus === "pending"
                          ? "bg-slate-800 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
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
