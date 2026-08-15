import AuthGuard from "@/components/AuthGuard";

export default function WeeklyCheckinLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}
