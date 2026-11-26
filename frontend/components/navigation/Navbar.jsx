"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/branding/Logo";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  UserRound,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch {}
    }
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/login");
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/planner", label: "Planner", icon: CalendarDays },
    { href: "/practice", label: "Practice", icon: ClipboardList },
  ];

  if (user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-dark-border bg-dark-bg/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Logo size="default" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {user ? (
            <>
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      active
                        ? "bg-dark-surface text-brand-primary border border-dark-border"
                        : "text-slate-400 hover:text-slate-100 hover:bg-dark-surface/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="flex items-center gap-3 pl-4 ml-2 border-l border-dark-border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center text-slate-300">
                    <UserRound className="w-3.5 h-3.5 text-brand-primary" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-medium text-slate-200 leading-none">{user.name}</span>
                    <span className="text-[10px] text-slate-500 capitalize leading-none mt-1">{user.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-status-error hover:bg-status-error-muted rounded-md transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-dark-surface rounded-lg transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-xs font-medium bg-brand-primary text-dark-bg rounded-lg hover:bg-brand-hover transition font-semibold"
                >
                  Create account
                </Link>
              </div>
            )
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-dark-surface"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-dark-border bg-dark-secondary px-4 py-4 space-y-2">
          {user ? (
            <>
              <div className="flex items-center gap-2.5 pb-3 border-b border-dark-border px-1">
                <div className="w-7 h-7 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center">
                  <UserRound className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200">{user.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        active
                          ? "bg-dark-surface text-brand-primary border border-dark-border"
                          : "text-slate-400 hover:text-slate-200 hover:bg-dark-surface/40"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-dark-border">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-status-error hover:bg-status-error-muted rounded-lg w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-xs font-medium text-slate-200 border border-dark-border rounded-lg"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-xs font-semibold bg-brand-primary text-dark-bg rounded-lg"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
