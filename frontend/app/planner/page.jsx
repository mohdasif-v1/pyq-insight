"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Calendar, Clock, Sparkles, BookOpen, ArrowRight } from "lucide-react";

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
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Adaptive Study Scheduler</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Dynamic knapsack algorithm allocating hours by topic credit weightage with mandatory final-day revision
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-rose-950/40 border border-rose-800/50 p-3 text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={generate} className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-panel space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider">Subject</label>
            <select
              className="w-full rounded-md border border-slate-750 bg-slate-950 px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
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
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider">Target Examination Date</label>
            <input
              type="date"
              required
              className="w-full rounded-md border border-slate-750 bg-slate-950 px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider">Daily Hours</label>
            <input
              type="number"
              min={1}
              max={12}
              required
              className="w-full rounded-md border border-slate-750 bg-slate-950 px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
              value={form.dailyHours}
              onChange={(e) => setForm({ ...form, dailyHours: parseInt(e.target.value, 10) || 1 })}
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? "Computing optimal timetable..." : "Generate Preparation Schedule"}</span>
        </button>
      </form>

      {/* Schedule Output */}
      {plan && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-panel space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Personalized Timetable</h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Target: {new Date(plan.examDate).toLocaleDateString()} &bull; {plan.dailyHours} Hours/Day
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
              {plan.schedule.length} Days Allocated
            </span>
          </div>

          <div className="space-y-2">
            {plan.schedule.map((day) => (
              <div
                key={day.day}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[8px] font-mono uppercase text-slate-500">DAY</span>
                    <span className="text-xs font-bold text-blue-400 leading-none">{day.day}</span>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-100">
                      {day.topicName || topicsMap[day.topicId] || (day.isRevision ? "Comprehensive Syllabus Revision" : "Review")}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {day.isRevision ? (
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/50 text-blue-400 font-mono text-[10px]">
                      Mandatory Revision Buffer
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">
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
