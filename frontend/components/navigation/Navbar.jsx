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
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch {}
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
    { href: "/dashboard", label: "Intelligence", icon: LayoutDashboard },
    { href: "/planner", label: "Study Plan", icon: Calendar },
    { href: "/practice", label: "PYQ Clusters", icon: Layers },
  ];

  if (user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin Console", icon: ShieldCheck });
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-canvas-base/80 backdrop-blur-xl border-b border-canvas-border py-3 shadow-glass"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Logo size="default" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-canvas-surface/80 border border-canvas-border backdrop-blur-md">
          {user ? (
            <>
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      active
                        ? "text-ink-primary font-semibold"
                        : "text-ink-muted hover:text-ink-primary hover:bg-white/5"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="navPill"
                        className="absolute inset-0 rounded-full bg-brand-royal/80 border border-brand-lavender/30 shadow-glow"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <Icon className={`relative z-10 w-3.5 h-3.5 ${active ? "text-brand-lavender" : "text-ink-muted"}`} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}

              <div className="flex items-center gap-3 pl-3 pr-2 border-l border-canvas-border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-royal to-brand-muted border border-brand-lavender/30 flex items-center justify-center text-ink-primary">
                    <User className="w-3.5 h-3.5 text-brand-lavender" />
                  </div>
                  <span className="text-xs font-medium text-ink-primary">{user.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 text-ink-muted hover:text-rose-400 hover:bg-white/5 rounded-full transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-2 px-1">
                <Link
                  href="/login"
                  className="px-4 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="relative group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-royal to-brand-muted text-xs font-semibold text-white shadow-cta hover:opacity-95 transition"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink-secondary hover:text-ink-primary rounded-lg border border-canvas-border bg-canvas-surface/80"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass-panel mx-4 mt-2 p-4 rounded-2xl space-y-3"
          >
            {user ? (
              <>
                <div className="flex items-center gap-2.5 pb-3 border-b border-canvas-border">
                  <div className="w-8 h-8 rounded-full bg-brand-royal flex items-center justify-center text-ink-primary">
                    <User className="w-4 h-4 text-brand-lavender" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-primary">{user.name}</p>
                    <p className="text-[10px] text-ink-muted font-mono">{user.role}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {navLinks.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium ${
                          active
                            ? "bg-brand-royal text-ink-primary font-semibold"
                            : "text-ink-secondary hover:text-ink-primary hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition pt-3 border-t border-canvas-border"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="space-y-2 py-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs font-medium text-ink-secondary hover:text-ink-primary"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 text-xs font-semibold bg-gradient-to-r from-brand-royal to-brand-muted text-white rounded-xl shadow-cta"
                >
                  Get Started
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
