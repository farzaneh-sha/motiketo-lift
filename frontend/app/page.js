import Link from "next/link";
import AvocadoLogo from "@/components/AvocadoLogo";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center px-6">
      {/* Soft abstract background shapes -- CSS only, no images */}
      <div className="pointer-events-none absolute -top-16 -right-20 w-72 h-72 rounded-[60%_40%_35%_65%/55%_35%_65%_45%] bg-[#dfe9d5] opacity-70" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-[140%] h-64 rounded-[50%] bg-[#efe9db] opacity-80" />

      {/* Content */}
      <div className="relative w-full max-w-sm flex flex-col items-center text-center">
        {/* Logo */}
        <div className="w-[90px] h-[90px] rounded-3xl  flex items-center justify-center ">
          <AvocadoLogo size={60} />
        </div>

        {/* Title */}
        <h1 className="mt-8 text-4xl font-bold text-[#1f2e1f]">
          MotiKeto <span className="text-primary">Lift</span>
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
          className="mt-10 w-full h-14 rounded-2xl bg-primary text-white text-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors"
        >
          Get Started
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
