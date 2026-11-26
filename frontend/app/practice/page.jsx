"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Check, AlertTriangle, Layers, Calendar, Award } from "lucide-react";

export default function PracticePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [clusters, setClusters] = useState([]);
  const [clusterStatus, setClusterStatus] = useState({});
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

    api(`/practice/${selectedSubject}`)
      .then((data) => setClusters(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedSubject]);

  function markCluster(clusterId, status, topicId) {
    setClusterStatus((prev) => ({ ...prev, [clusterId]: status }));
    if (topicId) {
      api(`/progress/${topicId}`, { method: "PUT", body: { status } }).catch(() => {});
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">PYQ Practice Clusters</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Paraphrased question variations grouped via TF-IDF K-Means clustering across university exam sessions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-md border border-slate-750 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 font-medium focus:border-blue-500 focus:outline-none font-mono"
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
        <div className="rounded-md bg-rose-950/40 border border-rose-800/50 p-3 text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center text-xs text-slate-500 font-mono">Loading K-Means question clusters...</p>
      ) : clusters.length > 0 ? (
        <div className="space-y-4">
          {clusters.map((c) => {
            const status = clusterStatus[c.clusterId] || "pending";
            const sampleTopicId = c.questions[0]?.topicId;

            return (
              <div
                key={c.clusterId}
                className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-panel space-y-3.5 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/50 text-blue-400 text-[11px] font-mono font-bold">
                      CLUSTER #{c.clusterId}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-100 text-xs sm:text-sm">{c.topicName}</h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {c.count} recurring questions detected
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => markCluster(c.clusterId, "done", sampleTopicId)}
                      className={`px-2.5 py-1 text-[11px] rounded font-medium transition ${
                        status === "done"
                          ? "bg-emerald-600 text-white font-semibold"
                          : "border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      Mastered
                    </button>
                    <button
                      onClick={() => markCluster(c.clusterId, "weak", sampleTopicId)}
                      className={`px-2.5 py-1 text-[11px] rounded font-medium transition ${
                        status === "weak"
                          ? "bg-rose-600 text-white font-semibold"
                          : "border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      Needs Practice
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {c.questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-3 rounded-md bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 text-xs leading-relaxed"
                    >
                      <p className="text-slate-200 font-normal">{q.text}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px]">
                          {q.year} {q.session}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/50 text-blue-400 font-mono text-[10px]">
                          {q.marks} Marks
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-slate-800 bg-slate-900/50 p-8 space-y-1.5 font-mono">
          <p className="text-slate-300 font-medium text-xs">No question clusters computed for this subject.</p>
          <p className="text-[11px] text-slate-500">
            Upload exam papers in the Admin console to run K-Means vector clustering.
          </p>
        </div>
      )}
    </main>
  );
}
