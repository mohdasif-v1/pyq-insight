"use client";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
              <span>📚 PYQ Insight</span>
            </Link>

            <nav className="flex items-center gap-4 text-sm font-medium">
              {user ? (
                <>
                  <Link href="/dashboard" className={`hover:text-indigo-600 ${pathname === "/dashboard" ? "text-indigo-600 font-bold" : ""}`}>
                    Dashboard
                  </Link>
                  <Link href="/planner" className={`hover:text-indigo-600 ${pathname === "/planner" ? "text-indigo-600 font-bold" : ""}`}>
                    Planner
                  </Link>
                  <Link href="/practice" className={`hover:text-indigo-600 ${pathname === "/practice" ? "text-indigo-600 font-bold" : ""}`}>
                    Practice
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" className={`hover:text-indigo-600 ${pathname === "/admin" ? "text-indigo-600 font-bold" : ""}`}>
                      Admin
                    </Link>
                  )}
                  <div className="flex items-center gap-3 pl-4 border-l">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-semibold capitalize">
                      {user.role}
                    </span>
                    <span className="text-sm text-slate-600">{user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium ml-2"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                !isAuthPage && (
                  <div className="flex items-center gap-3">
                    <Link href="/login" className="px-3 py-1.5 text-sm text-slate-700 hover:text-indigo-600">
                      Log in
                    </Link>
                    <Link href="/register" className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
                      Register
                    </Link>
                  </div>
                )
              )}
            </nav>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t bg-white py-4 text-center text-xs text-slate-500">
          PYQ Insight &bull; B.Tech Examination Analytics &amp; Adaptive Study Planner
        </footer>
      </body>
    </html>
  );
}
