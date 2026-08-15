export default function MealDayCard({ day, date, isToday, meals, isOpen, onToggle }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900">{day}</span>
          <span className="text-gray-400">{date}</span>
          {isToday && (
            <span className="rounded-full bg-[#eaf3ea] px-3 py-1 text-xs font-medium text-[#4f7a52]">
              Today
            </span>
          )}
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 px-6 py-5 space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 shrink-0 rounded-full bg-[#eaf3ea] text-[#6f9b6f] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
              </svg>
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Breakfast</p>
              <p className="font-bold text-gray-900">{meals.breakfast}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-9 h-9 shrink-0 rounded-full bg-[#eaf3ea] text-[#6f9b6f] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 4h10a1 1 0 011 1v15l-6-4-6 4V5a1 1 0 011-1z" />
              </svg>
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Lunch</p>
              <p>
                <span className="font-bold text-gray-900">{meals.lunch.food}</span>
                <span className="text-gray-400"> + {meals.lunch.vegetable}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-9 h-9 shrink-0 rounded-full bg-[#eaf3ea] text-[#6f9b6f] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="10" r="6" />
                <path d="M12 16v4" />
              </svg>
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Dinner</p>
              <p>
                <span className="font-bold text-gray-900">{meals.dinner.food}</span>
                <span className="text-gray-400"> + {meals.dinner.vegetable}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
