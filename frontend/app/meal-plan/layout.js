import AuthGuard from "@/components/AuthGuard";

export default function MealPlanLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}
