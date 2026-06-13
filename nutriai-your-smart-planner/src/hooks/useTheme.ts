import { useState, useEffect } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("nutriai-theme") as Theme) || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem("nutriai-theme", theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}
