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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">PYQ Practice Clusters</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Paraphrased question variations grouped via TF-IDF K-Means clustering across university exam sessions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-text-muted uppercase">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded border border-app-border bg-app-surface px-3 py-1.5 text-xs text-text-primary focus:border-indigo-lavender focus:outline-none font-mono"
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
        <div className="text-center py-16 text-xs text-text-muted">Loading question clusters...</div>
      ) : clusters.length === 0 ? (
        <div className="text-center py-12 text-xs text-text-muted">
          No question clusters formed for this subject yet. Ingest question papers through the Admin Console to compute embeddings.
        </div>
      ) : (
        <div className="space-y-4">
          {clusters.map((c, idx) => {
            const isResolved = clusterStatus[c.clusterId || idx] === "mastered";
            return (
              <div
                key={c.clusterId || idx}
                className="rounded border border-app-border bg-app-surface p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-app-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-royal text-indigo-lavender">
                      Cluster {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-text-primary">{c.topicName || "Core Topic"}</span>
                    <span className="text-[10px] text-text-muted font-mono">({c.questions?.length || 0} variations)</span>
                  </div>

                  <button
                    onClick={() => markCluster(c.clusterId || idx, isResolved ? "pending" : "mastered", c.topicId)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition self-start sm:self-auto ${
                      isResolved
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-app-elevated text-text-secondary hover:text-text-primary border border-app-border"
                    }`}
                  >
                    {isResolved ? "Cluster Practiced" : "Mark as Practiced"}
                  </button>
                </div>

                <div className="space-y-2">
                  {c.questions?.map((q, qIdx) => (
                    <div
                      key={q._id || qIdx}
                      className="p-3 rounded border border-app-border bg-app-elevated/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                        <span>{q.paperYear ? `${q.paperYear} ${q.paperSession || "Odd"} Semester` : `Question ${qIdx + 1}`}</span>
                        <span className="text-indigo-lavender font-semibold">{q.marks || 10} Marks</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed font-normal">{q.text}</p>
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
