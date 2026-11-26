"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { CalendarDays, Clock, Sparkles, BookOpen, CheckCircle, ArrowRight } from "lucide-react";

export default function PlannerPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [topicsMap, setTopicsMap] = useState({});
  const [form, setForm] = useState({ subjectId: "", examDate: "", dailyHours: 4 });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
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
          setForm((prev) => ({ ...prev, subjectId: subs[0]._id }));
          loadTopics(subs[0]._id);
        }
      })
      .catch((err) => setError(err.message));

    // Default exam date: 14 days from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setForm((prev) => ({ ...prev, examDate: d.toISOString().split("T")[0] }));
  }, [router]);

  function loadTopics(subId) {
    api(`/subjects/${subId}/topics`)
      .then((tList) => {
        const map = Object.fromEntries(tList.map((t) => [t.id, t.name]));
        setTopicsMap(map);
      })
      .catch(() => {});
  }

  function handleSubjectChange(subId) {
    setForm((prev) => ({ ...prev, subjectId: subId }));
    loadTopics(subId);
  }

  async function generate(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api("/plan", { method: "POST", body: form });
      setPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-dark-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">Adaptive Study Planner</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Greedy timetable distribution: high-yield priority topics receive proportional study hours, concluding with an integrated revision buffer.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-status-error/10 border border-status-error/25 p-4 text-xs sm:text-sm text-status-error font-medium">
          {error}
        </div>
      )}

      {/* Plan Generation Form */}
      <form onSubmit={generate} className="rounded-xl border border-dark-border bg-dark-card p-6 shadow-card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Subject</label>
            <select
              className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-200 font-medium focus:border-brand-primary focus:outline-none"
              value={form.subjectId}
              required
              onChange={(e) => handleSubjectChange(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code || "Sem " + s.semester})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Target Exam Date</label>
            <input
              type="date"
              required
              className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-200 font-mono focus:border-brand-primary focus:outline-none"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Daily Study Hours</label>
            <input
              type="number"
              min={1}
              max={12}
              required
              className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-200 focus:border-brand-primary focus:outline-none"
              value={form.dailyHours}
              onChange={(e) => setForm({ ...form, dailyHours: parseInt(e.target.value, 10) || 1 })}
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="rounded-lg bg-brand-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-dark-bg hover:bg-brand-hover transition shadow-subtle flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? "Computing optimal schedule..." : "Generate Study Plan"}</span>
        </button>
      </form>

      {/* Generated Plan View */}
      {plan && (
        <div className="rounded-xl border border-dark-border bg-dark-card p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Personalized Schedule</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Date: <span className="font-mono text-slate-200">{new Date(plan.examDate).toLocaleDateString()}</span> • {plan.dailyHours} Hours/Day
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-status-success-muted border border-status-success/30 text-status-success">
              {plan.schedule.length} Days Allocated
            </span>
          </div>

          <div className="space-y-3">
            {plan.schedule.map((day) => (
              <div
                key={day.day}
                className="rounded-lg border border-dark-border bg-dark-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-500/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-dark-card border border-dark-border flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Day</span>
                    <span className="text-sm font-bold text-brand-primary leading-none">{day.day}</span>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100">
                      {day.topicName || topicsMap[day.topicId] || (day.isRevision ? "Comprehensive Revision" : "Review")}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {day.isRevision ? (
                    <span className="px-2.5 py-1 rounded bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-semibold text-[11px]">
                      Full Syllabus Revision
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-dark-card border border-dark-border text-slate-300 font-mono font-medium text-[11px]">
                      {day.hours} Hours
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
