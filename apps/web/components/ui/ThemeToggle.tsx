"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof document !== "undefined") {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white hover:border-white/20 transition-all cursor-pointer flex items-center justify-center backdrop-blur-md"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-accent-cyan" />
      ) : (
        <Moon className="w-4 h-4 text-accent-blue" />
      )}
    </button>
  );
}
