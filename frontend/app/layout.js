import "./globals.css";

export const metadata = {
  title: "MotiKeto Lift",
  description: "MotiKeto Lift - Personalized nutrition guidance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
