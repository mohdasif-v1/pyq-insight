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
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-brand-primary text-dark-bg font-semibold hover:bg-brand-hover shadow-subtle",
    secondary: "bg-dark-surface border border-dark-border text-slate-200 hover:bg-dark-card hover:border-slate-500",
    danger: "bg-status-error/15 border border-status-error/30 text-status-error hover:bg-status-error/25",
    ghost: "text-slate-400 hover:text-slate-100 hover:bg-dark-surface/50",
    outline: "border border-dark-border text-slate-300 hover:border-brand-primary hover:text-brand-primary",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs sm:text-sm gap-2",
    lg: "px-5 py-2.5 text-sm gap-2.5",
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

export function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`rounded-xl border border-dark-border bg-dark-card p-5 sm:p-6 shadow-card ${
        hover ? "hover:border-dark-border/80 transition" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-dark-surface border-dark-border text-slate-300",
    primary: "bg-brand-primary/10 border-brand-primary/30 text-brand-primary",
    success: "bg-status-success/10 border-status-success/30 text-status-success",
    warning: "bg-status-warning/10 border-status-warning/30 text-status-warning",
    error: "bg-status-error/10 border-status-error/30 text-status-error",
  };

  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function Input({ label, error, helperText, className = "", ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-xs font-medium text-slate-300">{label}</label>}
      <input
        className={`w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-primary focus:outline-none transition ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-status-error font-medium">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-xs font-medium text-slate-300">{label}</label>}
      <select
        className={`w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-brand-primary focus:outline-none transition ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[11px] text-status-error font-medium">{error}</p>}
    </div>
  );
}
