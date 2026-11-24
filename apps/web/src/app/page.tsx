import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              P
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">PYQ Insight</span>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full ml-1">AKTU B.Tech</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
              Log In
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 lg:py-28 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            NLP Powered Academic Intelligence
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
            Understand Previous Year Questions. <br className="hidden sm:inline" />
            <span className="text-blue-900">Prioritise Smarter. Prepare Better.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate exam uncertainty. Our platform analyses historical AKTU examination papers using natural language processing to reveal high-probability topics and generate personalised study schedules.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="px-6 py-3.5 rounded-lg bg-blue-900 text-white font-semibold text-base hover:bg-blue-800 transition shadow-md"
            >
              Explore AKTU Papers & Syllabus
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-3.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold text-base hover:bg-slate-50 transition"
            >
              Sign In to Your Dashboard
            </Link>
          </div>
        </section>

        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
              <div className="text-blue-900 font-bold text-lg mb-2">1. Automated Paper Ingestion</div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Upload raw university exam PDFs. Our system accurately segments questions, sub-questions, and marks schemes without manual labor.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
              <div className="text-blue-900 font-bold text-lg mb-2">2. NLP Topic Mapping</div>
              <p className="text-slate-600 text-sm leading-relaxed">
                TF-IDF and cosine similarity algorithms map extracted questions to exact AKTU syllabus units, identifying repeated examination questions across years.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
              <div className="text-blue-900 font-bold text-lg mb-2">3. Deterministic Study Planner</div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Calculates topic importance using frequency, paper recency, and marks weightage. Generates day-by-day revision schedules tailored to your weak areas.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        PYQ Insight &copy; 2026. Designed for AKTU B.Tech Computer Science and Engineering students.
      </footer>
    </div>
  );
}
