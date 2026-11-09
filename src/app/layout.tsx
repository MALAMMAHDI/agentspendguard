import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AgentSpendGuard | Controlled autonomy for AI agents",
  description: "A prototype for owner-defined spending controls for AI agents on NEAR.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
