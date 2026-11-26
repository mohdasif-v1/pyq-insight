"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);

  // Form state
  const [form, setForm] = useState({
    subjectId: "",
    year: 2024,
    session: "Odd",
    totalMarks: 100,
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState("");
  const [queueLoading, setQueueLoading] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !rawUser) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(rawUser);
    setUser(parsed);
    if (parsed.role !== "admin") {
      alert("Access denied: Admin role required");
      router.push("/dashboard");
      return;
    }

    // Load subjects
    api("/subjects")
      .then((subs) => {
        setSubjects(subs);
        if (subs.length > 0) {
          setForm((prev) => ({ ...prev, subjectId: subs[0]._id }));
          loadTopics(subs[0]._id);
        }
      })
      .catch((err) => setError(err.message));

    loadReviewQueue();
  }, [router]);

  function loadTopics(subId) {
    if (!subId) return;
    api(`/subjects/${subId}/topics`)
      .then((t) => setTopics(t))
      .catch(() => {});
  }

  function loadReviewQueue() {
    setQueueLoading(true);
    api("/review/queue")
      .then((q) => setReviewQueue(q))
      .catch((err) => setError(err.message))
      .finally(() => setQueueLoading(false));
  }

  function handleSubjectChange(subId) {
    setForm((prev) => ({ ...prev, subjectId: subId }));
    loadTopics(subId);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      alert("Please select a PDF paper file");
      return;
    }
    setError("");
    setUploadResult(null);
    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("paper", file);
      data.append("subjectId", form.subjectId);
      data.append("year", form.year);
      data.append("session", form.session);
      data.append("totalMarks", form.totalMarks);

      const res = await fetch("http://localhost:5000/api/papers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      setUploadResult(result);
      loadReviewQueue();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function assignTopic(questionId, topicId) {
    try {
      await api(`/review/${questionId}`, {
        method: "PATCH",
        body: { topicId },
      });
      setReviewQueue((prev) => prev.filter((q) => q._id !== questionId));
    } catch (err) {
      alert("Failed to assign topic: " + err.message);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs rounded bg-purple-100 text-purple-800 font-bold uppercase">
            Admin Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Paper Ingestion &amp; Review Queue</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Upload PDF previous year papers, run automated question extraction &amp; topic classification, and review low-confidence questions.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Paper Upload Form */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-3">1. Upload Question Paper</h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-medium focus:outline-indigo-500"
                value={form.subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                required
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.code ? `${s.code} - ` : ""}{s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Year</label>
              <input
                type="number"
                min="2015"
                max="2030"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-indigo-500"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Session</label>
              <select
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-indigo-500"
                value={form.session}
                onChange={(e) => setForm({ ...form, session: e.target.value })}
              >
                <option value="Odd">Odd (Sem V)</option>
                <option value="Even">Even (Sem VI)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks</label>
              <select
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-indigo-500"
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
              >
                <option value={100}>100 Marks (Old Scheme)</option>
                <option value={70}>70 Marks (New NEP Scheme)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paper PDF File</label>
            <input
              type="file"
              accept="application/pdf"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <button
            disabled={uploading}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
          >
            {uploading ? "Ingesting & Classifying Paper..." : "Ingest & Process Paper"}
          </button>
        </form>

        {uploadResult && (
          <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-sm text-emerald-800 space-y-1">
            <p className="font-bold">✓ Paper Processed Successfully!</p>
            <p>Paper ID: <code className="text-xs bg-emerald-100 px-1 py-0.5 rounded">{uploadResult.paperId}</code></p>
            <p>Extracted and classified <strong>{uploadResult.questions}</strong> examination questions.</p>
          </div>
        )}
      </div>

      {/* Review Queue */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">2. Review Queue (Low-Confidence Questions)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Questions whose cosine similarity score fell below threshold &lt; 0.15 requiring human verification.
            </p>
          </div>
          <button
            onClick={loadReviewQueue}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Refresh Queue ({reviewQueue.length})
          </button>
        </div>

        {queueLoading ? (
          <p className="text-center py-8 text-sm text-slate-500">Loading queue items...</p>
        ) : reviewQueue.length > 0 ? (
          <div className="divide-y">
            {reviewQueue.map((q) => (
              <div key={q._id} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        Confidence: {Math.round((q.confidence || 0) * 100)}%
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {q.marks} Marks
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 font-medium pt-1">{q.text}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      id={`sel-${q._id}`}
                      className="rounded border border-slate-300 p-1.5 text-xs focus:outline-indigo-500"
                      defaultValue=""
                    >
                      <option value="" disabled>Assign Topic...</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.unitTitle || t.unit})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        const sel = document.getElementById(`sel-${q._id}`);
                        if (sel && sel.value) assignTopic(q._id, sel.value);
                        else alert("Select a topic first");
                      }}
                      className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 text-sm">
            ✓ No low-confidence questions waiting in review queue!
          </div>
        )}
      </div>
    </main>
  );
}
