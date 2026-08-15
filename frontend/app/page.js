import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f5ee] flex items-center justify-center px-6">
      {/* Soft abstract background shapes -- CSS only, no images */}
      <div className="pointer-events-none absolute -top-16 -right-20 w-72 h-72 rounded-[60%_40%_35%_65%/55%_35%_65%_45%] bg-[#dfe9d5] opacity-70" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-[140%] h-64 rounded-[50%] bg-[#efe9db] opacity-80" />

      {/* Content */}
      <div className="relative w-full max-w-sm flex flex-col items-center text-center">
        {/* Logo */}
        <div className="w-[90px] h-[90px] rounded-3xl bg-[#6f9b6f] flex items-center justify-center shadow-sm">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round">
            <rect x="6" y="6" width="12" height="12" rx="2" transform="rotate(45 12 12)" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="mt-8 text-4xl font-bold text-[#1f2e1f]">
          MotiKeto <span className="text-[#6f9b6f]">Lift</span>
        </h1>

        {/* Divider */}
        <div className="mt-8 flex items-center gap-2">
          <span className="h-px w-6 bg-gray-300" />
          <span className="h-px w-6 bg-gray-300" />
        </div>

        {/* Tagline */}
        <p className="mt-8 text-2xl font-medium leading-relaxed text-[#213321]">
          Stay motivated.
          <br />
          Stay consistent.
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="mt-10 w-full h-14 rounded-2xl bg-[#6f9b6f] text-white text-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#5f8a5f] transition-colors"
        >
          Get Started
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
