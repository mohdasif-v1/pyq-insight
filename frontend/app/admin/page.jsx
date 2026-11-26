"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Upload,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Layers,
  Tags,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

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

  // Syllabus Management State
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitTopics, setUnitTopics] = useState([]);
  const [unitTopicsLoading, setUnitTopicsLoading] = useState(false);

  // Feedback notifications
  const [syllabusFeedback, setSyllabusFeedback] = useState({ type: "", message: "" });

  // Modals
  const [subjectModal, setSubjectModal] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ code: "", name: "", semester: 5 });
  const [subjectSubmitting, setSubjectSubmitting] = useState(false);

  const [unitModal, setUnitModal] = useState(null);
  const [unitForm, setUnitForm] = useState({ unitNo: 1, title: "" });
  const [unitSubmitting, setUnitSubmitting] = useState(false);

  const [topicModal, setTopicModal] = useState(null);
  const [topicForm, setTopicForm] = useState({ name: "", keywords: "" });
  const [topicSubmitting, setTopicSubmitting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
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
          setForm((prev) => {
            const exists = subs.find((s) => s._id === prev.subjectId);
            const newSubId = preferredSelectedId || (exists ? prev.subjectId : subs[0]._id);
            loadTopics(newSubId);
            return { ...prev, subjectId: newSubId };
          });

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

  // Upload handler
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
      showFeedback("success", "Topic assignment verified and updated.");
    } catch (err) {
      showFeedback("error", err.message);
    }
  }

  // Subject CRUD
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
        const created = await api("/subjects", { method: "POST", body: subjectForm });
        showFeedback("success", `Subject '${created.name}' created.`);
        loadSubjects(created._id);
        setSelectedSubject(created);
        loadUnits(created._id);
      } else {
        const updated = await api(`/subjects/${subjectModal.sub._id}`, { method: "PATCH", body: subjectForm });
        showFeedback("success", `Subject '${updated.name}' updated.`);
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

  // Unit CRUD
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
        const created = await api(`/subjects/${selectedSubject._id}/units`, { method: "POST", body: unitForm });
        showFeedback("success", `Unit ${created.unitNo} added.`);
        loadUnits(selectedSubject._id, created._id);
        loadSubjects();
      } else {
        const updated = await api(`/subjects/units/${unitModal.unit._id}`, { method: "PATCH", body: unitForm });
        showFeedback("success", `Unit ${updated.unitNo} updated.`);
        loadUnits(selectedSubject._id, updated._id);
      }
      setUnitModal(null);
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setUnitSubmitting(false);
    }
  }

  // Topic CRUD
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
        showFeedback("success", `Topic '${created.name}' added.`);
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
        showFeedback("success", `Topic '${updated.name}' updated.`);
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

  // Deletion with Safeguard
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
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">Admin Control Center</h1>
            <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[11px] font-semibold">
              Admin Protected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage academic curriculum, ingest university examination PDFs, and review NLP question mappings.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-status-error/10 border border-status-error/25 p-4 text-xs sm:text-sm text-status-error font-medium flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-status-error hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: Paper Ingestion */}
      <div className="rounded-xl border border-dark-border bg-dark-card p-6 shadow-card space-y-6">
        <div className="border-b border-dark-border pb-4">
          <h2 className="text-lg font-bold text-slate-100">1. Ingest Question Paper</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            PDFs are processed by Python FastAPI microservice (pdfplumber text extraction + OCR fallback + TF-IDF topic mapping).
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-5 max-w-3xl text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-medium text-slate-300">Target Subject</label>
              <select
                value={form.subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-brand-primary focus:outline-none"
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code}) - Sem {s.semester}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-slate-300">Examination Year</label>
              <input
                type="number"
                min={2015}
                max={2030}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) })}
                className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-slate-300">Session</label>
              <select
                value={form.session}
                onChange={(e) => setForm({ ...form, session: e.target.value })}
                className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-brand-primary focus:outline-none"
              >
                <option value="Odd">Odd Semester</option>
                <option value="Even">Even Semester</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-slate-300">Total Marks</label>
              <select
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value, 10) })}
                className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-brand-primary focus:outline-none"
              >
                <option value={100}>100 Marks (Old Scheme)</option>
                <option value={70}>70 Marks (New NEP Scheme)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-medium text-slate-300">Examination PDF File</label>
            <input
              type="file"
              accept="application/pdf"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full rounded-lg border border-dark-border bg-dark-surface p-2 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
            />
          </div>

          <button
            disabled={uploading}
            className="rounded-lg bg-brand-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-dark-bg hover:bg-brand-hover transition shadow-subtle flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Extracting & Classifying Paper..." : "Ingest & Process Paper"}</span>
          </button>
        </form>

        {uploadResult && (
          <div className="rounded-lg bg-status-success-muted border border-status-success/30 p-4 text-xs text-status-success space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Paper Ingested &amp; Classified Successfully</span>
            </p>
            <p className="font-mono text-[11px] text-slate-300">Paper ID: {uploadResult.paperId}</p>
            <p>Segmented and assigned <strong>{uploadResult.questions}</strong> examination questions.</p>
          </div>
        )}
      </div>

      {/* SECTION 2: Review Queue */}
      <div className="rounded-xl border border-dark-border bg-dark-card p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">2. Review Queue (Low-Confidence Questions)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Questions whose cosine similarity score fell below threshold (&lt;0.15) requiring human verification.
            </p>
          </div>
          <button
            onClick={loadReviewQueue}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:text-brand-hover self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue ({reviewQueue.length})</span>
          </button>
        </div>

        {queueLoading ? (
          <p className="text-center py-12 text-xs text-slate-500">Loading queue items...</p>
        ) : reviewQueue.length > 0 ? (
          <div className="divide-y divide-dark-border">
            {reviewQueue.map((q) => (
              <div key={q._id} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-status-error/15 border border-status-error/30 text-status-error">
                        Confidence: {Math.round((q.confidence || 0) * 100)}%
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-dark-surface border border-dark-border text-slate-400 font-mono">
                        {q.marks} Marks
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{q.text}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      id={`sel-${q._id}`}
                      className="rounded-lg border border-dark-border bg-dark-surface p-1.5 text-xs text-slate-200 focus:border-brand-primary focus:outline-none max-w-[200px]"
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
                      className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-dark-bg hover:bg-brand-hover"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            ✓ No low-confidence questions waiting in review queue!
          </div>
        )}
      </div>

      {/* SECTION 3: Subject & Syllabus Management */}
      <div className="rounded-xl border border-dark-border bg-dark-card p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">3. Subject &amp; Syllabus Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage curriculum hierarchy (Subjects $\rightarrow$ Units $\rightarrow$ Topics) with TF-IDF keyword profiles.
            </p>
          </div>
          <button
            onClick={openAddSubject}
            className="rounded-lg bg-brand-primary px-3.5 py-1.5 text-xs font-semibold text-dark-bg hover:bg-brand-hover transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {syllabusFeedback.message && (
          <div
            className={`rounded-lg p-3 border text-xs font-medium flex justify-between items-center ${
              syllabusFeedback.type === "success"
                ? "bg-status-success-muted border-status-success/30 text-status-success"
                : "bg-status-error/15 border-status-error/30 text-status-error"
            }`}
          >
            <span>{syllabusFeedback.message}</span>
            <button
              onClick={() => setSyllabusFeedback({ type: "", message: "" })}
              className="font-bold hover:opacity-75 ml-3"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3-Column Drilldown Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column A: Subjects */}
          <div className="lg:col-span-4 border border-dark-border rounded-xl p-4 bg-dark-surface/50 space-y-3">
            <div className="flex justify-between items-center border-b border-dark-border pb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-primary" />
                <span>Subjects ({subjects.length})</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Select to view</span>
            </div>

            {subjects.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No subjects created yet.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
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
                          ? "bg-dark-card border-brand-primary shadow-subtle"
                          : "bg-dark-card/60 border-dark-border hover:border-slate-500/50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-100 font-mono">{sub.code}</span>
                            <span className="text-[10px] bg-dark-surface border border-dark-border text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              Sem {sub.semester}
                            </span>
                          </div>
                          <p className="text-slate-300 font-medium text-xs mt-1">{sub.name}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="Edit Subject"
                            onClick={() => openEditSubject(sub)}
                            className="p-1 text-slate-400 hover:text-brand-primary rounded hover:bg-dark-surface"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Subject"
                            onClick={() => setDeleteConfirm({ type: "subject", item: sub })}
                            className="p-1 text-slate-500 hover:text-status-error rounded hover:bg-dark-surface"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 pt-2 border-t border-dark-border/60">
                        <span>Units: <strong className="text-slate-300 font-mono">{sub.unitCount || 0}</strong></span>
                        <span>Topics: <strong className="text-slate-300 font-mono">{sub.topicCount || 0}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column B: Units */}
          <div className="lg:col-span-4 border border-dark-border rounded-xl p-4 bg-dark-surface/50 space-y-3">
            <div className="flex justify-between items-center border-b border-dark-border pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Units {selectedSubject ? `(${units.length})` : ""}</span>
                </h3>
                {selectedSubject && (
                  <p className="text-[10px] text-brand-accent font-mono truncate max-w-[180px] mt-0.5">
                    {selectedSubject.code}: {selectedSubject.name}
                  </p>
                )}
              </div>
              {selectedSubject && (
                <button
                  onClick={openAddUnit}
                  className="rounded bg-brand-primary px-2.5 py-1 text-[11px] font-semibold text-dark-bg hover:bg-brand-hover transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Unit</span>
                </button>
              )}
            </div>

            {!selectedSubject ? (
              <div className="text-center py-16 text-xs text-slate-500">
                ← Select a subject from the left column to view units.
              </div>
            ) : unitsLoading ? (
              <p className="text-xs text-slate-500 text-center py-8">Loading units...</p>
            ) : units.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 space-y-2">
                <p>No units found for this subject.</p>
                <button
                  onClick={openAddUnit}
                  className="text-xs text-brand-primary font-medium hover:underline"
                >
                  + Add Unit 1
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
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
                          ? "bg-dark-card border-brand-accent shadow-subtle"
                          : "bg-dark-card/60 border-dark-border hover:border-slate-500/50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-bold text-slate-300 font-mono bg-dark-surface border border-dark-border px-1.5 py-0.5 rounded text-[10px]">
                            Unit {unit.unitNo}
                          </span>
                          <p className="text-slate-200 font-medium text-xs mt-1.5 leading-snug">{unit.title}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="Edit Unit"
                            onClick={() => openEditUnit(unit)}
                            className="p-1 text-slate-400 hover:text-brand-accent rounded hover:bg-dark-surface"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Unit"
                            onClick={() => setDeleteConfirm({ type: "unit", item: unit })}
                            className="p-1 text-slate-500 hover:text-status-error rounded hover:bg-dark-surface"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-dark-border/60">
                        <span>Topics: <strong className="text-slate-300 font-mono">{unit.topicCount || 0}</strong></span>
                        <span className="text-brand-accent font-medium flex items-center gap-0.5">
                          <span>Topics</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column C: Topics & Keywords */}
          <div className="lg:col-span-4 border border-dark-border rounded-xl p-4 bg-dark-surface/50 space-y-3">
            <div className="flex justify-between items-center border-b border-dark-border pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tags className="w-3.5 h-3.5 text-status-success" />
                  <span>Topics {selectedUnit ? `(${unitTopics.length})` : ""}</span>
                </h3>
                {selectedUnit && (
                  <p className="text-[10px] text-status-success font-mono truncate max-w-[180px] mt-0.5">
                    Unit {selectedUnit.unitNo}: {selectedUnit.title}
                  </p>
                )}
              </div>
              {selectedUnit && (
                <button
                  onClick={openAddTopic}
                  className="rounded bg-brand-primary px-2.5 py-1 text-[11px] font-semibold text-dark-bg hover:bg-brand-hover transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Topic</span>
                </button>
              )}
            </div>

            {!selectedUnit ? (
              <div className="text-center py-16 text-xs text-slate-500">
                ← Select a unit from the middle column to view topics.
              </div>
            ) : unitTopicsLoading ? (
              <p className="text-xs text-slate-500 text-center py-8">Loading topics...</p>
            ) : unitTopics.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 space-y-2">
                <p>No topics configured in this unit.</p>
                <button
                  onClick={openAddTopic}
                  className="text-xs text-brand-primary font-medium hover:underline"
                >
                  + Add first topic
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {unitTopics.map((topic) => (
                  <div key={topic._id} className="p-3 rounded-lg border border-dark-border bg-dark-card text-xs space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-semibold text-slate-200 text-xs leading-snug">{topic.name}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          title="Edit Topic"
                          onClick={() => openEditTopic(topic)}
                          className="p-1 text-slate-400 hover:text-brand-primary rounded hover:bg-dark-surface"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete Topic"
                          onClick={() => setDeleteConfirm({ type: "topic", item: topic })}
                          className="p-1 text-slate-500 hover:text-status-error rounded hover:bg-dark-surface"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono block">
                        NLP Keywords ({topic.keywords ? topic.keywords.length : 0}):
                      </span>
                      {topic.keywords && topic.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {topic.keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="bg-dark-surface border border-dark-border text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-mono"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No keywords assigned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: SUBJECT */}
      {subjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-xl shadow-elevated border border-dark-border max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-dark-border pb-3">
              <h3 className="font-bold text-sm text-slate-100">
                {subjectModal.mode === "create" ? "Add New Subject" : `Edit Subject: ${subjectModal.sub.code}`}
              </h3>
              <button onClick={() => setSubjectModal(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block font-medium text-slate-300">Subject Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KCS501, KCS051, BCS301"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 font-mono uppercase focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-300">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management System"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-300">Semester *</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={subjectForm.semester}
                  onChange={(e) => setSubjectForm({ ...subjectForm, semester: parseInt(e.target.value, 10) || 1 })}
                  className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 font-mono focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setSubjectModal(null)}
                  className="px-3.5 py-1.5 border border-dark-border rounded-lg text-slate-400 hover:text-slate-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subjectSubmitting}
                  className="px-4 py-1.5 bg-brand-primary text-dark-bg rounded-lg hover:bg-brand-hover font-semibold disabled:opacity-50"
                >
                  {subjectSubmitting ? "Saving..." : subjectModal.mode === "create" ? "Create Subject" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UNIT */}
      {unitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-xl shadow-elevated border border-dark-border max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-dark-border pb-3">
              <h3 className="font-bold text-sm text-slate-100">
                {unitModal.mode === "create" ? `Add Unit to ${selectedSubject?.code}` : `Edit Unit ${unitModal.unit.unitNo}`}
              </h3>
              <button onClick={() => setUnitModal(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUnitSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block font-medium text-slate-300">Unit Number *</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={unitForm.unitNo}
                  onChange={(e) => setUnitForm({ ...unitForm, unitNo: parseInt(e.target.value, 10) || 1 })}
                  className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 font-mono focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-300">Unit Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Relational Data Model and SQL"
                  value={unitForm.title}
                  onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                  className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setUnitModal(null)}
                  className="px-3.5 py-1.5 border border-dark-border rounded-lg text-slate-400 hover:text-slate-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unitSubmitting}
                  className="px-4 py-1.5 bg-brand-primary text-dark-bg rounded-lg hover:bg-brand-hover font-semibold disabled:opacity-50"
                >
                  {unitSubmitting ? "Saving..." : unitModal.mode === "create" ? "Add Unit" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TOPIC */}
      {topicModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-xl shadow-elevated border border-dark-border max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-dark-border pb-3">
              <h3 className="font-bold text-sm text-slate-100">
                {topicModal.mode === "create" ? `Add Topic to Unit ${selectedUnit?.unitNo}` : `Edit Topic: ${topicModal.topic.name}`}
              </h3>
              <button onClick={() => setTopicModal(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTopicSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block font-medium text-slate-300">Topic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Normalization and Normal Forms (1NF, 2NF, 3NF, BCNF)"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-300">
                  NLP Keyword Profile (comma-separated)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. normalization, normal form, 1nf, 2nf, 3nf, bcnf, functional dependency, lossy, lossless"
                  value={topicForm.keywords}
                  onChange={(e) => setTopicForm({ ...topicForm, keywords: e.target.value })}
                  className="w-full rounded-lg border border-dark-border bg-dark-surface p-2.5 text-xs text-slate-100 font-mono focus:border-brand-primary focus:outline-none leading-relaxed"
                />
                <span className="text-[10px] text-slate-500 block">
                  Keywords are converted to TF-IDF vectors for cosine similarity scoring against examination questions.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setTopicModal(null)}
                  className="px-3.5 py-1.5 border border-dark-border rounded-lg text-slate-400 hover:text-slate-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={topicSubmitting}
                  className="px-4 py-1.5 bg-brand-primary text-dark-bg rounded-lg hover:bg-brand-hover font-semibold disabled:opacity-50"
                >
                  {topicSubmitting ? "Saving..." : topicModal.mode === "create" ? "Add Topic" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-xl shadow-elevated border border-dark-border max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-status-error border-b border-dark-border pb-3">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-bold text-sm text-slate-100">
                Confirm Deletion: {deleteConfirm.type.toUpperCase()}
              </h3>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <p>
                Are you sure you want to delete{" "}
                <strong className="text-slate-100">
                  {deleteConfirm.type === "subject"
                    ? `${deleteConfirm.item.name} (${deleteConfirm.item.code})`
                    : deleteConfirm.type === "unit"
                    ? `Unit ${deleteConfirm.item.unitNo}: ${deleteConfirm.item.title}`
                    : deleteConfirm.item.name}
                </strong>
                ?
              </p>
              <div className="bg-dark-surface border border-dark-border text-slate-400 rounded-lg p-3 text-[11px] leading-relaxed">
                <strong>Referential Guard:</strong> The system will block deletion if this record is referenced by existing question papers, units, topics, or verified exam questions.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-dark-border">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-1.5 border border-dark-border rounded-lg text-slate-400 hover:text-slate-200 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={confirmDelete}
                className="px-4 py-1.5 bg-status-error text-dark-bg font-semibold rounded-lg hover:opacity-90 text-xs disabled:opacity-50"
              >
                {deleteSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
