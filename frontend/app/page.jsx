import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
        AKTU Examination Intelligence
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
        Master Previous Year Questions with <span className="text-indigo-600">PYQ Insight</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Automated topic mapping, recurring question clustering, unit-wise priority heatmaps,
        and greedy schedule generation for B.Tech semester exams.
      </p>

      <div className="flex justify-center gap-4 pt-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm"
        >
          Open Dashboard
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}
