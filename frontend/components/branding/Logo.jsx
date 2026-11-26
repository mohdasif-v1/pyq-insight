import Link from "next/link";

export default function Logo({ showWordmark = true, className = "", size = "default" }) {
  const iconSize = size === "small" ? "w-6 h-6" : "w-7 h-7";
  const fontSize = size === "small" ? "text-xs" : "text-sm";

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group transition select-none ${className}`}>
      <div className={`relative ${iconSize} flex-shrink-0 rounded-md bg-slate-900 border border-slate-750 flex items-center justify-center p-0.5 group-hover:border-slate-600 transition shadow-flat`}>
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <path d="M9 23V9H16.5C18.9853 9 21 11.0147 21 13.5C21 15.9853 18.9853 18 16.5 18H9" stroke="#F8FAFC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="16.5" cy="13.5" r="1.5" fill="#2563EB"/>
          <path d="M19 23L23 19" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="23" cy="19" r="1" fill="#38BDF8"/>
        </svg>
      </div>
      {showWordmark && (
        <span className={`font-bold tracking-tight text-slate-100 flex items-center gap-1.5 ${fontSize}`}>
          <span>PYQ</span>
          <span className="text-slate-400 font-normal tracking-normal text-xs uppercase">Insight</span>
        </span>
      )}
    </Link>
  );
}
