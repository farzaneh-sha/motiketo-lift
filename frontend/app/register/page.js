"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AvocadoLogo from "@/components/AvocadoLogo";
import { API_BASE_URL } from "@/lib/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegisterForm({ name, email, password }) {
  if (!name.trim() || !email.trim() || !password.trim()) {
    return "Please fill in all fields.";
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return "";
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validateRegisterForm({ name, email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(
          res.status === 400 && body?.detail
            ? body.detail
            : "Could not create account."
        );
        setLoading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem("user_id", String(data.id));
      router.push("/onboarding/proteins");
    } catch {
      setError("Could not create account.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm px-6 py-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="w-11 h-14 rounded-2xl flex items-center justify-center">
            <AvocadoLogo size={45} />
          </div>
          <h1 className="mt-2 text-base font-bold text-gray-900">MotiKeto Lift</h1>
        </div>

        {/* Heading */}
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
          <p className="mt-1 text-sm text-gray-500">
            Start your personalized nutrition journey.
          </p>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1.5">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              autoComplete="off"
              className="w-full h-11 rounded-lg bg-input px-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="text"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="off"
              className="w-full h-11 rounded-lg bg-input px-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary"
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
              placeholder="Create a password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full h-11 rounded-lg bg-input px-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary-hover transition-colors mt-1 disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-800 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
