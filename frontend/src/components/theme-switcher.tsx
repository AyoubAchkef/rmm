import * as React from "react";

export function ThemeSwitcher() {
  const [theme, setTheme] = React.useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return (
    <button
      aria-label="Toggle dark mode"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="ml-2 px-2 py-1 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
