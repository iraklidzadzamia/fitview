import type { Metadata } from "next";
import type { ReactNode } from "react";
import { parseEnv } from "@/lib/config/env";
import "./globals.css";

parseEnv(process.env);

export const metadata: Metadata = {
  title: "FitView",
  description: "AI Virtual Try-On SaaS"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
