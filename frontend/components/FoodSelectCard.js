export default function FoodSelectCard({ emoji, label, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-2xl border py-6 transition-colors ${
        isSelected ? "bg-primary-light border-primary" : "bg-white border-gray-200"
      }`}
    >
      {isSelected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      <span className="text-3xl">{emoji}</span>
      <span className={`mt-2 font-semibold ${isSelected ? "text-primary-dark" : "text-gray-900"}`}>
        {label}
      </span>
    </button>
  );
}
