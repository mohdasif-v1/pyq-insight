"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Check, Layers, ArrowRight } from "lucide-react";

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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">PYQ Practice Clusters</h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Paraphrased question variations grouped via TF-IDF K-Means clustering across university exam sessions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="text-xs font-mono text-ink-muted uppercase">Subject:</label>
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
          Computing question cluster vectors...
        </div>
      ) : clusters.length === 0 ? (
        <div className="text-center py-16 text-xs text-ink-muted glass-panel rounded-2xl">
          No question clusters formed for this subject yet. Ingest question papers through the Admin Console to compute embeddings.
        </div>
      ) : (
        <div className="space-y-6">
          {clusters.map((c, idx) => {
            const isResolved = clusterStatus[c.clusterId || idx] === "mastered";
            return (
              <div
                key={c.clusterId || idx}
                className="glass-panel rounded-2xl p-6 sm:p-7 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-canvas-border pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-brand-royal border border-brand-lavender/30 text-brand-lavender">
                      Cluster {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-white">{c.topicName || "Core Topic"}</span>
                    <span className="text-[11px] text-ink-muted font-mono">({c.questions?.length || 0} variations)</span>
                  </div>

                  <button
                    onClick={() => markCluster(c.clusterId || idx, isResolved ? "pending" : "mastered", c.topicId)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition self-start sm:self-auto ${
                      isResolved
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-brand-royal/60 text-brand-lavender hover:bg-brand-royal border border-brand-lavender/30"
                    }`}
                  >
                    {isResolved ? "Cluster Practiced" : "Mark as Practiced"}
                  </button>
                </div>

                <div className="space-y-3">
                  {c.questions?.map((q, qIdx) => (
                    <div
                      key={q._id || qIdx}
                      className="p-4 rounded-xl border border-canvas-border bg-canvas-elevated/40 space-y-2 hover:bg-canvas-elevated/70 transition"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
                        <span>{q.paperYear ? `${q.paperYear} ${q.paperSession || "Odd"} Semester` : `Question ${qIdx + 1}`}</span>
                        <span className="text-brand-lavender font-bold">{q.marks || 10} Marks</span>
                      </div>
                      <p className="text-xs text-ink-secondary leading-relaxed font-normal">{q.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
