export default function FoodSelectCard({ emoji, label, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-2xl border py-6 transition-colors ${
        isSelected ? "bg-[#eaf3ea] border-[#6f9b6f]" : "bg-white border-gray-200"
      }`}
    >
      {isSelected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#6f9b6f] flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      <span className="text-3xl">{emoji}</span>
      <span className={`mt-2 font-semibold ${isSelected ? "text-[#4f7a52]" : "text-gray-900"}`}>
        {label}
      </span>
    </button>
  );
}
