"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


const CLUSTER_INFO = {
  lower_concern: {
    label: "Balanced Eating Pattern",
    description:
      "Your answers reflect generally lower levels of concern across the eating-related patterns measured in this questionnaire.",
  },
  higher_concern: {
    label: "More Structured Support May Help",
    description:
      "Your answers reflect stronger patterns in some eating-related behaviors. Your plan and motivational messages will be personalized accordingly.",
  },
};

export default function ResultPage() {
  const router = useRouter();
  const [cluster, setCluster] = useState(null);

  useEffect(() => {
    setCluster(localStorage.getItem("behavior_cluster"));
  }, []);

  const clusterInfo = CLUSTER_INFO[cluster];

  return (
    <main className="min-h-screen w-full bg-[#f6f8f5] px-4 py-10">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#6f9b6f] flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">MotiKeto Lift</span>
        </div>

        {/* Completed badge */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#eaf3ea] px-4 py-2 text-sm font-medium text-[#4f7a52]">
          <span className="w-5 h-5 rounded-full bg-[#6f9b6f] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          Questionnaire Completed
        </div>

        {/* Illustration */}
        <div className="mt-10 w-40 h-40 rounded-full bg-[#eef4ee] flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-[#dcebdc] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6f9b6f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V10" />
              <path d="M12 10c0-4 3-6 6-6 0 4-2 6-6 6z" />
              <path d="M12 14c0-3-2.5-5-5.5-5 0 3 1.8 5 5.5 5z" />
            </svg>
          </div>
        </div>

        {clusterInfo ? (
          <>
            {/* Profile label */}
            <div className="mt-8 inline-flex items-center rounded-full border border-[#c9ddc9] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#4f7a52]">
              {clusterInfo.label}
            </div>

            {/* Heading */}
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Your Behavioral Profile</h1>
            <p className="mt-3 text-gray-500">{clusterInfo.description}</p>
          </>
        ) : (
          <p className="mt-8 text-sm text-red-500">Behavioral profile not available.</p>
        )}

        {/* Info card */}
        <div className="mt-8 w-full bg-white rounded-2xl shadow-sm p-6 flex items-start gap-4 text-left">
          <span className="w-9 h-9 shrink-0 rounded-full bg-[#eaf3ea] text-[#6f9b6f] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="11" x2="12" y2="16" />
              <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <p className="text-gray-600">
            Your food preferences will be used to create your personalized monthly meal
            plan. Your behavioral profile will help personalize your motivational messages.
          </p>
        </div>

        {/* Primary button */}
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-8 w-full h-14 rounded-full bg-[#6f9b6f] text-white font-semibold hover:bg-[#5f8a5f] transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </main>
  );
}
