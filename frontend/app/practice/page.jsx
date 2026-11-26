"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Practice Mode</h1>
          <p className="text-sm text-slate-500 mt-1">
            Repeated &amp; paraphrased question clusters grouped by K-Means similarity across examination years.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium shadow-sm focus:border-indigo-500 focus:outline-none"
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
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading repeated question clusters...</p>
      ) : clusters.length > 0 ? (
        <div className="space-y-6">
          {clusters.map((c) => {
            const status = clusterStatus[c.clusterId] || "pending";
            const sampleTopicId = c.questions[0]?.topicId;

            return (
              <div
                key={c.clusterId}
                className="rounded-xl border bg-white p-6 shadow-sm space-y-4 hover:border-indigo-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 text-xs font-bold">
                      Cluster #{c.clusterId}
                    </span>
                    <h3 className="font-semibold text-slate-900 text-base">
                      {c.topicName}
                    </h3>
                    <span className="text-xs text-slate-500">
                      ({c.count} recurring occurrences)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markCluster(c.clusterId, "done", sampleTopicId)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                        status === "done"
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Mastered ✓
                    </button>
                    <button
                      onClick={() => markCluster(c.clusterId, "weak", sampleTopicId)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                        status === "weak"
                          ? "bg-rose-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Needs Practice ⚠
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {c.questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-sm"
                    >
                      <p className="text-slate-800 leading-relaxed">{q.text}</p>
                      <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                        <span className="px-2 py-0.5 rounded bg-white border text-slate-600">
                          {q.year} {q.session}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
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
        <div className="text-center py-16 rounded-xl border border-dashed bg-white p-8">
          <p className="text-slate-600 font-medium">No repeated question clusters found for this subject yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Upload question papers in the Admin portal to automatically run TF-IDF K-Means clustering.
          </p>
        </div>
      )}
    </main>
  );
}
