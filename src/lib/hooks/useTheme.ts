import { useEffect, useState } from "react";

/**
 * Hook for managing theme (dark/light) with proper persistence and system preference detection
 */
export function useTheme() {
	const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const storedTheme = localStorage.getItem("theme");
		if (storedTheme) {
			const isDark = storedTheme === "dark";
			setIsDarkTheme(isDark);
			applyTheme(isDark);
		} else {
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			setIsDarkTheme(prefersDark);
			applyTheme(prefersDark);
		}

		setIsLoaded(true);

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem("theme")) {
				setIsDarkTheme(e.matches);
				applyTheme(e.matches);
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	const toggleTheme = () => {
		const newIsDark = !isDarkTheme;
		setIsDarkTheme(newIsDark);
		applyTheme(newIsDark);
		localStorage.setItem("theme", newIsDark ? "dark" : "light");
	};

	const applyTheme = (isDark: boolean) => {
		document.documentElement.setAttribute(
			"data-theme",
			isDark ? "dark" : "light",
		);

		document.documentElement.style.setProperty(
			"--background",
			isDark ? "#0a0a0a" : "#ffffff",
		);
		document.documentElement.style.setProperty(
			"--foreground",
			isDark ? "#ededed" : "#171717",
		);
		document.documentElement.style.setProperty("--primary-color", "#8e2fd0");
		document.documentElement.style.setProperty(
			"--border-color",
			isDark ? "#333333" : "#e5e5e5",
		);
		document.documentElement.style.setProperty(
			"--card-bg",
			isDark ? "#1a1a1a" : "#f5f5f5",
		);
		document.documentElement.style.setProperty(
			"--code-bg",
			isDark ? "#2d2d2d" : "#f0f0f0",
		);
	};

	return { isDarkTheme, isLoaded, toggleTheme };
}
