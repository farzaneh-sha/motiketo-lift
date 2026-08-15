"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "@/components/OnboardingHeader";
import { API_BASE_URL } from "@/lib/api";

export default function QuestionnairePage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUserId(localStorage.getItem("user_id"));

    fetch(`${API_BASE_URL}/questions`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load questions.");
        setLoading(false);
      });
  }, []);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.feature] : undefined;
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const percent = questions.length
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;

  function selectAnswer(option) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.feature]: option }));
  }

  function goPrevious() {
    if (!isFirstQuestion) setCurrentIndex((i) => i - 1);
  }

  async function goNext() {
    if (!currentAnswer) return;

    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    setError("");
    setSaving(true);

    let profileData;
    try {
      const profileRes = await fetch(`${API_BASE_URL}/users/${userId}/behavior-profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!profileRes.ok) {
        setError("Could not save behavioral profile.");
        setSaving(false);
        return;
      }

      profileData = await profileRes.json();
    } catch {
      setError("Could not save behavioral profile.");
      setSaving(false);
      return;
    }

    localStorage.setItem("behavior_cluster", profileData.prediction.semantic_cluster);

    try {
      const mealPlanRes = await fetch(`${API_BASE_URL}/users/${userId}/meal-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!mealPlanRes.ok) {
        setError("Could not create meal plan.");
        setSaving(false);
        return;
      }
    } catch {
      setError("Could not create meal plan.");
      setSaving(false);
      return;
    }

    router.push("/onboarding/result");
  }

  return (
    <main className="min-h-screen w-full bg-[#f6f8f5] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <OnboardingHeader backHref="/onboarding/vegetables" step={3} totalSteps={3} />

        {/* Heading */}
        <h1 className="mt-8 text-3xl font-bold text-gray-900">Behavioral Questionnaire</h1>
        <p className="mt-2 text-gray-500">
          Your answers help us personalize your experience.
        </p>

        {!userId ? (
          <p className="mt-6 text-sm text-red-500">User not found.</p>
        ) : loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading questions...</p>
        ) : (
          <>
            {/* Questionnaire card */}
            <div className="mt-6 bg-white rounded-3xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-800 font-medium">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[#6f9b6f] font-medium">{percent}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-[#6f9b6f] transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-900">{currentQuestion.text}</h2>

              <div className="mt-5 space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentAnswer === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectAnswer(option)}
                      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-colors ${
                        isSelected
                          ? "bg-[#eaf3ea] border-[#6f9b6f]"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-[#6f9b6f]" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#6f9b6f]" />}
                      </span>
                      <span className={isSelected ? "text-[#3f6b42] font-medium" : "text-gray-800"}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  disabled={isFirstQuestion}
                  onClick={goPrevious}
                  className={`h-12 px-6 rounded-full font-semibold border transition-colors ${
                    isFirstQuestion
                      ? "border-gray-100 text-gray-300 cursor-not-allowed"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!currentAnswer || saving}
                  onClick={goNext}
                  className={`flex-1 h-12 rounded-full font-semibold transition-colors ${
                    currentAnswer && !saving
                      ? "bg-[#6f9b6f] text-white hover:bg-[#5f8a5f] cursor-pointer"
                      : "bg-[#e3ebe3] text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {saving ? "Saving..." : isLastQuestion ? "See Result" : "Next"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
