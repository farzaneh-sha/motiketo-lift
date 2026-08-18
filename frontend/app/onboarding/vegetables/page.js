"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "@/components/OnboardingHeader";
import VegetableSelectCard from "@/components/VegetableSelectCard";
import { API_BASE_URL } from "@/lib/api";
import { VEGETABLE_EMOJIS } from "@/lib/foodIcons";

const INITIAL_VISIBLE = 12;
const SHOW_MORE_STEP = 8;

export default function VegetablesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [vegetables, setVegetables] = useState([]);
  const [selected, setSelected] = useState([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUserId(localStorage.getItem("user_id"));

    fetch(`${API_BASE_URL}/vegetables`)
      .then((res) => res.json())
      .then((data) => {
        setVegetables(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load vegetables.");
        setLoading(false);
      });
  }, []);

  function toggleVegetable(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.length === vegetables.length ? [] : vegetables.map((v) => v.id)
    );
  }

  function showMore() {
    setVisibleCount((count) => Math.min(count + SHOW_MORE_STEP, vegetables.length));
  }

  async function handleContinue() {
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/vegetables`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vegetable_ids: selected }),
      });

      if (!res.ok) {
        setError("Could not save vegetable preferences.");
        setSaving(false);
        return;
      }

      router.push("/onboarding/questionnaire");
    } catch {
      setError("Could not save vegetable preferences.");
      setSaving(false);
    }
  }

  const canContinue = selected.length > 0 && !saving;
  const visibleVegetables = vegetables.slice(0, visibleCount);

  return (
    <main className="min-h-screen w-full bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <OnboardingHeader backHref="/onboarding/proteins" step={2} totalSteps={3} />

        {/* Heading */}
        <h1 className="mt-8 text-3xl font-bold text-gray-900">Choose your vegetables</h1>
        <p className="mt-2 text-gray-500">
          Select the vegetables you enjoy. You can choose more than one.
        </p>

        {!userId ? (
          <p className="mt-6 text-sm text-red-500">User not found.</p>
        ) : loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading vegetables...</p>
        ) : (
          <>
            {/* Select all row */}
            <div className="mt-6 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-primary font-medium hover:underline"
              >
                Select all
              </button>
              <span className="text-gray-500">
                {selected.length} of {vegetables.length} selected
              </span>
            </div>

            {/* Vegetable grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {visibleVegetables.map((vegetable) => (
                <VegetableSelectCard
                  key={vegetable.id}
                  emoji={VEGETABLE_EMOJIS[vegetable.name] || "🥗"}
                  label={vegetable.name}
                  isSelected={selected.includes(vegetable.id)}
                  onClick={() => toggleVegetable(vegetable.id)}
                />
              ))}
            </div>

            {visibleCount < vegetables.length && (
              <button
                type="button"
                onClick={showMore}
                className="mt-4 w-full h-12 rounded-xl border border-gray-200 bg-white text-gray-600 font-medium flex items-center justify-center gap-1 hover:bg-gray-50"
              >
                Show more
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}

            {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}

            <p className="mt-6 text-center text-sm text-gray-500">
              You can change your preferences later.
            </p>

            <button
              type="button"
              disabled={!canContinue}
              onClick={handleContinue}
              className={`mt-4 w-full h-12 rounded-xl font-semibold transition-colors ${
                canContinue
                  ? "bg-primary text-white hover:bg-primary-hover cursor-pointer"
                  : "bg-disabled text-gray-400 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving..." : "Continue"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
