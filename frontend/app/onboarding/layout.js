import AuthGuard from "@/components/AuthGuard";

export default function OnboardingLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}
