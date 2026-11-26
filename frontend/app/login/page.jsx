"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
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
    <form onSubmit={handleSubmit} className="mx-auto mt-20 max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Log in to PYQ Insight</h1>
      <p className="text-xs text-slate-500">Access topic heatmaps, trends, and revision schedules</p>
      {error && <p className="text-sm rounded bg-red-50 p-2 text-red-600 border border-red-200">{error}</p>}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
        <input
          className="w-full rounded border p-2 text-sm focus:outline-indigo-500"
          type="email"
          placeholder="admin@pyqinsight.edu or student"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
        <input
          className="w-full rounded border p-2 text-sm focus:outline-indigo-500"
          type="password"
          placeholder="••••••••"
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>
      <button
        disabled={loading}
        className="w-full rounded bg-indigo-600 p-2.5 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Log in"}
      </button>
      <p className="text-center text-xs text-slate-600 pt-2">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
