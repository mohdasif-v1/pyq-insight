import Link from "next/link";

export default function Logo({ showWordmark = true, className = "", size = "default" }) {
  const iconSize = size === "small" ? "w-6 h-6" : "w-8 h-8";
  const fontSize = size === "small" ? "text-sm" : "text-base";

  return (
    <Link href="/" className={`flex items-center gap-2.5 group transition ${className}`}>
      <div className={`relative ${iconSize} flex-shrink-0 rounded-lg bg-dark-secondary border border-dark-border flex items-center justify-center p-1 group-hover:border-brand-primary/50 transition`}>
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <path d="M8 8C8 6.89543 8.89543 6 10 6H18L24 12V24C24 25.1046 23.1046 26 22 26H10C8.89543 26 8 25.1046 8 24V8Z" fill="#151A23" stroke="#8B9CF6" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M18 6V12H24" stroke="#8B9CF6" strokeWidth="2" strokeLinejoin="round"/>
          <line x1="12" y1="16" x2="16" y2="16" stroke="#83B5C9" strokeWidth="1.75" strokeLinecap="round"/>
          <line x1="12" y1="20" x2="20" y2="20" stroke="#8B9CF6" strokeWidth="1.75" strokeLinecap="round"/>
          <circle cx="19" cy="15" r="1.5" fill="#78B99A" />
        </svg>
      </div>
      {showWordmark && (
        <span className={`font-semibold ${fontSize} tracking-tight text-slate-100 flex items-center`}>
          <span>PYQ</span>
          <span className="text-brand-primary ml-1 font-medium">Insight</span>
        </span>
      )}
    </Link>
  );
}
