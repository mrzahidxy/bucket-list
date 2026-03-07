import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "BucketList MVP",
  description: "Collaborative bucket list app"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable} font-[var(--font-manrope)] text-text antialiased`}>
        {children}
      </body>
    </html>
  );
}
