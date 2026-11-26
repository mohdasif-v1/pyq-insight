"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Calendar, Clock, BookOpen, ArrowRight, Layers, Sparkles } from "lucide-react";

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
          const firstSubId = subs[0]._id;
          setForm((prev) => ({ ...prev, subjectId: firstSubId }));
          loadTopics(firstSubId);
          loadLatestPlan(firstSubId);
        }
      })
      .catch((err) => setError(err.message));

    const d = new Date();
    d.setDate(d.getDate() + 14);
    setForm((prev) => ({ ...prev, examDate: d.toISOString().split("T")[0] }));
  }, [router]);

  function loadTopics(subId) {
    if (!subId) return;
    api(`/subjects/${subId}/topics`)
      .then((tList) => {
        const map = Object.fromEntries(
          tList.map((t) => [
            String(t._id || t.id),
            {
              name: t.name,
              unit: t.unit || (t.unitNo ? `Unit ${t.unitNo}` : "General"),
              unitTitle: t.unitTitle,
            },
          ])
        );
        setTopicsMap(map);
      })
      .catch(() => {});
  }

  function loadLatestPlan(subId) {
    api(`/plan/latest?subjectId=${subId}`)
      .then((data) => {
        if (data && data.schedule) setPlan(data);
      })
      .catch(() => {
        // No existing plan saved yet, normal initial state
      });
  }

  function handleSubjectChange(subId) {
    setForm((prev) => ({ ...prev, subjectId: subId }));
    loadTopics(subId);
    loadLatestPlan(subId);
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

  // Calculate plan metrics
  const totalDays = plan?.schedule ? Math.max(...plan.schedule.map((s) => s.day || 1)) : 14;
  const totalHours = plan?.schedule
    ? plan.schedule.reduce((acc, s) => acc + (parseFloat(s.hours) || 0), 0).toFixed(1)
    : (14 * form.dailyHours).toFixed(1);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
      <div className="border-b border-canvas-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Adaptive Study Timetable</h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Dynamic knapsack algorithm allocating hours by topic credit weightage with mandatory final-day revision
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      {/* Constraints Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="border-b border-canvas-border pb-3">
          <h2 className="text-xs font-mono font-bold text-brand-lavender uppercase tracking-wider">
            Timetable Constraints &amp; Targets
          </h2>
        </div>

        <form onSubmit={generate} className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div className="space-y-1.5">
            <label className="block text-ink-secondary font-medium">Target Subject</label>
            <select
              value={form.subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id} className="bg-canvas-deep text-white">
                  {s.name} ({s.code || "Sem " + s.semester})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-ink-secondary font-medium">Exam Date</label>
            <input
              type="date"
              required
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-ink-secondary font-medium">Daily Study Hours</label>
            <input
              type="number"
              min={1}
              max={16}
              required
              value={form.dailyHours}
              onChange={(e) => setForm({ ...form, dailyHours: parseInt(e.target.value, 10) || 1 })}
              className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-royal via-brand-muted to-brand-royal text-white font-semibold text-xs shadow-cta hover:opacity-95 transition disabled:opacity-50"
            >
              {loading ? "Computing Knapsack Allocation..." : "Generate Optimized Schedule"}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Schedule Table */}
      {plan && plan.schedule && plan.schedule.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-panel p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-ink-muted uppercase">Total Study Days</span>
              <p className="text-xl font-bold text-white font-mono mt-0.5">{totalDays} Days</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-ink-muted uppercase">Allocated Hours</span>
              <p className="text-xl font-bold text-white font-mono mt-0.5">{totalHours} Hours</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-ink-muted uppercase">Revision Buffer</span>
              <p className="text-xl font-bold text-brand-lavender font-mono mt-0.5">Final 24–48h Locked</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-canvas-border">
            <div className="px-6 py-4 border-b border-canvas-border bg-canvas-elevated/40 flex items-center justify-between">
              <span className="text-xs font-bold text-white">Day-by-Day Schedule Routine</span>
              <span className="text-[11px] font-mono text-ink-muted">
                {plan.schedule.length} Study Sessions Allocated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-canvas-border text-[11px] font-mono text-ink-muted bg-canvas-elevated/40">
                  <tr>
                    <th className="px-6 py-3.5 font-normal">Day &bull; Date</th>
                    <th className="px-6 py-3.5 font-normal">Allocated Topic &amp; Unit</th>
                    <th className="px-6 py-3.5 font-normal">Target Hours</th>
                    <th className="px-6 py-3.5 font-normal text-right">Phase Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-border text-ink-secondary">
                  {plan.schedule.map((item, idx) => {
                    const rawTopicId = String(item.topic_id || item.topicId || item.topic || "");
                    const isRevision =
                      rawTopicId.toUpperCase() === "REVISION" ||
                      item.phase === "REVISION BUFFER" ||
                      (item.topicName && item.topicName.toLowerCase().includes("revision")) ||
                      (item.topic && item.topic.toLowerCase().includes("revision"));

                    // Topic name resolution:
                    // 1. Direct enriched item.topicName or item.topic if it's already a title
                    // 2. Lookup in topicsMap by topicId
                    // 3. Fallback to rawTopicId or "Topic not assigned"
                    let resolvedTopicName = "Topic not assigned";
                    let resolvedUnit = item.unit || "";

                    const mapped = topicsMap[rawTopicId];
                    if (isRevision) {
                      resolvedTopicName = "Final Revision & Buffer";
                      resolvedUnit = "All Syllabus Units";
                    } else if (item.topicName && item.topicName !== rawTopicId) {
                      resolvedTopicName = item.topicName;
                    } else if (mapped && mapped.name) {
                      resolvedTopicName = mapped.name;
                      if (!resolvedUnit) resolvedUnit = mapped.unit;
                    } else if (item.topic && item.topic !== rawTopicId) {
                      resolvedTopicName = item.topic;
                    } else if (mapped) {
                      resolvedTopicName = mapped.name || mapped;
                    }

                    return (
                      <tr key={idx} className="hover:bg-white/5 transition">
                        <td className="px-6 py-3.5 font-mono text-white whitespace-nowrap">
                          Day {item.day}
                          {item.date ? (
                            <span className="text-ink-muted text-[11px] ml-1.5 font-normal">
                              &bull; {item.date}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-white leading-snug">
                              {resolvedTopicName}
                            </p>
                            {resolvedUnit && (
                              <p className="text-[11px] font-mono text-brand-lavender/90">
                                {resolvedUnit}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-mono whitespace-nowrap text-white font-medium">
                          {item.hours}h
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono text-[11px] whitespace-nowrap">
                          {isRevision ? (
                            <span className="px-2.5 py-1 rounded-full bg-brand-royal border border-brand-lavender/40 text-brand-lavender font-semibold text-[10px]">
                              REVISION BUFFER
                            </span>
                          ) : (
                            <span className="text-ink-muted">CORE TOPIC</span>
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
