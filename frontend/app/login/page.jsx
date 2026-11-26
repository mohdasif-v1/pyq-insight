"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
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
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-16 bg-app-bg">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-1.5">
          <div className="flex justify-center mb-2">
            <Logo size="default" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-text-primary">Sign In to PYQ Insight</h1>
          <p className="text-xs text-text-muted">
            Academic examination intelligence and topic priority analytics
          </p>
        </div>

        <div className="rounded border border-app-border bg-app-surface p-6 space-y-4">
          {error && (
            <div className="rounded border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block text-text-secondary font-medium">Email Address</label>
              <input
                type="email"
                required
                placeholder="student@aktu.ac.in"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded border border-app-border bg-app-input px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-indigo-lavender focus:outline-none transition font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-text-secondary font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded border border-app-border bg-app-input px-3 pr-8 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-indigo-lavender focus:outline-none transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded bg-indigo-royal text-text-primary text-xs font-medium hover:bg-indigo-muted transition disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-app-border">
            <p className="text-xs text-text-muted">
              Don't have an account?{" "}
              <Link href="/register" className="text-indigo-lavender hover:underline font-medium">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
