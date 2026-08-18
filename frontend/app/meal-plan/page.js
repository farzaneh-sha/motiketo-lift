"use client";

import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import MealDayCard from "@/components/MealDayCard";
import { API_BASE_URL } from "@/lib/api";

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatStartDate(startDate) {
  const [year, month, day] = startDate.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}


function getDayInfo(startDate, weekNumber, dayNumber) {
  const [year, month, day] = startDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const offset = (weekNumber - 1) * 7 + (dayNumber - 1);
  date.setDate(date.getDate() + offset);

  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  return {
    weekdayName: WEEKDAY_NAMES[date.getDay()],
    displayDate: `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`,
    isToday,
  };
}

function calculateInitialSelection(startDate) {
  const [year, month, day] = startDate.split("-").map(Number);
  const start = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysElapsed = Math.round((today - start) / (1000 * 60 * 60 * 24));

  if (daysElapsed < 0) {
    return { activeWeek: 1, expandedDay: 0 };
  }
  if (daysElapsed > 27) {
    return { activeWeek: 4, expandedDay: 6 };
  }

  const weekIndex = Math.floor(daysElapsed / 7);
  const dayIndex = daysElapsed % 7;
  return { activeWeek: weekIndex + 1, expandedDay: dayIndex };
}

export default function MealPlanPage() {
  const [userId, setUserId] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [expandedDay, setExpandedDay] = useState(null);
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
        if (res.status === 404) {
          setError("No active meal plan found.");
          setLoading(false);
          return null;
        }
        if (!res.ok) {
          setError("Could not load meal plan.");
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setMealPlan(data);
          const { activeWeek: initialWeek, expandedDay: initialDay } = calculateInitialSelection(data.start_date);
          setActiveWeek(initialWeek);
          setExpandedDay(initialDay);
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Could not load meal plan.");
        setLoading(false);
      });
  }, []);

  function selectWeek(week) {
    setActiveWeek(week);

    const today = calculateInitialSelection(mealPlan.start_date);
    setExpandedDay(week === today.activeWeek ? today.expandedDay : null);
  }

  const currentWeekData = mealPlan?.weeks.find((week) => week.week_number === activeWeek);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader active="meal-plan" />

      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
        <h1 className="text-4xl font-bold text-gray-900">Monthly Meal Plan</h1>

        {!userId ? (
          <p className="mt-6 text-sm text-red-500">User not found.</p>
        ) : loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading meal plan...</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-500">{error}</p>
        ) : (
          <>
            <p className="mt-2 text-gray-500">
              Your personalized 4-week meal plan.
              <span className="mx-2">·</span>
              Started {formatStartDate(mealPlan.start_date)}
            </p>

            {/* Week tabs */}
            <div className="mt-6 inline-flex flex-wrap items-center gap-1 rounded-full bg-input p-1.5">
              {mealPlan.weeks.map((week) => (
                <button
                  key={week.week_number}
                  type="button"
                  onClick={() => selectWeek(week.week_number)}
                  className={`rounded-full px-5 py-2 text-sm transition-colors ${
                    activeWeek === week.week_number
                      ? "bg-white text-gray-900 font-semibold shadow-sm"
                      : "text-gray-500 font-medium hover:text-gray-700"
                  }`}
                >
                  Week {week.week_number}
                </button>
              ))}
            </div>

            {/* Day accordion */}
            <div className="mt-6 space-y-4">
              {currentWeekData.days.map((day, index) => {
                const { weekdayName, displayDate, isToday } = getDayInfo(
                  mealPlan.start_date,
                  activeWeek,
                  day.day_number
                );
                return (
                  <MealDayCard
                    key={day.day_number}
                    day={weekdayName}
                    date={displayDate}
                    isToday={isToday}
                    meals={{
                      breakfast: day.breakfast.food_name,
                      lunch: { food: day.lunch.food_name, vegetable: day.lunch.vegetable_name },
                      dinner: { food: day.dinner.food_name, vegetable: day.dinner.vegetable_name },
                    }}
                    isOpen={expandedDay === index}
                    onToggle={() => setExpandedDay(expandedDay === index ? null : index)}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
