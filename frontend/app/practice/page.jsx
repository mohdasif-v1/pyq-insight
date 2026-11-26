"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { CheckCircle2, AlertTriangle, Layers, Calendar, Award } from "lucide-react";

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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">Practice Mode</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Repeated &amp; paraphrased question clusters grouped by K-Means similarity across university examination papers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-400 whitespace-nowrap">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-dark-border bg-dark-card px-3 py-2 text-xs sm:text-sm text-slate-200 font-medium shadow-subtle focus:border-brand-primary focus:outline-none"
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
        <div className="rounded-lg bg-status-error/10 border border-status-error/25 p-4 text-xs sm:text-sm text-status-error font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center text-xs text-slate-500">Loading repeated question clusters...</p>
      ) : clusters.length > 0 ? (
        <div className="space-y-6">
          {clusters.map((c) => {
            const status = clusterStatus[c.clusterId] || "pending";
            const sampleTopicId = c.questions[0]?.topicId;

            return (
              <div
                key={c.clusterId}
                className="rounded-xl border border-dark-border bg-dark-card p-6 shadow-card space-y-4 hover:border-slate-500/50 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-dark-surface border border-dark-border text-brand-primary text-xs font-bold font-mono">
                      Cluster #{c.clusterId}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm">{c.topicName}</h3>
                      <span className="text-[11px] text-slate-500">
                        {c.count} recurring occurrences identified
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markCluster(c.clusterId, "done", sampleTopicId)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md font-medium transition ${
                        status === "done"
                          ? "bg-status-success text-dark-bg font-semibold"
                          : "border border-dark-border text-slate-300 hover:bg-dark-surface"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mastered</span>
                    </button>
                    <button
                      onClick={() => markCluster(c.clusterId, "weak", sampleTopicId)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md font-medium transition ${
                        status === "weak"
                          ? "bg-status-error text-dark-bg font-semibold"
                          : "border border-dark-border text-slate-300 hover:bg-dark-surface"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Needs Practice</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {c.questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-3.5 rounded-lg bg-dark-surface border border-dark-border flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs leading-relaxed"
                    >
                      <p className="text-slate-200">{q.text}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-dark-card border border-dark-border text-slate-400 font-mono text-[10px]">
                          {q.year} {q.session}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-semibold text-[10px]">
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
        <div className="text-center py-16 rounded-xl border border-dark-border bg-dark-card p-8 space-y-2">
          <p className="text-slate-300 font-medium text-sm">No repeated question clusters found for this subject yet.</p>
          <p className="text-xs text-slate-500">
            Upload examination papers in the Admin portal to automatically run TF-IDF K-Means clustering.
          </p>
        </div>
      )}
    </main>
  );
}
