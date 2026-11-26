"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import Logo from "@/components/branding/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", semester: 5 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/auth/register", { method: "POST", body: form, auth: false });
      const { token, user } = await api("/auth/login", {
        method: "POST",
        body: { email: form.email, password: form.password },
        auth: false,
      });
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
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-16 bg-app-bg">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-1.5">
          <div className="flex justify-center mb-2">
            <Logo size="default" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-text-primary">Create Student Account</h1>
          <p className="text-xs text-text-muted">
            Access exam patterns and adaptive revision schedules
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
              <label className="block text-text-secondary font-medium">Full Name</label>
              <input
                type="text"
                required
                placeholder="Mohd Asif"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded border border-app-border bg-app-input px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-indigo-lavender focus:outline-none transition"
              />
            </div>

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
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded border border-app-border bg-app-input px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-indigo-lavender focus:outline-none transition font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-text-secondary font-medium">Current Semester</label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value, 10) || 5 })}
                className="w-full rounded border border-app-border bg-app-input px-3 py-2 text-xs text-text-primary focus:border-indigo-lavender focus:outline-none transition font-mono"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded bg-indigo-royal text-text-primary text-xs font-medium hover:bg-indigo-muted transition disabled:opacity-50"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-app-border">
            <p className="text-xs text-text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-lavender hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
