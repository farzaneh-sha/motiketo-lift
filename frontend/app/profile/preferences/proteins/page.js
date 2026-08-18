"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "@/components/OnboardingHeader";
import FoodSelectCard from "@/components/FoodSelectCard";
import { API_BASE_URL } from "@/lib/api";
import { PROTEIN_EMOJIS } from "@/lib/foodIcons";

export default function EditProteinPreferencesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [proteins, setProteins] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    setUserId(storedUserId);

    if (!storedUserId) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${API_BASE_URL}/proteins`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/users/${storedUserId}/food-preferences`).then((res) => res.json()),
    ])
      .then(([allProteins, foodPreferences]) => {
        setProteins(allProteins);
        const savedNames = foodPreferences.proteins.map((p) => p.name);
        setSelected(
          allProteins.filter((p) => savedNames.includes(p.name)).map((p) => p.id)
        );
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load protein preferences.");
        setLoading(false);
      });
  }, []);

  function toggleProtein(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.length === proteins.length ? [] : proteins.map((p) => p.id)
    );
  }

  async function handleContinue() {
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/proteins`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protein_ids: selected }),
      });

      if (!res.ok) {
        setError("Could not save protein preferences.");
        setSaving(false);
        return;
      }

      router.push("/profile/preferences/vegetables");
    } catch {
      setError("Could not save protein preferences.");
      setSaving(false);
    }
  }

  const canContinue = selected.length > 0 && !saving;

  return (
    <main className="min-h-screen w-full bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <OnboardingHeader backHref="/profile" step={1} totalSteps={3} />

        {/* Heading */}
        <h1 className="mt-8 text-3xl font-bold text-gray-900">Choose your proteins</h1>
        <p className="mt-2 text-gray-500">
          Select the protein sources you enjoy. You can choose more than one.
        </p>

        {!userId ? (
          <p className="mt-6 text-sm text-red-500">User not found.</p>
        ) : loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading proteins...</p>
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
                {selected.length} of {proteins.length} selected
              </span>
            </div>

            {/* Protein grid */}
            <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
              {proteins.map((protein) => (
                <FoodSelectCard
                  key={protein.id}
                  emoji={PROTEIN_EMOJIS[protein.name] || "🍽️"}
                  label={protein.name}
                  isSelected={selected.includes(protein.id)}
                  onClick={() => toggleProtein(protein.id)}
                />
              ))}
            </div>

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
