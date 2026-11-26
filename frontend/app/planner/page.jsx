"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

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
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Adaptive Study Planner</h1>
        <p className="text-sm text-slate-500 mt-1">
          Greedy schedule distribution: high priority and weak topics receive more hours, ending with a dedicated revision day.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={generate} className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Exam Date</label>
            <input
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              type="date"
              required
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Study Hours</label>
            <input
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              type="number"
              min="1"
              max="14"
              value={form.dailyHours}
              required
              onChange={(e) => setForm({ ...form, dailyHours: e.target.value })}
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
        >
          {loading ? "Generating Schedule..." : "Generate Optimal Study Plan"}
        </button>
      </form>

      {plan && (
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-slate-900">Your Study Schedule</h2>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Exam Date: {new Date(plan.examDate).toLocaleDateString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Topic / Session</th>
                  <th className="py-3 px-4">Allocated Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {plan.schedule.map((s, i) => {
                  const isRev = s.topic_id === "REVISION";
                  const topicName = isRev ? "🎯 Final Comprehensive Revision" : (topicsMap[s.topic_id] || s.topic_id);
                  return (
                    <tr key={i} className={isRev ? "bg-amber-50 font-semibold" : "hover:bg-slate-50"}>
                      <td className="py-3 px-4 font-medium text-slate-900">Day {s.day}</td>
                      <td className="py-3 px-4">{topicName}</td>
                      <td className="py-3 px-4 font-semibold text-indigo-600">{s.hours} hrs</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
