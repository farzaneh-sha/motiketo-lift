"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import AvocadoLogo from "@/components/AvocadoLogo";

const FREQUENCY_OPTIONS = [
  {
    value: "every_minute",
    label: "Every minute (for testing)",
    description: "Receive a message every minute",
  },
  {
    value: "daily",
    label: "Daily",
    description: "Receive a message every day",
  },
  {
    value: "every_2_days",
    label: "Every 2 days",
    description: "Receive a message every two days",
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "Receive a message once a week",
  },
  {
    value: "biweekly",
    label: "Every 2 weeks",
    description: "Receive a message every two weeks",
  },
  {
    value: "monthly",
    label: "Monthly",
    description: "Receive a message once a month",
  },
];

export default function ResultPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUserId(localStorage.getItem("user_id"));
  }, []);

  async function handleContinue() {
    if (!selectedFrequency) return;

    setError("");
    setSaving(true);

    try {
      const frequencyRes = await fetch(`${API_BASE_URL}/users/${userId}/message-frequency`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_frequency: selectedFrequency }),
      });

      if (!frequencyRes.ok) {
        setError("Could not save your message frequency.");
        setSaving(false);
        return;
      }
    } catch {
      setError("Could not save your message frequency.");
      setSaving(false);
      return;
    }

    try {
      const mealPlanRes = await fetch(`${API_BASE_URL}/users/${userId}/meal-plan`);
      if (mealPlanRes.status === 404) {
        const createRes = await fetch(`${API_BASE_URL}/users/${userId}/meal-plans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!createRes.ok) {
          setError("Could not create your meal plan.");
          setSaving(false);
          return;
        }
      } else if (!mealPlanRes.ok) {
        setError("Could not verify your meal plan.");
        setSaving(false);
        return;
      }
    } catch {
      setError("Could not create your meal plan.");
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  }

  const canContinue = Boolean(selectedFrequency) && !saving;

  return (
    <main className="min-h-screen w-full bg-background px-4 py-10">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <AvocadoLogo size={30}/>
          <span className="text-lg font-bold text-gray-900">MotiKeto Lift</span>
        </div>

        {/* Completed badge */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-2 text-sm font-medium text-primary-dark">
          <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          Questionnaire Completed
        </div>

        {/* Heading */}
        <h1 className="mt-8 text-3xl font-bold text-gray-900">Thank you for answering!</h1>
        <p className="mt-3 text-gray-500">
          Your answers help us create personalized, motivational messages that support you on
          your journey.
        </p>

        {/* Frequency selection card */}
        <div className="mt-8 w-full bg-white rounded-3xl shadow-sm p-6 sm:p-8 text-left">
          <h2 className="text-xl font-bold text-gray-900">
            How often would you like to receive your motivational messages?
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Choose the frequency that works best for you.
          </p>

          <div className="mt-6 space-y-3">
            {FREQUENCY_OPTIONS.map((option) => {
              const isSelected = selectedFrequency === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedFrequency(option.value)}
                  className={`w-full flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-colors ${
                    isSelected
                      ? "bg-primary-light border-primary"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-primary" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </span>
                  <span>
                    <span
                      className={`block font-semibold ${
                        isSelected ? "text-[#3f6b42]" : "text-gray-900"
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className="block text-sm text-gray-500">{option.description}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}

          <button
            type="button"
            disabled={!canContinue}
            onClick={handleContinue}
            className={`mt-6 w-full h-12 rounded-xl font-semibold transition-colors ${
              canContinue
                ? "bg-primary text-white hover:bg-primary-hover cursor-pointer"
                : "bg-disabled text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Saving..." : "Go to Dashboard →"}
          </button>
        </div>
      </div>
    </main>
  );
}
