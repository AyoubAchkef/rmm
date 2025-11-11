import * as React from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Header() {
  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-[var(--border)] bg-[var(--background)]">
      <h1 className="text-xl font-bold text-[var(--primary)]">Next.js + shadcn/ui Starter</h1>
      <ThemeSwitcher />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="py-4 px-6 border-t border-[var(--border)] text-center text-xs text-[var(--foreground)] bg-[var(--background)]">
      © {new Date().getFullYear()} Starter. Powered by Next.js, shadcn/ui, TanStack Query, Zustand.
    </footer>
  );
}
