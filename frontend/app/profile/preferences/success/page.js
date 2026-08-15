"use client";

import { useRouter } from "next/navigation";

export default function PreferencesSuccessPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen w-full bg-[#f6f8f5] px-4 py-10">
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#6f9b6f] flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">MotiKeto Lift</span>
        </div>

        <div className="mt-8 w-full bg-white rounded-3xl shadow-sm p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#eaf3ea] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6f9b6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8.5 12.5l2.5 2.5 5-5" />
            </svg>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#6f9b6f]">
            Preferences Updated
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Your preferences have been saved.
          </h1>
          <p className="mt-2 text-gray-500">
            Your new food preferences will be applied to your next meal plan.
          </p>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="mt-6 w-full h-14 rounded-full bg-[#6f9b6f] text-white font-semibold hover:bg-[#5f8a5f] transition-colors"
          >
            Back to Profile
          </button>
        </div>
      </div>
    </main>
  );
}
