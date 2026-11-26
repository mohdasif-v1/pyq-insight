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

  // Paper Upload Form State
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

  // ==========================================
  // SYLLABUS MANAGEMENT STATE
  // ==========================================
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitTopics, setUnitTopics] = useState([]);
  const [unitTopicsLoading, setUnitTopicsLoading] = useState(false);

  // Feedback notifications
  const [syllabusFeedback, setSyllabusFeedback] = useState({ type: "", message: "" });

  // Modal / Form States
  // Subject Modal: mode "create" or "edit", data: { _id, code, name, semester }
  const [subjectModal, setSubjectModal] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ code: "", name: "", semester: 5 });
  const [subjectSubmitting, setSubjectSubmitting] = useState(false);

  // Unit Modal: mode "create" or "edit", data: { _id, unitNo, title }
  const [unitModal, setUnitModal] = useState(null);
  const [unitForm, setUnitForm] = useState({ unitNo: 1, title: "" });
  const [unitSubmitting, setUnitSubmitting] = useState(false);

  // Topic Modal: mode "create" or "edit", data: { _id, name, keywords }
  const [topicModal, setTopicModal] = useState(null);
  const [topicForm, setTopicForm] = useState({ name: "", keywords: "" });
  const [topicSubmitting, setTopicSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'subject'|'unit'|'topic', item: object }
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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

    loadSubjects();
    loadReviewQueue();
  }, [router]);

  function showFeedback(type, message) {
    setSyllabusFeedback({ type, message });
    setTimeout(() => setSyllabusFeedback({ type: "", message: "" }), 6000);
  }

  function loadSubjects(preferredSelectedId = null) {
    api("/subjects")
      .then((subs) => {
        setSubjects(subs);
        if (subs.length > 0) {
          // Keep current form subject or initialize
          setForm((prev) => {
            const exists = subs.find((s) => s._id === prev.subjectId);
            const newSubId = preferredSelectedId || (exists ? prev.subjectId : subs[0]._id);
            loadTopics(newSubId);
            return { ...prev, subjectId: newSubId };
          });

          // Sync syllabus management selected subject
          setSelectedSubject((prev) => {
            if (preferredSelectedId) {
              const matched = subs.find((s) => s._id === preferredSelectedId);
              if (matched) {
                loadUnits(matched._id);
                return matched;
              }
            }
            if (prev) {
              const updated = subs.find((s) => s._id === prev._id);
              if (updated) return updated;
            }
            return prev;
          });
        }
      })
      .catch((err) => setError(err.message));
  }

  function loadTopics(subId) {
    if (!subId) return;
    api(`/subjects/${subId}/topics`)
      .then((t) => setTopics(t))
      .catch(() => {});
  }

  function loadUnits(subId, preferredUnitId = null) {
    if (!subId) {
      setUnits([]);
      return;
    }
    setUnitsLoading(true);
    api(`/subjects/${subId}/units`)
      .then((u) => {
        setUnits(u);
        if (preferredUnitId) {
          const matched = u.find((item) => item._id === preferredUnitId);
          if (matched) {
            setSelectedUnit(matched);
            loadUnitTopics(matched._id);
          }
        } else if (selectedUnit) {
          const updated = u.find((item) => item._id === selectedUnit._id);
          if (updated) setSelectedUnit(updated);
        }
      })
      .catch((err) => showFeedback("error", `Failed to load units: ${err.message}`))
      .finally(() => setUnitsLoading(false));
  }

  function loadUnitTopics(unitId) {
    if (!unitId) {
      setUnitTopics([]);
      return;
    }
    setUnitTopicsLoading(true);
    api(`/subjects/units/${unitId}/topics`)
      .then((t) => setUnitTopics(t))
      .catch((err) => showFeedback("error", `Failed to load topics: ${err.message}`))
      .finally(() => setUnitTopicsLoading(false));
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

  // ==========================================
  // PAPER INGESTION & REVIEW QUEUE
  // ==========================================
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

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE}/papers`, {
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
      // Reload topics and counts
      loadTopics(form.subjectId);
      loadSubjects();
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
        body: { topicId, verifiedTopic: "Assigned by Admin", action: "approve" },
      });
      loadReviewQueue();
      alert("Topic assigned and verified successfully!");
    } catch (err) {
      alert(err.message);
    }
  }

  // ==========================================
  // SUBJECT CRUD HANDLERS
  // ==========================================
  function openAddSubject() {
    setSubjectForm({ code: "", name: "", semester: 5 });
    setSubjectModal({ mode: "create" });
  }

  function openEditSubject(sub) {
    setSubjectForm({ code: sub.code, name: sub.name, semester: sub.semester });
    setSubjectModal({ mode: "edit", sub });
  }

  async function handleSubjectSubmit(e) {
    e.preventDefault();
    setSubjectSubmitting(true);
    try {
      if (subjectModal.mode === "create") {
        const created = await api("/subjects", {
          method: "POST",
          body: subjectForm,
        });
        showFeedback("success", `Subject '${created.name}' (${created.code}) created successfully.`);
        loadSubjects(created._id);
        setSelectedSubject(created);
        loadUnits(created._id);
      } else {
        const updated = await api(`/subjects/${subjectModal.sub._id}`, {
          method: "PATCH",
          body: subjectForm,
        });
        showFeedback("success", `Subject '${updated.name}' updated successfully.`);
        loadSubjects(updated._id);
        if (selectedSubject && selectedSubject._id === updated._id) {
          setSelectedSubject((prev) => ({ ...prev, ...updated }));
        }
      }
      setSubjectModal(null);
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setSubjectSubmitting(false);
    }
  }

  // ==========================================
  // UNIT CRUD HANDLERS
  // ==========================================
  function openAddUnit() {
    const nextUnitNo = units.length > 0 ? Math.max(...units.map((u) => u.unitNo || 0)) + 1 : 1;
    setUnitForm({ unitNo: nextUnitNo, title: "" });
    setUnitModal({ mode: "create" });
  }

  function openEditUnit(unit) {
    setUnitForm({ unitNo: unit.unitNo, title: unit.title });
    setUnitModal({ mode: "edit", unit });
  }

  async function handleUnitSubmit(e) {
    e.preventDefault();
    if (!selectedSubject) return;
    setUnitSubmitting(true);
    try {
      if (unitModal.mode === "create") {
        const created = await api(`/subjects/${selectedSubject._id}/units`, {
          method: "POST",
          body: unitForm,
        });
        showFeedback("success", `Unit ${created.unitNo}: '${created.title}' added successfully.`);
        loadUnits(selectedSubject._id, created._id);
        loadSubjects();
        loadTopics(selectedSubject._id);
      } else {
        const updated = await api(`/subjects/units/${unitModal.unit._id}`, {
          method: "PATCH",
          body: unitForm,
        });
        showFeedback("success", `Unit ${updated.unitNo} updated successfully.`);
        loadUnits(selectedSubject._id, updated._id);
        loadTopics(selectedSubject._id);
      }
      setUnitModal(null);
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setUnitSubmitting(false);
    }
  }

  // ==========================================
  // TOPIC CRUD HANDLERS
  // ==========================================
  function openAddTopic() {
    setTopicForm({ name: "", keywords: "" });
    setTopicModal({ mode: "create" });
  }

  function openEditTopic(topic) {
    const kwString = Array.isArray(topic.keywords) ? topic.keywords.join(", ") : "";
    setTopicForm({ name: topic.name, keywords: kwString });
    setTopicModal({ mode: "edit", topic });
  }

  async function handleTopicSubmit(e) {
    e.preventDefault();
    if (!selectedUnit) return;
    setTopicSubmitting(true);
    try {
      const kwArray = topicForm.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      if (topicModal.mode === "create") {
        const created = await api(`/subjects/units/${selectedUnit._id}/topics`, {
          method: "POST",
          body: { name: topicForm.name, keywords: kwArray },
        });
        showFeedback("success", `Topic '${created.name}' added with ${created.keywords.length} keyword(s).`);
        loadUnitTopics(selectedUnit._id);
        if (selectedSubject) {
          loadUnits(selectedSubject._id);
          loadTopics(selectedSubject._id);
          loadSubjects();
        }
      } else {
        const updated = await api(`/subjects/topics/${topicModal.topic._id}`, {
          method: "PATCH",
          body: { name: topicForm.name, keywords: kwArray },
        });
        showFeedback("success", `Topic '${updated.name}' updated successfully.`);
        loadUnitTopics(selectedUnit._id);
        if (selectedSubject) {
          loadTopics(selectedSubject._id);
        }
      }
      setTopicModal(null);
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setTopicSubmitting(false);
    }
  }

  // ==========================================
  // DELETE HANDLERS (WITH SAFEGUARDS)
  // ==========================================
  async function confirmDelete() {
    if (!deleteConfirm) return;
    setDeleteSubmitting(true);
    try {
      const { type, item } = deleteConfirm;
      if (type === "subject") {
        await api(`/subjects/${item._id}`, { method: "DELETE" });
        showFeedback("success", `Subject '${item.name}' deleted.`);
        if (selectedSubject && selectedSubject._id === item._id) {
          setSelectedSubject(null);
          setUnits([]);
          setSelectedUnit(null);
          setUnitTopics([]);
        }
        loadSubjects();
      } else if (type === "unit") {
        await api(`/subjects/units/${item._id}`, { method: "DELETE" });
        showFeedback("success", `Unit ${item.unitNo} deleted.`);
        if (selectedUnit && selectedUnit._id === item._id) {
          setSelectedUnit(null);
          setUnitTopics([]);
        }
        if (selectedSubject) {
          loadUnits(selectedSubject._id);
          loadSubjects();
          loadTopics(selectedSubject._id);
        }
      } else if (type === "topic") {
        await api(`/subjects/topics/${item._id}`, { method: "DELETE" });
        showFeedback("success", `Topic '${item.name}' deleted.`);
        if (selectedUnit) {
          loadUnitTopics(selectedUnit._id);
        }
        if (selectedSubject) {
          loadUnits(selectedSubject._id);
          loadSubjects();
          loadTopics(selectedSubject._id);
        }
      }
      setDeleteConfirm(null);
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage academic curriculum, ingest examination papers, run NLP extraction, and review low-confidence question mappings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold px-3 py-1.5 rounded-full">
            Role: Administrator
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 border border-rose-200 text-sm text-rose-800 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-700 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Section 1: Paper Ingestion */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        <div className="border-b pb-3">
          <h2 className="text-xl font-bold text-slate-900">1. Upload Previous-Year Question Paper</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            PDFs are processed by Python NLP microservice (pdfplumber text extraction + OCR fallback + TF-IDF topic mapping).
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Subject</label>
              <select
                value={form.subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-indigo-500 bg-white"
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code}) - Sem {s.semester}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Examination Year</label>
              <input
                type="number"
                min={2015}
                max={2030}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) })}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Session</label>
              <select
                value={form.session}
                onChange={(e) => setForm({ ...form, session: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-indigo-500 bg-white"
              >
                <option value="Odd">Odd Semester</option>
                <option value="Even">Even Semester</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Marks</label>
              <select
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value, 10) })}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-indigo-500 bg-white"
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

      {/* Section 2: Review Queue */}
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
                        <option key={t.id || t._id} value={t.id || t._id}>
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

      {/* Section 3: Subject & Syllabus Management */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">3. Subject &amp; Syllabus Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create and manage subjects, units, and NLP syllabus topics with associated keyword profiles.
            </p>
          </div>
          <button
            onClick={openAddSubject}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>+</span> Add New Subject
          </button>
        </div>

        {/* Feedback Alert */}
        {syllabusFeedback.message && (
          <div
            className={`rounded-lg p-3.5 border text-xs font-medium flex justify-between items-center ${
              syllabusFeedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <span>{syllabusFeedback.message}</span>
            <button
              onClick={() => setSyllabusFeedback({ type: "", message: "" })}
              className="font-bold hover:opacity-75 ml-3"
            >
              ✕
            </button>
          </div>
        )}

        {/* 3-Column Hierarchy Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column A: Subjects */}
          <div className="lg:col-span-4 border rounded-xl p-4 bg-slate-50/60 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>📚</span> Subjects ({subjects.length})
              </h3>
              <span className="text-[11px] text-slate-400">Click to select</span>
            </div>

            {subjects.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No subjects created yet.</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {subjects.map((sub) => {
                  const isSelected = selectedSubject && selectedSubject._id === sub._id;
                  return (
                    <div
                      key={sub._id}
                      onClick={() => {
                        setSelectedSubject(sub);
                        loadUnits(sub._id);
                        setSelectedUnit(null);
                        setUnitTopics([]);
                      }}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-300 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{sub.code}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                              Sem {sub.semester}
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium text-xs mt-0.5">{sub.name}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="Edit Subject"
                            onClick={() => openEditSubject(sub)}
                            className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 text-xs"
                          >
                            ✏️
                          </button>
                          <button
                            title="Delete Subject"
                            onClick={() => setDeleteConfirm({ type: "subject", item: sub })}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                        <span>Units: <strong className="text-slate-700">{sub.unitCount || 0}</strong></span>
                        <span>Topics: <strong className="text-slate-700">{sub.topicCount || 0}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column B: Units */}
          <div className="lg:col-span-4 border rounded-xl p-4 bg-slate-50/60 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span>📑</span> Units {selectedSubject ? `(${units.length})` : ""}
                </h3>
                {selectedSubject && (
                  <p className="text-[11px] text-indigo-600 font-semibold truncate max-w-[200px]">
                    {selectedSubject.code}: {selectedSubject.name}
                  </p>
                )}
              </div>
              {selectedSubject && (
                <button
                  onClick={openAddUnit}
                  className="rounded bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700 transition"
                >
                  + Add Unit
                </button>
              )}
            </div>

            {!selectedSubject ? (
              <div className="text-center py-12 text-xs text-slate-400">
                ← Select a subject from the left column to view its units.
              </div>
            ) : unitsLoading ? (
              <p className="text-xs text-slate-500 text-center py-6">Loading units...</p>
            ) : units.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 space-y-2">
                <p>No units found for this subject.</p>
                <button
                  onClick={openAddUnit}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  + Add Unit 1 now
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {units.map((unit) => {
                  const isSelected = selectedUnit && selectedUnit._id === unit._id;
                  return (
                    <div
                      key={unit._id}
                      onClick={() => {
                        setSelectedUnit(unit);
                        loadUnitTopics(unit._id);
                      }}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-300 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            Unit {unit.unitNo}
                          </span>
                          <p className="text-slate-800 font-semibold text-xs mt-1 leading-snug">{unit.title}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="Edit Unit"
                            onClick={() => openEditUnit(unit)}
                            className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 text-xs"
                          >
                            ✏️
                          </button>
                          <button
                            title="Delete Unit"
                            onClick={() => setDeleteConfirm({ type: "unit", item: unit })}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                        <span>Topics in Unit: <strong className="text-slate-700">{unit.topicCount || 0}</strong></span>
                        <span className="text-indigo-600 font-medium">Manage Topics →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column C: Topics & Keywords */}
          <div className="lg:col-span-4 border rounded-xl p-4 bg-slate-50/60 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🏷️</span> Topics {selectedUnit ? `(${unitTopics.length})` : ""}
                </h3>
                {selectedUnit && (
                  <p className="text-[11px] text-indigo-600 font-semibold truncate max-w-[200px]">
                    Unit {selectedUnit.unitNo}: {selectedUnit.title}
                  </p>
                )}
              </div>
              {selectedUnit && (
                <button
                  onClick={openAddTopic}
                  className="rounded bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700 transition"
                >
                  + Add Topic
                </button>
              )}
            </div>

            {!selectedUnit ? (
              <div className="text-center py-12 text-xs text-slate-400">
                ← Select a unit from the middle column to view and edit its topics.
              </div>
            ) : unitTopicsLoading ? (
              <p className="text-xs text-slate-500 text-center py-6">Loading topics...</p>
            ) : unitTopics.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 space-y-2">
                <p>No topics added to this unit yet.</p>
                <button
                  onClick={openAddTopic}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  + Add first topic now
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {unitTopics.map((topic) => (
                  <div key={topic._id} className="p-3 rounded-lg border bg-white border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-bold text-slate-900 text-xs leading-snug">{topic.name}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          title="Edit Topic"
                          onClick={() => openEditTopic(topic)}
                          className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 text-xs"
                        >
                          ✏️
                        </button>
                        <button
                          title="Delete Topic"
                          onClick={() => setDeleteConfirm({ type: "topic", item: topic })}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Keywords tags */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                        NLP Keywords ({topic.keywords ? topic.keywords.length : 0}):
                      </span>
                      {topic.keywords && topic.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {topic.keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] px-1.5 py-0.5 rounded font-medium"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No keywords specified</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: SUBJECT (CREATE / EDIT)             */}
      {/* ========================================== */}
      {subjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {subjectModal.mode === "create" ? "Add New Subject" : `Edit Subject: ${subjectModal.sub.code}`}
              </h3>
              <button
                onClick={() => setSubjectModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KCS501, KCS051, BCS301"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-indigo-500 uppercase font-mono"
                />
                <span className="text-[10px] text-slate-400">Must be unique across the platform.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management System"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Semester *</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={subjectForm.semester}
                  onChange={(e) => setSubjectForm({ ...subjectForm, semester: parseInt(e.target.value, 10) || 1 })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSubjectModal(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subjectSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
                >
                  {subjectSubmitting ? "Saving..." : subjectModal.mode === "create" ? "Create Subject" : "Update Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: UNIT (CREATE / EDIT)                */}
      {/* ========================================== */}
      {unitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {unitModal.mode === "create" ? `Add Unit to ${selectedSubject?.code}` : `Edit Unit ${unitModal.unit.unitNo}`}
              </h3>
              <button
                onClick={() => setUnitModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUnitSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Number *</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={unitForm.unitNo}
                  onChange={(e) => setUnitForm({ ...unitForm, unitNo: parseInt(e.target.value, 10) || 1 })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-indigo-500"
                />
                <span className="text-[10px] text-slate-400">Must be unique within this subject.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Relational Data Model and SQL"
                  value={unitForm.title}
                  onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setUnitModal(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unitSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
                >
                  {unitSubmitting ? "Saving..." : unitModal.mode === "create" ? "Add Unit" : "Update Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: TOPIC (CREATE / EDIT)               */}
      {/* ========================================== */}
      {topicModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {topicModal.mode === "create"
                  ? `Add Topic to Unit ${selectedUnit?.unitNo}`
                  : `Edit Topic: ${topicModal.topic.name}`}
              </h3>
              <button
                onClick={() => setTopicModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTopicSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Normalization and Normal Forms (1NF, 2NF, 3NF, BCNF)"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NLP Keyword Profile (comma-separated)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. normalization, normal form, 1nf, 2nf, 3nf, bcnf, functional dependency, lossy, lossless"
                  value={topicForm.keywords}
                  onChange={(e) => setTopicForm({ ...topicForm, keywords: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-indigo-500 font-mono text-[11px]"
                />
                <span className="text-[10px] text-slate-400">
                  These keywords are used directly by the TF-IDF cosine similarity model to classify extracted exam questions.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setTopicModal(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={topicSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
                >
                  {topicSubmitting ? "Saving..." : topicModal.mode === "create" ? "Add Topic" : "Update Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: DELETE SAFEGUARD CONFIRMATION       */}
      {/* ========================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b pb-3">
              <span className="text-xl">⚠️</span>
              <h3 className="font-bold text-base text-slate-900">
                Confirm Deletion: {deleteConfirm.type.toUpperCase()}
              </h3>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Are you sure you want to delete{" "}
                <strong className="text-slate-900">
                  {deleteConfirm.type === "subject"
                    ? `${deleteConfirm.item.name} (${deleteConfirm.item.code})`
                    : deleteConfirm.type === "unit"
                    ? `Unit ${deleteConfirm.item.unitNo}: ${deleteConfirm.item.title}`
                    : deleteConfirm.item.name}
                </strong>
                ?
              </p>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded p-2 text-[11px] leading-relaxed">
                <strong>Referential Integrity Safeguard:</strong> The backend will reject deletion if this entity is linked to existing question papers, units, topics, or verified exam questions.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-semibold text-xs disabled:opacity-50"
              >
                {deleteSubmitting ? "Deleting..." : "Confirm & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
