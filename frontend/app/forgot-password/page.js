"use client";

import { useState } from "react";
import Link from "next/link";
import AvocadoLogo from "@/components/AvocadoLogo";
import { API_BASE_URL } from "@/lib/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForgotPasswordForm({ email, newPassword, confirmPassword }) {
  if (!email.trim() || !newPassword.trim() || !confirmPassword.trim()) {
    return "Please fill in all fields.";
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  if (newPassword.length < 6) {
    return "Password must be at least 6 characters.";
  }
  if (newPassword !== confirmPassword) {
    return "Passwords do not match.";
  }
  return "";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validateForgotPasswordForm({ email, newPassword, confirmPassword });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), new_password: newPassword }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(
          res.status === 404 && body?.detail
            ? body.detail
            : "Could not reset password."
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError("Could not reset password.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm px-6 py-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="w-11 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <AvocadoLogo size={45} />
          </div>
          <h1 className="mt-2 text-base font-bold text-gray-900">MotiKeto Lift</h1>
        </div>

        {success ? (
          <>
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Password Updated</h2>
              <p className="mt-1 text-sm text-gray-500">
                Your password has been reset successfully. You can now sign in with your new
                password.
              </p>
            </div>

            <Link
              href="/login"
              className="mt-6 flex items-center justify-center w-full h-11 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary-hover transition-colors"
            >
              Back to Sign In
            </Link>
          </>
        ) : (
          <>
            {/* Heading */}
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter your email and choose a new password.
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
                  placeholder="Enter your registered email"
                  required
                  className="w-full h-11 rounded-lg bg-input px-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-800 mb-1.5">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter a new password"
                  required
                  minLength={6}
                  className="w-full h-11 rounded-lg bg-input px-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-800 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  minLength={6}
                  className="w-full h-11 rounded-lg bg-input px-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary-hover transition-colors mt-1 disabled:opacity-70"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              Remembered your password?{" "}
              <Link href="/login" className="text-gray-800 font-medium">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
