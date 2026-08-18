"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { API_BASE_URL } from "@/lib/api";

const OPTIONS = [
  { label: "Not at all", value: "not_at_all" },
  { label: "A little", value: "a_little" },
  { label: "About half", value: "about_half" },
  { label: "Mostly", value: "mostly" },
  { label: "Completely", value: "completely" },
];

export default function WeeklyCheckinPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [mealPlanId, setMealPlanId] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [weekState, setWeekState] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    setUserId(storedUserId);

    if (!storedUserId) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/users/${storedUserId}/meal-plan`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((planData) =>
        fetch(`${API_BASE_URL}/users/${storedUserId}/meal-plan-adherence?meal_plan_id=${planData.meal_plan_id}`).then(
          (res) => {
            if (!res.ok) throw new Error();
            return res.json();
          }
        ).then((adherenceData) => ({ planData, adherenceData }))
      )
      .then(({ planData, adherenceData }) => {
        setMealPlanId(planData.meal_plan_id);
        // Prefer the earliest week that's ready but not yet checked in, so a
        // missed week (current_week has since moved on past it) can still be
        // completed instead of being permanently stuck behind the current week.
        const readyWeek = adherenceData.weeks.find((w) => w.state === "ready");
        const targetWeek =
          readyWeek || adherenceData.weeks.find((w) => w.week_number === adherenceData.current_week);
        setCurrentWeek(targetWeek.week_number);
        setWeekState(targetWeek.state);
        setLoading(false);
      })
      .catch(() => {
        setLoadError("Could not load meal plan.");
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    if (!selected) return;
    setError("");
    setSaving(true);

    const option = OPTIONS.find((o) => o.label === selected);

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/weekly-checkins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_plan_id: mealPlanId,
          week_number: currentWeek,
          adherence_level: option.value,
        }),
      });

      if (res.status === 400) {
        setError("This week's check-in has already been saved.");
        setSaving(false);
        return;
      }

      if (!res.ok) {
        setError("Could not save check-in.");
        setSaving(false);
        return;
      }

      setSaved(true);
    } catch {
      setError("Could not save check-in.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-2xl mx-auto px-6 sm:px-8 py-10">
        {!userId ? (
          <p className="text-sm text-red-500">User not found.</p>
        ) : loading ? (
          <p className="text-sm text-gray-500">Loading meal plan...</p>
        ) : loadError ? (
          <p className="text-sm text-red-500">{loadError}</p>
        ) : saved ? (
          <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8.5 12.5l2.5 2.5 5-5" />
              </svg>
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-primary">
              Weekly Check-in Saved
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Thanks for checking in</h1>
            <p className="mt-2 text-gray-500">Your progress for this week has been recorded.</p>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-6 w-full h-14 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        ) : weekState === "completed" ? (
          <p className="text-sm text-gray-500">This week&apos;s check-in has already been completed.</p>
        ) : weekState === "not-available" ? (
          <p className="text-sm text-gray-500">This week&apos;s check-in is not available yet.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Weekly Check-in</h1>
              <span className="rounded-full bg-primary-light px-3 py-1 text-sm text-primary-dark">
                Week {currentWeek} of 4
              </span>
            </div>
            <p className="mt-4 text-gray-800">
              How well did you follow your meal plan this week?
            </p>
            <p className="mt-1 text-gray-500">Choose the option that best describes your week.</p>

            <div className="mt-8 bg-white rounded-3xl shadow-sm p-8">
              <div className="space-y-4">
                {OPTIONS.map((option) => {
                  const isSelected = selected === option.label;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setSelected(option.label)}
                      className={`w-full flex items-center gap-3 rounded-xl border px-5 py-4 text-left transition-colors ${
                        isSelected
                          ? "bg-primary-light border-primary"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-primary" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <span className="w-3 h-3 rounded-full bg-primary" />}
                      </span>
                      <span
                        className={`font-semibold ${
                          isSelected ? "text-[#3f6b42]" : "text-gray-900"
                        }`}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}

            <button
              type="button"
              disabled={!selected || saving}
              onClick={handleSave}
              className={`mt-6 w-full h-14 rounded-full font-semibold transition-colors ${
                selected && !saving
                  ? "bg-primary text-white hover:bg-primary-hover cursor-pointer"
                  : "bg-disabled text-gray-400 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving..." : "Save Check-in"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
