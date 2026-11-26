"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import Logo from "@/components/branding/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api("/auth/login", { method: "POST", body: form, auth: false });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 pt-32 pb-20 bg-canvas-base bg-radial-hero bg-noise">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo size="default" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sign In to PYQ Insight</h1>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Access academic examination intelligence and topic priority analytics
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-7 sm:p-8 space-y-5 shadow-glass">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-ink-secondary font-medium">University Email</label>
              <input
                type="email"
                required
                placeholder="student@aktu.ac.in"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white placeholder:text-ink-muted focus:outline-none transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-ink-secondary font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl glass-input px-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-ink-muted focus:outline-none transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-ink-muted hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-royal via-brand-muted to-brand-royal text-white text-xs font-semibold shadow-cta hover:opacity-95 transition disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-canvas-border">
            <p className="text-xs text-ink-muted">
              Don't have an account?{" "}
              <Link href="/register" className="text-brand-lavender hover:text-white font-semibold transition">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
