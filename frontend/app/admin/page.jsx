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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Admin Control Center</h1>
            <span className="px-3 py-1 rounded-full bg-brand-royal border border-brand-lavender/30 text-brand-lavender text-xs font-mono">
              CURRICULUM ROOT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Ingest question papers, review NLP classification queue, and configure syllabus taxonomy
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 font-medium flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: Paper Ingestion */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="border-b border-canvas-border pb-3">
          <h2 className="text-xs font-mono font-bold text-brand-lavender uppercase tracking-wider">
            1. Ingest Examination Paper
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Extract questions from university PDF papers using pdfplumber with OCR fallback and TF-IDF topic mapping.
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4 max-w-3xl text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-ink-secondary font-medium">Target Subject</label>
              <select
                value={form.subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id} className="bg-canvas-deep text-white">
                    {s.name} ({s.code}) - Sem {s.semester}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-ink-secondary font-medium">Examination Year</label>
              <input
                type="number"
                min={2015}
                max={2030}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) })}
                className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-ink-secondary font-medium">Session</label>
              <select
                value={form.session}
                onChange={(e) => setForm({ ...form, session: e.target.value })}
                className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
              >
                <option value="Odd" className="bg-canvas-deep text-white">Odd Semester</option>
                <option value="Even" className="bg-canvas-deep text-white">Even Semester</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-ink-secondary font-medium">Total Marks</label>
              <select
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value, 10) })}
                className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
              >
                <option value={100} className="bg-canvas-deep text-white">100 Marks (Old Scheme)</option>
                <option value={70} className="bg-canvas-deep text-white">70 Marks (New NEP Scheme)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-ink-secondary font-medium">Question Paper PDF</label>
            <input
              type="file"
              accept="application/pdf"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full rounded-xl glass-input p-2 text-xs text-ink-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-royal file:text-white hover:file:bg-brand-muted transition cursor-pointer"
            />
          </div>

          <button
            disabled={uploading}
            className="rounded-xl bg-gradient-to-r from-brand-royal via-brand-muted to-brand-royal px-6 py-2.5 text-xs font-semibold text-white shadow-cta hover:opacity-95 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-brand-lavender" />
            <span>{uploading ? "Extracting & Segmenting Questions..." : "Ingest & Process Paper"}</span>
          </button>
        </form>

        {uploadResult && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Paper Ingested &amp; Classified Successfully</span>
            </p>
            <p className="font-mono text-[11px] text-ink-muted">Paper ID: {uploadResult.paperId}</p>
            <p className="text-ink-secondary">
              Extracted and assigned <strong className="text-white">{uploadResult.questions}</strong> examination questions.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: Review Queue */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-canvas-border pb-3">
          <div>
            <h2 className="text-xs font-mono font-bold text-brand-lavender uppercase tracking-wider">
              2. Review Queue (Low-Confidence Questions)
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Questions whose cosine similarity score fell below threshold (&lt;0.15) requiring manual confirmation.
            </p>
          </div>
          <button
            onClick={loadReviewQueue}
            className="inline-flex items-center gap-1.5 text-xs text-brand-lavender hover:text-white self-start sm:self-auto transition font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${queueLoading ? "animate-spin" : ""}`} />
            <span>Refresh Queue ({reviewQueue.length})</span>
          </button>
        </div>

        {queueLoading ? (
          <p className="text-center py-12 text-xs text-ink-muted">Loading queue items...</p>
        ) : reviewQueue.length > 0 ? (
          <div className="divide-y divide-canvas-border">
            {reviewQueue.map((q) => (
              <div key={q._id} className="py-4 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
                        Score: {Math.round((q.confidence || 0) * 100)}%
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-canvas-elevated border border-canvas-border text-ink-muted font-mono">
                        {q.marks} Marks
                      </span>
                    </div>
                    <p className="text-xs text-white leading-relaxed">{q.text}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      id={`sel-${q._id}`}
                      className="rounded-xl glass-input p-2 text-xs text-white focus:outline-none max-w-[200px]"
                      defaultValue=""
                    >
                      <option value="" disabled className="bg-canvas-deep text-white">Assign Topic...</option>
                      {topics.map((t) => (
                        <option key={t.id || t._id} value={t.id || t._id} className="bg-canvas-deep text-white">
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
                      className="rounded-xl bg-brand-royal px-4 py-2 text-xs font-semibold text-white hover:bg-brand-muted transition shadow-cta"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-emerald-400 text-xs flex items-center justify-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>No low-confidence questions waiting in review queue</span>
          </div>
        )}
      </div>

      {/* SECTION 3: Subject & Syllabus Management */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-canvas-border pb-4">
          <div>
            <h2 className="text-xs font-mono font-bold text-brand-lavender uppercase tracking-wider">
              3. Subject &amp; Syllabus Management
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Configure curriculum hierarchy (Subjects &rarr; Units &rarr; Topics) with TF-IDF keyword profiles.
            </p>
          </div>
          <button
            onClick={openAddSubject}
            className="rounded-xl bg-gradient-to-r from-brand-royal via-brand-muted to-brand-royal px-4 py-2 text-xs font-semibold text-white shadow-cta hover:opacity-95 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-brand-lavender" />
            <span>Add Subject</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {syllabusFeedback.message && (
          <div
            className={`rounded-xl p-3 border text-xs font-medium flex justify-between items-center ${
              syllabusFeedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-300"
            }`}
          >
            <span>{syllabusFeedback.message}</span>
            <button
              onClick={() => setSyllabusFeedback({ type: "", message: "" })}
              className="hover:opacity-75 ml-3"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3-Column Drilldown Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Column A: Subjects */}
          <div className="lg:col-span-4 border border-canvas-border rounded-xl p-4 bg-canvas-elevated/30 space-y-3">
            <div className="flex justify-between items-center border-b border-canvas-border pb-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-lavender" />
                <span>Subjects ({subjects.length})</span>
              </span>
              <span className="text-[10px] text-ink-muted font-mono">Select to drilldown</span>
            </div>

            {subjects.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-8">No subjects created yet.</p>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
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
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                        isSelected
                          ? "bg-brand-royal/50 border-brand-lavender/50 text-white shadow-glow"
                          : "bg-canvas-elevated/40 border-canvas-border hover:bg-canvas-elevated/80"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white font-mono">{sub.code}</span>
                            <span className="text-[10px] bg-canvas-base border border-canvas-border text-ink-muted px-1.5 py-0.5 rounded font-mono">
                              Sem {sub.semester}
                            </span>
                          </div>
                          <p className="text-ink-secondary text-xs mt-1">{sub.name}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="Edit Subject"
                            onClick={() => openEditSubject(sub)}
                            className="p-1 text-ink-muted hover:text-white rounded transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Subject"
                            onClick={() => setDeleteConfirm({ type: "subject", item: sub })}
                            className="p-1 text-ink-muted hover:text-rose-400 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-ink-muted mt-2.5 pt-2 border-t border-canvas-border/50 font-mono">
                        <span>Units: {sub.unitCount || 0}</span>
                        <span>Topics: {sub.topicCount || 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column B: Units */}
          <div className="lg:col-span-4 border border-canvas-border rounded-xl p-4 bg-canvas-elevated/30 space-y-3">
            <div className="flex justify-between items-center border-b border-canvas-border pb-2">
              <div>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-lavender" />
                  <span>Units {selectedSubject ? `(${units.length})` : ""}</span>
                </span>
                {selectedSubject && (
                  <p className="text-[10px] text-brand-lavender font-mono truncate max-w-[160px] mt-0.5">
                    {selectedSubject.code}: {selectedSubject.name}
                  </p>
                )}
              </div>
              {selectedSubject && (
                <button
                  onClick={openAddUnit}
                  className="rounded-lg bg-brand-royal px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-brand-muted transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Unit</span>
                </button>
              )}
            </div>

            {!selectedSubject ? (
              <div className="text-center py-16 text-xs text-ink-muted">
                &larr; Select a subject from the left column to view units.
              </div>
            ) : unitsLoading ? (
              <p className="text-xs text-ink-muted text-center py-12">Loading units...</p>
            ) : units.length === 0 ? (
              <div className="text-center py-12 text-xs text-ink-muted space-y-2">
                <p>No units configured yet.</p>
                <button
                  onClick={openAddUnit}
                  className="text-xs text-brand-lavender hover:underline"
                >
                  + Add Unit 1
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {units.map((unit) => {
                  const isSelected = selectedUnit && selectedUnit._id === unit._id;
                  return (
                    <div
                      key={unit._id}
                      onClick={() => {
                        setSelectedUnit(unit);
                        loadUnitTopics(unit._id);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                        isSelected
                          ? "bg-brand-royal/50 border-brand-lavender/50 text-white shadow-glow"
                          : "bg-canvas-elevated/40 border-canvas-border hover:bg-canvas-elevated/80"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-mono text-ink-muted text-[10px] bg-canvas-base px-1.5 py-0.5 rounded border border-canvas-border">
                            Unit {unit.unitNo}
                          </span>
                          <p className="text-white font-semibold text-xs mt-1 leading-snug">{unit.title}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="Edit Unit"
                            onClick={() => openEditUnit(unit)}
                            className="p-1 text-ink-muted hover:text-white rounded transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Unit"
                            onClick={() => setDeleteConfirm({ type: "unit", item: unit })}
                            className="p-1 text-ink-muted hover:text-rose-400 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-ink-muted mt-2.5 pt-2 border-t border-canvas-border/50 font-mono">
                        <span>Topics: {unit.topicCount || 0}</span>
                        <span className="text-brand-lavender flex items-center gap-0.5">
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
          <div className="lg:col-span-4 border border-canvas-border rounded-xl p-4 bg-canvas-elevated/30 space-y-3">
            <div className="flex justify-between items-center border-b border-canvas-border pb-2">
              <div>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Tags className="w-3.5 h-3.5 text-brand-lavender" />
                  <span>Topics {selectedUnit ? `(${unitTopics.length})` : ""}</span>
                </span>
                {selectedUnit && (
                  <p className="text-[10px] text-brand-lavender font-mono truncate max-w-[160px] mt-0.5">
                    Unit {selectedUnit.unitNo}: {selectedUnit.title}
                  </p>
                )}
              </div>
              {selectedUnit && (
                <button
                  onClick={openAddTopic}
                  className="rounded-lg bg-brand-royal px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-brand-muted transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Topic</span>
                </button>
              )}
            </div>

            {!selectedUnit ? (
              <div className="text-center py-16 text-xs text-ink-muted">
                &larr; Select a unit from the middle column to view topics.
              </div>
            ) : unitTopicsLoading ? (
              <p className="text-xs text-ink-muted text-center py-12">Loading topics...</p>
            ) : unitTopics.length === 0 ? (
              <div className="text-center py-12 text-xs text-ink-muted space-y-2">
                <p>No topics configured in this unit.</p>
                <button
                  onClick={openAddTopic}
                  className="text-xs text-brand-lavender hover:underline"
                >
                  + Add first topic
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {unitTopics.map((topic) => (
                  <div key={topic._id} className="p-3 rounded-xl border border-canvas-border bg-canvas-elevated/50 text-xs space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-semibold text-white text-xs leading-snug">{topic.name}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          title="Edit Topic"
                          onClick={() => openEditTopic(topic)}
                          className="p-1 text-ink-muted hover:text-white rounded transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete Topic"
                          onClick={() => setDeleteConfirm({ type: "topic", item: topic })}
                          className="p-1 text-ink-muted hover:text-rose-400 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1.5 border-t border-canvas-border/50">
                      <span className="text-[10px] text-ink-muted font-mono block">
                        Keywords ({topic.keywords ? topic.keywords.length : 0}):
                      </span>
                      {topic.keywords && topic.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {topic.keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="bg-canvas-base border border-canvas-border text-ink-secondary text-[10px] px-2 py-0.5 rounded-full font-mono"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-ink-muted italic">No keywords assigned</span>
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 space-y-4 shadow-glass">
            <div className="flex justify-between items-center border-b border-canvas-border pb-3">
              <h3 className="font-bold text-sm text-white font-mono">
                {subjectModal.mode === "create" ? "Add New Subject" : `Edit Subject: ${subjectModal.sub.code}`}
              </h3>
              <button onClick={() => setSubjectModal(null)} className="text-ink-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="block text-ink-secondary font-medium">Subject Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KCS501, KCS051, BCS301"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white font-mono uppercase focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-ink-secondary font-medium">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management System"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-ink-secondary font-medium">Semester *</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={subjectForm.semester}
                  onChange={(e) => setSubjectForm({ ...subjectForm, semester: parseInt(e.target.value, 10) || 1 })}
                  className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-canvas-border">
                <button
                  type="button"
                  onClick={() => setSubjectModal(null)}
                  className="px-4 py-2 border border-canvas-border rounded-xl text-ink-secondary hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subjectSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-brand-royal to-brand-muted text-white rounded-xl shadow-cta hover:opacity-95 text-xs font-semibold disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 space-y-4 shadow-glass">
            <div className="flex justify-between items-center border-b border-canvas-border pb-3">
              <h3 className="font-bold text-sm text-white font-mono">
                {unitModal.mode === "create" ? `Add Unit to ${selectedSubject?.code}` : `Edit Unit ${unitModal.unit.unitNo}`}
              </h3>
              <button onClick={() => setUnitModal(null)} className="text-ink-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUnitSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="block text-ink-secondary font-medium">Unit Number *</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={unitForm.unitNo}
                  onChange={(e) => setUnitForm({ ...unitForm, unitNo: parseInt(e.target.value, 10) || 1 })}
                  className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-ink-secondary font-medium">Unit Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Relational Data Model and SQL"
                  value={unitForm.title}
                  onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                  className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-canvas-border">
                <button
                  type="button"
                  onClick={() => setUnitModal(null)}
                  className="px-4 py-2 border border-canvas-border rounded-xl text-ink-secondary hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unitSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-brand-royal to-brand-muted text-white rounded-xl shadow-cta hover:opacity-95 text-xs font-semibold disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-glass">
            <div className="flex justify-between items-center border-b border-canvas-border pb-3">
              <h3 className="font-bold text-sm text-white font-mono">
                {topicModal.mode === "create" ? `Add Topic to Unit ${selectedUnit?.unitNo}` : `Edit Topic: ${topicModal.topic.name}`}
              </h3>
              <button onClick={() => setTopicModal(null)} className="text-ink-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTopicSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="block text-ink-secondary font-medium">Topic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Normalization and Normal Forms (1NF, 2NF, 3NF, BCNF)"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-ink-secondary font-medium">
                  NLP Keyword Profile (comma-separated)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. normalization, normal form, 1nf, 2nf, 3nf, bcnf, functional dependency, lossy, lossless"
                  value={topicForm.keywords}
                  onChange={(e) => setTopicForm({ ...topicForm, keywords: e.target.value })}
                  className="w-full rounded-xl glass-input p-3 text-xs text-white font-mono focus:outline-none leading-relaxed"
                />
                <span className="text-[10px] text-ink-muted block">
                  Keywords are converted to TF-IDF vectors for cosine similarity scoring against examination questions.
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-canvas-border">
                <button
                  type="button"
                  onClick={() => setTopicModal(null)}
                  className="px-4 py-2 border border-canvas-border rounded-xl text-ink-secondary hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={topicSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-brand-royal to-brand-muted text-white rounded-xl shadow-cta hover:opacity-95 text-xs font-semibold disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 space-y-4 shadow-glass">
            <div className="flex items-center gap-2 text-rose-400 border-b border-canvas-border pb-3">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-bold text-sm text-white font-mono">
                Confirm Deletion: {deleteConfirm.type.toUpperCase()}
              </h3>
            </div>

            <div className="text-xs text-ink-secondary space-y-2">
              <p>
                Are you sure you want to delete{" "}
                <strong className="text-white">
                  {deleteConfirm.type === "subject"
                    ? `${deleteConfirm.item.name} (${deleteConfirm.item.code})`
                    : deleteConfirm.type === "unit"
                    ? `Unit ${deleteConfirm.item.unitNo}: ${deleteConfirm.item.title}`
                    : deleteConfirm.item.name}
                </strong>
                ?
              </p>
              <div className="bg-canvas-elevated border border-canvas-border text-ink-muted rounded-xl p-3 text-[11px] leading-relaxed">
                <strong className="text-white">Referential Guard:</strong> Deletion will be prevented if this curriculum node is referenced by existing exam questions, units, or topics.
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3.5 border-t border-canvas-border">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-canvas-border rounded-xl text-ink-secondary hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={confirmDelete}
                className="px-5 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-500 text-xs font-semibold disabled:opacity-50 transition shadow-cta"
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
