import Link from "next/link";

export default function Logo({ showWordmark = true, className = "", size = "default" }) {
  const iconSize = size === "small" ? "w-6 h-6" : "w-7 h-7";
  const fontSize = size === "small" ? "text-xs" : "text-sm";

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 select-none transition ${className}`}>
      <div className={`relative ${iconSize} flex-shrink-0 rounded bg-indigo-royal border border-app-border flex items-center justify-center p-1`}>
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <path d="M8 24V8H16C18.7614 8 21 10.2386 21 13C21 15.7614 18.7614 18 16 18H8" stroke="#F5F3F8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 24L24 19" stroke="#C8ACD6" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="16" cy="13" r="1.5" fill="#C8ACD6"/>
        </svg>
      </div>
      {showWordmark && (
        <span className={`font-semibold tracking-tight text-text-primary flex items-center gap-1.5 ${fontSize}`}>
          <span>PYQ</span>
          <span className="text-text-muted font-normal tracking-wider text-[11px] uppercase">Insight</span>
        </span>
      )}
    </Link>
  );
}
