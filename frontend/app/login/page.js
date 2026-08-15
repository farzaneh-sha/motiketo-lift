"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginForm({ email, password }) {
  if (!email.trim() || !password.trim()) {
    return "Please fill in all fields.";
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validateLoginForm({ email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem("user_id", String(data.user_id));
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#f6f8f5] px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm px-6 py-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="w-11 h-14 rounded-2xl bg-[#6f9b6f] flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" transform="rotate(45 12 12)" />
            </svg>
          </div>
          <h1 className="mt-2 text-base font-bold text-gray-900">MotiKeto Lift</h1>
        </div>

        {/* Heading */}
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to continue your nutrition journey.
          </p>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full h-11 rounded-lg bg-[#eef2ef] px-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#6f9b6f]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full h-11 rounded-lg bg-[#eef2ef] px-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#6f9b6f]"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-[#6f9b6f] text-white text-sm font-semibold shadow-sm hover:bg-[#5f8a5f] transition-colors mt-1 disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-gray-800 font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
