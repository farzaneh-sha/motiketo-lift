import Link from "next/link";
import AvocadoLogo from "@/components/AvocadoLogo";
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "about", label: "About", href: "/about" },
  { key: "profile", label: "Profile", href: "/profile" },
];

export default function AppHeader({ active }) {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AvocadoLogo size={45} />
          <span className="text-lg font-bold text-gray-900">MotiKeto Lift</span>
        </div>
        <nav className="flex items-center gap-6 sm:gap-8 text-sm">
          {NAV_ITEMS.map((item) =>
            item.key === active ? (
              <span
                key={item.key}
                className="font-semibold text-primary border-b-2 border-primary pb-1"
              >
                {item.label}
              </span>
            ) : (
              <Link key={item.key} href={item.href} className="text-gray-500 hover:text-gray-900">
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
