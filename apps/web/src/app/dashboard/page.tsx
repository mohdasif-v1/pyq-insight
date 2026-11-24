'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(rawUser));

    apiRequest('/subjects')
      .then((res) => {
        setSubjects(res.data || []);
        if (res.data?.length > 0) {
          setSelectedSubject(res.data[0]._id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!selectedSubject) return;
    setLoading(true);
    apiRequest(`/analytics/subjects/${selectedSubject}`)
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedSubject]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-slate-900">PYQ Insight</span>
            <span className="text-xs bg-blue-100 text-blue-900 font-semibold px-2 py-0.5 rounded-full">
              Student Workspace
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600 font-medium">Hello, {user?.name || 'Student'}</span>
            <Link 
              href={`/study-plan?subjectId=${selectedSubject}`} 
              className="text-xs font-semibold bg-blue-900 text-white px-3 py-1.5 rounded hover:bg-blue-800 transition"
            >
              Study Planner
            </Link>
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Exam Intelligence & Topic Heatmap</h1>
            <p className="text-sm text-slate-500 mt-1">
              Deterministic priority weights computed from frequency, recency, and marks weightage.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select AKTU Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name} (Sem {s.semester})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Coverage Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 uppercase font-semibold">Analyzed Papers</div>
            <div className="text-3xl font-extrabold text-blue-900 mt-1">
              {analytics?.papersAnalyzed ?? 0}
            </div>
            <div className="text-xs text-slate-400 mt-1">Verified university sessions</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 uppercase font-semibold">Extracted Questions</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {analytics?.totalQuestions ?? 0}
            </div>
            <div className="text-xs text-slate-400 mt-1">Segmented & mapped to syllabus</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 uppercase font-semibold">High Priority Topics</div>
            <div className="text-3xl font-extrabold text-green-700 mt-1">
              {analytics?.heatmap?.filter((h: any) => h.category === 'HIGH').length ?? 0}
            </div>
            <div className="text-xs text-slate-400 mt-1">Highest frequency and marks share</div>
          </div>
        </div>

        {/* Topic Importance Heatmap Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Topic Importance Priority Heatmap</h2>
            <span className="text-xs text-slate-500">Normalised 0-100% Score</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">Loading topic analytics...</div>
          ) : analytics?.heatmap?.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No examination papers have been analyzed for this subject yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Unit</th>
                    <th className="px-6 py-3">Topic Name</th>
                    <th className="px-6 py-3">Priority Score</th>
                    <th className="px-6 py-3">Frequency</th>
                    <th className="px-6 py-3">Recency</th>
                    <th className="px-6 py-3">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics?.heatmap?.map((item: any) => (
                    <tr key={item.topicId} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-500">Unit {item.unitNo}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{item.topicName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.category === 'HIGH' ? 'bg-blue-800' : item.category === 'MEDIUM' ? 'bg-amber-500' : 'bg-slate-400'
                              }`} 
                              style={{ width: `${Math.min(100, item.finalScore)}%` }}
                            />
                          </div>
                          <span className="font-bold text-xs">{item.finalScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{Math.round(item.frequency * 100)}%</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{Math.round(item.recency * 100)}%</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          item.category === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' :
                          item.category === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
