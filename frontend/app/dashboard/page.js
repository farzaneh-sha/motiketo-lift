"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import WeeklyCheckinCard from "@/components/WeeklyCheckinCard";
import { API_BASE_URL } from "@/lib/api";

const MEAL_PLAN_WEEKS = 4;
const ADHERENCE_MAX = 100;


const CLUSTER_LABELS = {
  lower_concern: "Balanced Eating Pattern",
  higher_concern: "More Structured Support May Help",
};

const CHECKIN_LEGEND = [
  { key: "not-available", label: "Not available" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
];

const ADHERENCE_LABELS = {
  not_at_all: "Not at all",
  a_little: "A little",
  about_half: "About half",
  mostly: "Mostly",
  completely: "Completely",
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


const HEALTHY_FATS = [
  "Extra Virgin Olive Oil",
  "Olive Oil",
  "Avocado Oil",
  "Coconut Oil",
  "MCT Oil",
  "Butter",
  "Ghee",
];

const KETO_FRUITS = [
  "Avocado",
  "Green Olives",
  "Black Olives",
  "Strawberries",
  "Raspberries",
  "Blackberries",
  "Blueberries (in moderation)",
  "Cranberries (unsweetened)",
  "Fresh Coconut",
];

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

export default function DashboardPage() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [adherence, setAdherence] = useState(null);
  const [behaviorCluster, setBehaviorCluster] = useState(null);
  const [motivationalMessage, setMotivationalMessage] = useState(null);
  const [loading, setLoading] = useState(true);
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
        fetch(`${API_BASE_URL}/users/${storedUserId}/meal-plan-adherence?meal_plan_id=${planData.meal_plan_id}`)
      )
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((adherenceData) => {
        setAdherence(adherenceData);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load meal plan adherence.");
        setLoading(false);
      });


    fetch(`${API_BASE_URL}/users/${storedUserId}/dashboard`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUserName(data ? data.user.name : null))
      .catch(() => setUserName(null));

    fetch(`${API_BASE_URL}/users/${storedUserId}/behavior-profile`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setBehaviorCluster(data ? data.behavior_cluster : null))
      .catch(() => setBehaviorCluster(null));

    fetch(`${API_BASE_URL}/users/${storedUserId}/motivational-message`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setMotivationalMessage(data ? data.message : null))
      .catch(() => setMotivationalMessage(null));
  }, []);


  const currentWeek = adherence?.current_week ?? 1;
  const currentWeekData = adherence?.weeks.find((week) => week.week_number === currentWeek);

  const readyWeekData = adherence?.weeks.find((week) => week.state === "ready");
  const checkinWeekData = readyWeekData ?? currentWeekData;
  const checkinState = checkinWeekData?.state ?? "not-available";

  return (
    <div className="min-h-screen bg-[#f6f8f5]">
      <AppHeader active="dashboard" />

      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back{userName ? `, ${userName}` : ""}
        </h1>
        <p className="mt-2 text-gray-500">Here&apos;s your current plan and latest updates.</p>

        {!userId ? (
          <p className="mt-6 text-sm text-red-500">User not found.</p>
        ) : loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading dashboard...</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-500">{error}</p>
        ) : (
          <>

            {motivationalMessage && (
              <div className="mt-6 bg-white rounded-3xl shadow-sm p-8 flex items-start gap-4">
                <span className="w-10 h-10 shrink-0 rounded-xl bg-[#eaf3ea] text-[#6f9b6f] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">A Message For You</p>
                  <p className="mt-2 text-lg font-medium italic text-gray-900">“{motivationalMessage}”</p>
                </div>
              </div>
            )}

            <div className="mt-8 bg-white rounded-3xl shadow-sm p-8 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 shrink-0 rounded-xl bg-[#eaf3ea] text-[#6f9b6f] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <line x1="8" y1="8" x2="16" y2="8" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="8" y1="16" x2="12" y2="16" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Monthly Meal Plan</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">Your 4-week meal plan is ready.</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#eaf3ea] px-3 py-1 text-sm text-[#4f7a52]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
                    </svg>
                    Week {currentWeek} of {MEAL_PLAN_WEEKS}
                  </span>
                </div>
              </div>
              <Link
                href="/meal-plan"
                className="shrink-0 rounded-xl bg-[#6f9b6f] px-6 py-3 font-semibold text-white hover:bg-[#5f8a5f] transition-colors"
              >
                View Meal Plan
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="bg-white rounded-3xl shadow-sm p-8">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-[#eaf3ea] text-[#6f9b6f] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                    </svg>
                  </span>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Behavioral Profile</p>
                </div>
                <p className="mt-4 text-xl font-bold text-gray-900">
                  {behaviorCluster ? CLUSTER_LABELS[behaviorCluster] : "Behavioral profile not available."}
                </p>
                <Link href="/profile" className="mt-4 inline-block text-[#6f9b6f] font-medium hover:underline">
                  View Profile →
                </Link>
              </div>

              <div>
                <WeeklyCheckinCard
                  state={checkinState}
                  weekNumber={checkinWeekData?.week_number ?? currentWeek}
                  totalWeeks={MEAL_PLAN_WEEKS}
                  adherenceLevel={
                    checkinWeekData?.adherence_level
                      ? ADHERENCE_LABELS[checkinWeekData.adherence_level]
                      : null
                  }
                  checkinDate={checkinWeekData?.checkin_date ? formatDate(checkinWeekData.checkin_date) : null}
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  {CHECKIN_LEGEND.map((item) => (
                    <span
                      key={item.key}
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        checkinState === item.key
                          ? "bg-[#6f9b6f] text-white"
                          : "border border-gray-200 text-gray-600 bg-white"
                      }`}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-3xl shadow-sm p-8">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Meal Plan Adherence</p>
                  <p className="mt-1 text-sm text-gray-500">Your progress across the current 4-week meal plan.</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {adherence.total_score} / {ADHERENCE_MAX}
                </p>
              </div>
              <div className="mt-4 h-3 rounded-full bg-gray-100">
                <div
                  className="h-3 rounded-full bg-[#6f9b6f]"
                  style={{ width: `${(adherence.total_score / ADHERENCE_MAX) * 100}%` }}
                />
              </div>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {adherence.weeks.map((week) => (
                  <div
                    key={week.week_number}
                    className={`rounded-2xl p-4 ${
                      week.score != null ? "bg-[#eaf3ea]" : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className="text-sm text-gray-700">Week {week.week_number}</p>
                    {week.score != null ? (
                      <>
                        <p className="mt-1 text-lg font-bold text-gray-900">{week.score} / 25</p>
                        <p className="text-sm font-medium text-[#4f7a52]">Completed</p>
                      </>
                    ) : (
                      <p className="mt-1 text-gray-400 italic">Pending</p>
                    )}
                  </div>
                ))}
              </div>
            </div>


            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-sm p-8">
                <p className="text-lg font-bold text-gray-900">🥑 Healthy Fats &amp; Oils</p>
                <ul className="mt-4 space-y-2">
                  {HEALTHY_FATS.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6f9b6f] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl shadow-sm p-8">
                <p className="text-lg font-bold text-gray-900">🍓 Keto Fruits</p>
                <ul className="mt-4 space-y-2">
                  {KETO_FRUITS.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6f9b6f] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
