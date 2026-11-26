"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
    <form onSubmit={handleSubmit} className="mx-auto mt-20 max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
      <p className="text-xs text-slate-500">Student account for AKTU PYQ exam preparation</p>
      {error && <p className="text-sm rounded bg-red-50 p-2 text-red-600 border border-red-200">{error}</p>}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
        <input
          className="w-full rounded border p-2 text-sm focus:outline-indigo-500"
          type="text"
          placeholder="e.g. Mohd Asif"
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">College Email</label>
        <input
          className="w-full rounded border p-2 text-sm focus:outline-indigo-500"
          type="email"
          placeholder="student@aktu.ac.in"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
        <input
          className="w-full rounded border p-2 text-sm focus:outline-indigo-500"
          type="password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>
      <button
        disabled={loading}
        className="w-full rounded bg-indigo-600 p-2.5 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? "Creating..." : "Register"}
      </button>
      <p className="text-center text-xs text-slate-600 pt-2">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
