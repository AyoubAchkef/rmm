import * as React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Simple dark mode toggle using data-theme on <html>
  React.useEffect(() => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, []);
  return <>{children}</>;
}
