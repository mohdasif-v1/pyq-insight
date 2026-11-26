"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Logo from "@/components/branding/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api("/auth/register", { method: "POST", body: form, auth: false });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo size="default" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">Create an account</h1>
          <p className="text-xs text-slate-400">
            Student account for AKTU PYQ examination preparation
          </p>
        </div>

        <div className="rounded-xl border border-dark-border bg-dark-card p-6 shadow-card space-y-4">
          {error && (
            <div className="rounded-lg bg-status-error/10 border border-status-error/25 p-3 text-xs text-status-error font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-medium text-slate-300">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohd Asif"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-dark-border bg-dark-surface pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-primary focus:outline-none transition"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-slate-300">College Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="student@aktu.ac.in"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-dark-border bg-dark-surface pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-primary focus:outline-none transition"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-dark-border bg-dark-surface pl-9 pr-10 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-primary focus:outline-none transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-lg bg-brand-primary py-2.5 px-4 text-dark-bg font-semibold text-xs sm:text-sm hover:bg-brand-hover transition shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Creating account..." : "Register"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-brand-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
