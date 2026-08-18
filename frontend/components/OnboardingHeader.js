import Link from "next/link";
import AvocadoLogo from "./AvocadoLogo";

export default function OnboardingHeader({ backHref, step, totalSteps }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>
        <div className="flex items-center gap-2">
          <AvocadoLogo size={18}/>
          <span className="text-sm font-bold text-gray-900">MotiKeto Lift</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-gray-800 font-medium">
          Step {step} of {totalSteps}
        </span>
        <span className="text-gray-400">Onboarding</span>
      </div>
      <div className="mt-2 flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < step ? "bg-primary" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </>
  );
}
