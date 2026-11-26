export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const base = "inline-flex items-center justify-center font-medium rounded transition select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-indigo-royal text-text-primary hover:bg-indigo-muted",
    secondary: "bg-app-elevated border border-app-border text-text-secondary hover:text-text-primary",
    danger: "bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-app-elevated",
    outline: "border border-app-border text-text-secondary hover:border-indigo-lavender hover:text-text-primary",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-4 py-2 text-xs sm:text-sm gap-2",
    lg: "px-5 py-2.5 text-sm gap-2",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded border border-app-border bg-app-surface p-5 space-y-4 ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-app-elevated border-app-border text-text-secondary",
    primary: "bg-indigo-royal text-indigo-lavender border-indigo-muted",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    error: "bg-rose-500/10 border-rose-500/20 text-rose-300",
  };

  return (
    <span
      className={`inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function Input({ label, error, helperText, className = "", ...props }) {
  return (
    <div className="space-y-1 w-full text-xs">
      {label && <label className="block font-medium text-text-secondary">{label}</label>}
      <input
        className={`w-full rounded border border-app-border bg-app-input px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-indigo-lavender focus:outline-none transition ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-text-muted">{helperText}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="space-y-1 w-full text-xs">
      {label && <label className="block font-medium text-text-secondary">{label}</label>}
      <select
        className={`w-full rounded border border-app-border bg-app-input px-3 py-2 text-xs text-text-primary focus:border-indigo-lavender focus:outline-none transition ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
