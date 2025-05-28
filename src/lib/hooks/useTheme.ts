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

	const hexToRgba = (hex: string, opacity: number) => {
		let r = 0, g = 0, b = 0;
		
		if (hex.length === 4) {
			r = parseInt(hex[1] + hex[1], 16);
			g = parseInt(hex[2] + hex[2], 16);
			b = parseInt(hex[3] + hex[3], 16);
		} else if (hex.length === 7) {
			r = parseInt(hex[1] + hex[2], 16);
			g = parseInt(hex[3] + hex[4], 16);
			b = parseInt(hex[5] + hex[6], 16);
		}

		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	};

	const getColor = (colorName: string, opacity: number = 1) => {
		const colorValue = document.documentElement.style.getPropertyValue(`--${colorName}`) || '#000000';

		if (opacity === 1) return colorValue;
		return hexToRgba(colorValue, opacity);
	};


	const getNetworkColor = (colorType: string, opacity: number = 1) => {
		const colorValue = {
			primary: '#8e2fd0',
			success: '#22c55e',
			warning: '#f59e0b',
			error: '#ef4444',
			info: '#3b82f6',
		}[colorType] || '#8e2fd0';

		if (opacity === 1) return colorValue;
		return hexToRgba(colorValue, opacity);
	};

	return {
		isDarkTheme, isLoaded, toggleTheme, getColor,
		getNetworkColor };
}
