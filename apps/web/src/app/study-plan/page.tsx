'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

function StudyPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId') || '';

  const [subjectId, setSubjectId] = useState(initialSubjectId);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [examDate, setExamDate] = useState('2026-12-15');
  const [dailyHours, setDailyHours] = useState(3);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    apiRequest('/subjects')
      .then((res) => {
        setSubjects(res.data || []);
        if (!subjectId && res.data?.length > 0) {
          setSubjectId(res.data[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, [subjectId]);

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    apiRequest(`/subjects/${subjectId}/syllabus`)
      .then((res) => {
        const allTopics = res.data?.units?.flatMap((u: any) => u.topics) || [];
        setTopics(allTopics);
      })
      .catch((err) => console.error(err));

    apiRequest(`/study-plans/subjects/${subjectId}`)
      .then((res) => setStudyPlan(res.data))
      .catch(() => setStudyPlan(null))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await apiRequest('/study-plans', {
        method: 'POST',
        body: JSON.stringify({
          subjectId,
          examDate,
          dailyHours: Number(dailyHours),
          weakTopicIds: weakTopics,
        }),
      });
      setStudyPlan(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to generate study plan');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (taskIndex: number) => {
    if (!studyPlan) return;
    try {
      const res = await apiRequest(`/study-plans/${studyPlan._id}/tasks/${taskIndex}/toggle`, {
        method: 'PATCH',
      });
      setStudyPlan(res.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 text-sm font-medium">
              &larr; Back to Dashboard
            </Link>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-slate-900">Personalised Study Planner</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Planner Configuration Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 h-fit space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Schedule Parameters</h2>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic greedy scheduler prioritises high-probability & weak topics.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium"
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Upcoming Examination Date
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Available Study Hours per Day
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                required
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Flag Weak Topics (+50% Priority Boost)
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-2 bg-slate-50">
                {topics.map((t) => (
                  <label key={t._id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={weakTopics.includes(t._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWeakTopics([...weakTopics, t._id]);
                        } else {
                          setWeakTopics(weakTopics.filter((id) => id !== t._id));
                        }
                      }}
                      className="rounded text-blue-900"
                    />
                    <span>{t.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm rounded-lg transition shadow-sm disabled:opacity-50"
            >
              {generating ? 'Calculating Schedule...' : 'Generate Plan'}
            </button>
          </form>
        </div>

        {/* Schedule Display */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Your Actionable Study Schedule</h2>
            {studyPlan && (
              <span className="text-xs text-slate-500 font-medium">
                {studyPlan.schedule.filter((t: any) => t.completed).length} / {studyPlan.schedule.length} Completed
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">Loading schedule...</div>
          ) : !studyPlan || studyPlan.schedule.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No study plan generated yet. Configure your exam date and click &quot;Generate Plan&quot;.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {studyPlan.schedule.map((task: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`p-4 flex items-center justify-between gap-4 transition ${
                    task.completed ? 'bg-slate-50/80 opacity-75' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(idx)}
                      className="h-4 w-4 rounded text-blue-900 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-500">{task.date}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          task.taskType === 'REVISION' ? 'bg-purple-100 text-purple-800' :
                          task.taskType === 'PRACTICE' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {task.taskType}
                        </span>
                      </div>
                      <div className={`text-sm font-medium mt-0.5 ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.topicName}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {task.durationMinutes} mins
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function StudyPlanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading planner...</div>}>
      <StudyPlanContent />
    </Suspense>
  );
}
