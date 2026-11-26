import Link from "next/link";

export default function Logo({ showWordmark = true, className = "", size = "default" }) {
  const iconSize = size === "small" ? "w-6 h-6" : "w-7 h-7";
  const fontSize = size === "small" ? "text-xs" : "text-sm";

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 select-none transition group ${className}`}>
      <div className={`relative ${iconSize} flex-shrink-0 rounded-lg bg-canvas-elevated border border-canvas-border flex items-center justify-center p-1 group-hover:border-brand-lavender/40 transition-all shadow-glass`}>
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <path d="M9 23V9H16.2C18.851 9 21 11.0147 21 13.5C21 15.9853 18.851 18 16.2 18H9" stroke="#F8FAFC" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="16.2" cy="13.5" r="1.6" fill="#C8ACD6"/>
          <path d="M19 23L23.5 18.5" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round"/>
          <circle cx="23.5" cy="18.5" r="1.2" fill="#38BDF8"/>
        </svg>
      </div>
      {showWordmark && (
        <span className={`font-bold tracking-tight text-white flex items-center gap-1.5 ${fontSize}`}>
          <span className="tracking-tight">PYQ</span>
          <span className="text-brand-lavender font-medium tracking-wider text-[11px] uppercase">Insight</span>
        </span>
      )}
    </Link>
  );
}
