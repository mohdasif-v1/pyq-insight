"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/branding/Logo";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  ShieldCheck,
  LogOut,
  User,
  Menu,
  X,
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
    navLinks.push({ href: "/admin", label: "Admin Console", icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-app-border bg-app-surface/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
                      active
                        ? "bg-indigo-royal text-text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-app-elevated"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-indigo-lavender" : "text-text-muted"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="flex items-center gap-3 pl-3 ml-2 border-l border-app-border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-royal flex items-center justify-center text-text-primary">
                    <User className="w-3.5 h-3.5 text-indigo-lavender" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-medium text-text-primary leading-none">{user.name}</span>
                    <span className="text-[10px] text-text-muted uppercase font-mono leading-none mt-1">{user.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 text-text-muted hover:text-rose-400 hover:bg-app-elevated rounded transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-app-elevated rounded transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-medium bg-indigo-royal text-text-primary rounded hover:bg-indigo-muted transition"
                >
                  Get Started
                </Link>
              </div>
            )
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-app-border bg-app-surface px-4 py-3 space-y-1">
          {user ? (
            <>
              <div className="flex items-center gap-2 py-2 border-b border-app-border mb-2">
                <div className="w-7 h-7 rounded bg-indigo-royal flex items-center justify-center text-text-primary">
                  <User className="w-4 h-4 text-indigo-lavender" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-primary">{user.name}</p>
                  <p className="text-[10px] text-text-muted font-mono">{user.role}</p>
                </div>
              </div>

              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium ${
                      active
                        ? "bg-indigo-royal text-text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-app-elevated"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-rose-400 hover:bg-app-elevated transition mt-2 pt-2 border-t border-app-border"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 py-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-xs font-medium text-text-secondary hover:text-text-primary"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-xs font-medium bg-indigo-royal text-text-primary rounded"
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
