"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/branding/Logo";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  User,
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
    { href: "/planner", label: "Study Planner", icon: Calendar },
    { href: "/practice", label: "PYQ Practice", icon: Layers },
  ];

  if (user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin Console", icon: ShieldAlert });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/90 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Logo size="default" />

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      active
                        ? "bg-slate-850 text-white border border-slate-750"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="flex items-center gap-3 pl-4 ml-2 border-l border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-850 border border-slate-750 flex items-center justify-center text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-medium text-slate-200 leading-none">{user.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono leading-none mt-1">{user.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded transition"
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
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-md transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-500 transition shadow-sm font-semibold"
                >
                  Get Started
                </Link>
              </div>
            )
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-900"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-2">
          {user ? (
            <>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 px-1">
                <div className="w-7 h-7 rounded bg-slate-850 border border-slate-750 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200">{user.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">{user.role}</p>
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
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                        active
                          ? "bg-slate-850 text-white border border-slate-750"
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/20 rounded-md w-full text-left"
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
                className="w-full text-center px-4 py-2 text-xs font-medium text-slate-300 border border-slate-800 rounded-md bg-slate-900"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
