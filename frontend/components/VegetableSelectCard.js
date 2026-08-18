export default function VegetableSelectCard({ emoji, label, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col overflow-hidden rounded-2xl border transition-colors ${
        isSelected ? "border-primary" : "border-gray-200"
      }`}
    >
      <div
        className={`flex items-center justify-center py-8 ${
          isSelected ? "bg-[#dcefdc]" : "bg-input"
        }`}
      >
        <span className="text-4xl">{emoji}</span>
      </div>
      <div className="border-t border-gray-100 bg-white py-3 text-center">
        <span className={`font-semibold ${isSelected ? "text-primary-dark" : "text-gray-900"}`}>
          {label}
        </span>
      </div>

      {isSelected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </button>
  );
}
