'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [year, setYear] = useState('2023');
  const [session, setSession] = useState('REGULAR');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const loadData = () => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(rawUser);
    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    Promise.all([
      apiRequest('/analytics/admin/stats'),
      apiRequest('/subjects'),
      apiRequest('/review-queue'),
    ])
      .then(([statsRes, subjectsRes, reviewRes]) => {
        setStats(statsRes.data);
        setSubjects(subjectsRes.data || []);
        if (subjectsRes.data?.length > 0) {
          setSelectedSubject(subjectsRes.data[0]._id);
        }
        setReviewQueue(reviewRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedSubject) {
      alert('Please select a subject and valid PDF file');
      return;
    }

    setUploading(true);
    setUploadSuccess('');
    try {
      const formData = new FormData();
      formData.append('subjectId', selectedSubject);
      formData.append('year', year);
      formData.append('session', session);
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/papers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadSuccess('Paper uploaded and enqueued for extraction successfully!');
      setFile(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleVerifyMapping = async (questionId: string, topicId: string) => {
    try {
      await apiRequest(`/questions/${questionId}/review`, {
        method: 'POST',
        body: JSON.stringify({ topicId, action: 'VERIFY' }),
      });
      setReviewQueue(reviewQueue.filter((q) => q._id !== questionId));
      loadData();
    } catch (err: any) {
      alert(err.message || 'Mapping verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-slate-900">PYQ Insight</span>
            <span className="text-xs bg-red-100 text-red-900 font-semibold px-2 py-0.5 rounded-full">
              Admin Control Center
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xs text-blue-900 font-medium hover:underline">
              Switch to Student View
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
        {/* System Health / Overview Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 uppercase font-semibold">Total Papers</div>
            <div className="text-3xl font-extrabold text-blue-900 mt-1">{stats?.totalPapers ?? 0}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 uppercase font-semibold">Extracted Questions</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.totalQuestions ?? 0}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 uppercase font-semibold">Pending Reviews</div>
            <div className="text-3xl font-extrabold text-amber-600 mt-1">{stats?.pendingReviews ?? 0}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 uppercase font-semibold">Active Jobs</div>
            <div className="text-3xl font-extrabold text-green-700 mt-1">{stats?.activeJobs ?? 0}</div>
          </div>
        </div>

        {/* Paper Ingestion Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Upload AKTU Previous Year Question Paper</h2>
          <p className="text-xs text-slate-500 mb-6">
            Upload genuine university PDFs. The backend queue will segment questions and map them to syllabus units.
          </p>

          {uploadSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg font-medium">
              {uploadSuccess}
            </div>
          )}

          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
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
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Exam Year</label>
              <input
                type="number"
                min="2015"
                max="2030"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium"
              >
                <option value="REGULAR">Regular Semester</option>
                <option value="CARRY_OVER">Carry Over Exam</option>
                <option value="SPECIAL">Special Exam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">PDF File</label>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100"
              />
            </div>

            <div className="md:col-span-4 mt-2">
              <button
                type="submit"
                disabled={uploading}
                className="py-2.5 px-6 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm rounded-lg transition shadow-sm disabled:opacity-50"
              >
                {uploading ? 'Uploading & Enqueuing...' : 'Upload & Process Paper'}
              </button>
            </div>
          </form>
        </div>

        {/* Low Confidence Mapping Review Queue */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Low-Confidence Question Review Queue</h2>
            <span className="text-xs text-slate-500">{reviewQueue.length} Flagged</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading review queue...</div>
          ) : reviewQueue.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No questions require manual review. All extracted questions meet the confidence threshold.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviewQueue.map((q) => (
                <div key={q._id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-500">
                        {q.paperId?.year} ({q.paperId?.session}) - Q{q.questionNumber}{q.subQuestionNumber ? `(${q.subQuestionNumber})` : ''}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        Confidence: {Math.round((q.mappingConfidence || 0) * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-slate-900 mt-1 font-medium">{q.originalText}</p>
                  </div>

                  {q.topicId && (
                    <button
                      onClick={() => handleVerifyMapping(q._id, q.topicId)}
                      className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Verify Suggested Topic
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
