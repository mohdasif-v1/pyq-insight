"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Calendar, Clock, BookOpen, ArrowRight } from "lucide-react";

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
      <div className="border-b border-app-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-text-primary">Adaptive Study Timetable</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Dynamic knapsack optimizer allocating preparation hours by topic weightage with mandatory final revision buffer
        </p>
      </div>

      {error && (
        <div className="rounded border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      {/* Form Parameters */}
      <div className="rounded border border-app-border bg-app-surface p-5 space-y-4">
        <div className="border-b border-app-border pb-2.5">
          <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
            Timetable Constraints &amp; Targets
          </h2>
        </div>

        <form onSubmit={generate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="block text-text-secondary font-medium">Target Subject</label>
            <select
              value={form.subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full rounded border border-app-border bg-app-input px-3 py-2 text-xs text-text-primary focus:border-indigo-lavender focus:outline-none transition font-mono"
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code || "Sem " + s.semester})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-text-secondary font-medium">Exam Date</label>
            <input
              type="date"
              required
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              className="w-full rounded border border-app-border bg-app-input px-3 py-2 text-xs text-text-primary focus:border-indigo-lavender focus:outline-none transition font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-text-secondary font-medium">Daily Dedicated Hours</label>
            <input
              type="number"
              min={1}
              max={16}
              required
              value={form.dailyHours}
              onChange={(e) => setForm({ ...form, dailyHours: parseInt(e.target.value, 10) || 1 })}
              className="w-full rounded border border-app-border bg-app-input px-3 py-2 text-xs text-text-primary focus:border-indigo-lavender focus:outline-none transition font-mono"
            />
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded bg-indigo-royal text-text-primary text-xs font-medium hover:bg-indigo-muted transition disabled:opacity-50"
            >
              {loading ? "Computing Knapsack Allocation..." : "Generate Optimized Schedule"}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Schedule Table */}
      {plan && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded border border-app-border bg-app-surface">
              <span className="text-[10px] font-mono text-text-muted uppercase">Total Study Days</span>
              <p className="text-base font-semibold text-text-primary font-mono mt-0.5">{plan.daysAvailable || 14} Days</p>
            </div>
            <div className="p-3.5 rounded border border-app-border bg-app-surface">
              <span className="text-[10px] font-mono text-text-muted uppercase">Allocated Hours</span>
              <p className="text-base font-semibold text-text-primary font-mono mt-0.5">{plan.totalHours || 56} Hours</p>
            </div>
            <div className="p-3.5 rounded border border-app-border bg-app-surface">
              <span className="text-[10px] font-mono text-text-muted uppercase">Revision Buffer</span>
              <p className="text-base font-semibold text-indigo-lavender font-mono mt-0.5">Final 48h Locked</p>
            </div>
          </div>

          <div className="border border-app-border rounded bg-app-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-app-border bg-app-elevated/40 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary">Day-by-Day Study Routine</span>
              <span className="text-[11px] font-mono text-text-muted">Dynamic Priority Distribution</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-app-border text-[11px] font-mono text-text-muted bg-app-surface">
                  <tr>
                    <th className="px-4 py-2.5 font-normal">Day &bull; Date</th>
                    <th className="px-4 py-2.5 font-normal">Allocated Topic</th>
                    <th className="px-4 py-2.5 font-normal">Target Hours</th>
                    <th className="px-4 py-2.5 font-normal text-right">Phase Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border text-text-secondary">
                  {plan.schedule?.map((item, idx) => {
                    const isRevision = item.topic?.toLowerCase().includes("revision") || item.topic?.includes("Buffer");
                    return (
                      <tr key={idx} className="hover:bg-app-elevated/40 transition">
                        <td className="px-4 py-2.5 font-mono text-text-primary">Day {item.day} &bull; {item.date}</td>
                        <td className="px-4 py-2.5 font-medium text-text-primary">
                          {topicsMap[item.topic] || item.topic}
                        </td>
                        <td className="px-4 py-2.5 font-mono">{item.hours}h</td>
                        <td className="px-4 py-2.5 text-right font-mono text-[11px]">
                          {isRevision ? (
                            <span className="text-indigo-lavender font-medium">REVISION BUFFER</span>
                          ) : (
                            <span className="text-text-muted">CORE TOPIC</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
