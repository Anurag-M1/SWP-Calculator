import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SWP Calculator — FinCal Innovation Hackathon | Technex '26",
  description:
    "Interactive Systematic Withdrawal Plan (SWP) Calculator for investor education. Understand how long your investment corpus may last under monthly withdrawals. Co-sponsored by HDFC Mutual Fund.",
  keywords: [
    "SWP Calculator",
    "Systematic Withdrawal Plan",
    "HDFC Mutual Fund",
    "Investment Calculator",
    "Corpus Calculator",
    "FinCal Innovation",
    "Technex 2026",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className={montserrat.className}>
        {children}
      </body>
    </html>
  );
}
