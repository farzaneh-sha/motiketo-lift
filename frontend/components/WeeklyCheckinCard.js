import Link from "next/link";

export default function WeeklyCheckinCard({ state, weekNumber, totalWeeks, adherenceLevel, checkinDate }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-8">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 shrink-0 rounded-xl bg-primary-light text-primary flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="8" y1="3" x2="8" y2="7" />
            <line x1="16" y1="3" x2="16" y2="7" />
            <path d="M8.5 15l2 2 4-4" />
          </svg>
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Weekly Check-in</p>
      </div>

      <span className="mt-4 inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-sm text-primary-dark">
        Week {weekNumber} of {totalWeeks}
      </span>

      {state === "not-available" && (
        <p className="mt-4 text-sm text-gray-500">The check-in is not available yet.</p>
      )}

      {state === "ready" && (
        <>
          <p className="mt-4 text-lg font-bold text-gray-900">Your weekly check-in is ready.</p>
          <Link
            href="/weekly-checkin"
            className="mt-3 inline-block text-primary font-medium hover:underline"
          >
            Complete Check-in →
          </Link>
        </>
      )}

      {state === "completed" && (
        <>
          <p className="mt-4 text-xl font-bold text-gray-900">{adherenceLevel}</p>
          <p className="mt-1 text-sm text-gray-500">{checkinDate}</p>
          <Link
            href="/weekly-checkin"
            className="mt-3 inline-block text-primary font-medium hover:underline"
          >
            View Check-in →
          </Link>
        </>
      )}
    </div>
  );
}
