
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = storedTheme || systemTheme;
    setTheme(initialTheme);
  }, []);

  React.useEffect(() => {
    if (!mounted) return; // Wait until mounted to prevent hydration mismatch if possible

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  if (!mounted) {
    // To prevent hydration mismatch, render a placeholder or nothing until mounted
    // For a button, it's often fine to render it disabled or with a default icon
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Загрузка переключателя темы">
        <Sun className="h-6 w-6" /> {/* Default or loading icon */}
        <span className="sr-only">Загрузка темы</span>
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      aria-label={theme === "light" ? "Активировать темную тему" : "Активировать светлую тему"}
    >
      {theme === "light" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
      <span className="sr-only">
        {theme === "light" ? "Переключиться на темную тему" : "Переключиться на светлую тему"}
      </span>
    </Button>
  );
}
