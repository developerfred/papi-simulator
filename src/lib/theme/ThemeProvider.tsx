"use client";

import React, {
	createContext,
	useContext,
	type ReactNode,
	useState,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import {
	ELEVATION_LEVELS,
	NETWORK_COLORS,
	SEMANTIC_COLORS,
} from "./themeConstants";

interface ThemeContextType {
	isDarkTheme: boolean;
	toggleTheme: () => void;
	isLoaded: boolean;
	currentNetworkId: string;
	setCurrentNetworkId: (networkId: string) => void;
	getNetworkColor: (
		colorType: "primary" | "secondary" | "light" | "dark",
	) => string;
	getColor: (semanticKey: string) => string;
	getElevation: (level: "level0" | "level1" | "level2" | "level3") => string;
	// Métodos adicionais para compatibilidade
	forceThemeUpdate: () => void;
	updateNetwork: (networkId: string) => void;
	currentNetwork: string; // Alias para currentNetworkId
}

export const ThemeContext = createContext<ThemeContextType>({
	isDarkTheme: false,
	toggleTheme: () => { },
	isLoaded: false,
	currentNetworkId: "polkadot",
	setCurrentNetworkId: () => { },
	getNetworkColor: () => "#000000",
	getColor: () => "#000000",
	getElevation: () => "none",
	forceThemeUpdate: () => { },
	updateNetwork: () => { },
	currentNetwork: "polkadot",
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
	children: ReactNode;
	initialNetworkId?: string;
}

export function ThemeProvider({
	children,
	initialNetworkId = "polkadot",
}: ThemeProviderProps) {
	const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [currentNetworkId, setCurrentNetworkId] =
		useState<string>(initialNetworkId);
	const [mounted, setMounted] = useState(false);
	const [storedThemeApplied, setStoredThemeApplied] = useState(false);

	const applyTheme = useCallback((isDark: boolean, networkId: string) => {
		if (typeof window === "undefined") return;

		// Aplicar atributos de tema
		document.documentElement.setAttribute(
			"data-theme",
			isDark ? "dark" : "light",
		);
		document.documentElement.setAttribute("data-network", networkId);

		const networkColors =
			NETWORK_COLORS[networkId] || NETWORK_COLORS["polkadot"];
		const root = document.documentElement;

		// Aplicar cores de rede
		root.style.setProperty("--network-primary", networkColors.primary);
		root.style.setProperty("--network-secondary", networkColors.secondary);
		root.style.setProperty("--network-light", networkColors.light);
		root.style.setProperty("--network-dark", networkColors.dark);

		// Aplicar cores semânticas
		Object.entries(SEMANTIC_COLORS).forEach(([key, value]) => {
			root.style.setProperty(`--${key}`, isDark ? value.dark : value.light);
		});

		// Aplicar elevações
		Object.entries(ELEVATION_LEVELS).forEach(([key, value]) => {
			root.style.setProperty(
				`--elevation-${key}`,
				isDark ? value.dark : value.light,
			);
		});

		// Aplicar cores base compatíveis com o hook original
		if (isDark) {
			root.style.setProperty("--background", "#0a0a0f");
			root.style.setProperty("--foreground", "#f4f4f6");
			root.style.setProperty("--surface", "#1a1a24");
			root.style.setProperty("--surface-variant", "#2d2d3a");
			root.style.setProperty("--text-primary", "#f4f4f6");
			root.style.setProperty("--text-secondary", "#a1a1aa");
			root.style.setProperty("--text-tertiary", "#71717a");
			root.style.setProperty("--border", "#303042");
			root.style.setProperty("--divider", "#27272f");
			root.style.setProperty("--card-bg", "#1c1c24");
			root.style.setProperty("--input-bg", "#242433");
		} else {
			root.style.setProperty("--background", "#ffffff");
			root.style.setProperty("--foreground", "#18181b");
			root.style.setProperty("--surface", "#f7f7f9");
			root.style.setProperty("--surface-variant", "#eeeef2");
			root.style.setProperty("--text-primary", "#18181b");
			root.style.setProperty("--text-secondary", "#52525b");
			root.style.setProperty("--text-tertiary", "#71717a");
			root.style.setProperty("--border", "#e4e4e7");
			root.style.setProperty("--divider", "#f1f1f4");
			root.style.setProperty("--card-bg", "#ffffff");
			root.style.setProperty("--input-bg", "#ffffff");
		}

		// Aplicar classe no body para compatibilidade
		document.body.className = isDark ? 'dark' : 'light';
	}, []);

	// Inicialização do tema
	useEffect(() => {
		if (typeof window === "undefined" || storedThemeApplied) return;

		setMounted(true);

		// Buscar configurações salvas com keys compatíveis
		const storedTheme = localStorage.getItem("theme");
		const storedNetwork = localStorage.getItem("currentNetwork") ||
			localStorage.getItem("current-network"); // Compatibilidade

		const networkToUse = storedNetwork || initialNetworkId;
		if (storedNetwork && storedNetwork !== currentNetworkId) {
			setCurrentNetworkId(networkToUse);
		}

		let isDark: boolean;
		if (storedTheme) {
			isDark = storedTheme === "dark";
		} else {
			isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		}

		setIsDarkTheme(isDark);
		applyTheme(isDark, networkToUse);
		setIsLoaded(true);
		setStoredThemeApplied(true);

		// Listener para mudanças de preferência do sistema
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem("theme")) {
				setIsDarkTheme(e.matches);
				applyTheme(e.matches, currentNetworkId);
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [applyTheme, initialNetworkId, storedThemeApplied, currentNetworkId]);

	// Aplicar tema quando rede muda
	useEffect(() => {
		if (!mounted) return;

		applyTheme(isDarkTheme, currentNetworkId);
		// Salvar com ambas as keys para compatibilidade
		localStorage.setItem("currentNetwork", currentNetworkId);
		localStorage.setItem("current-network", currentNetworkId);
	}, [currentNetworkId, isDarkTheme, applyTheme, mounted]);

	const toggleTheme = useCallback(() => {
		const newIsDark = !isDarkTheme;
		setIsDarkTheme(newIsDark);
		applyTheme(newIsDark, currentNetworkId);
		localStorage.setItem("theme", newIsDark ? "dark" : "light");
	}, [isDarkTheme, currentNetworkId, applyTheme]);

	const getNetworkColor = useCallback(
		(colorType: "primary" | "secondary" | "light" | "dark"): string => {
			const networkColors =
				NETWORK_COLORS[currentNetworkId] || NETWORK_COLORS["polkadot"];
			return networkColors[colorType];
		},
		[currentNetworkId],
	);

	const getColor = useCallback(
		(semanticKey: string): string => {
			// Primeiro tentar cores semânticas
			const colorValue = SEMANTIC_COLORS[semanticKey];
			if (colorValue) {
				return isDarkTheme ? colorValue.dark : colorValue.light;
			}

			// Fallback para CSS variables do hook original
			if (typeof window !== "undefined") {
				const cssVariable = `--${semanticKey}`;
				const colorFromCSS = getComputedStyle(document.documentElement)
					.getPropertyValue(cssVariable)
					.trim();
				if (colorFromCSS) return colorFromCSS;
			}

			return "#000000";
		},
		[isDarkTheme],
	);

	const getElevation = useCallback(
		(level: "level0" | "level1" | "level2" | "level3"): string => {
			const elevationValue = ELEVATION_LEVELS[level];
			if (!elevationValue) return "none";
			return isDarkTheme ? elevationValue.dark : elevationValue.light;
		},
		[isDarkTheme],
	);

	// Função para forçar atualização do tema
	const forceThemeUpdate = useCallback(() => {
		applyTheme(isDarkTheme, currentNetworkId);
	}, [applyTheme, isDarkTheme, currentNetworkId]);

	// Alias para compatibilidade com hook original
	const updateNetwork = useCallback((networkId: string) => {
		setCurrentNetworkId(networkId);
	}, []);

	const contextValue = useMemo(
		() => ({
			isDarkTheme,
			toggleTheme,
			isLoaded,
			currentNetworkId,
			setCurrentNetworkId,
			getNetworkColor,
			getColor,
			getElevation,
			forceThemeUpdate,
			updateNetwork,
			currentNetwork: currentNetworkId, // Alias
		}),
		[
			isDarkTheme,
			toggleTheme,
			isLoaded,
			currentNetworkId,
			setCurrentNetworkId,
			getNetworkColor,
			getColor,
			getElevation,
			forceThemeUpdate,
			updateNetwork,
		],
	);

	// Evitar hidration mismatch mostrando conteúdo invisível até carregar
	if (!mounted) {
		return <div style={{ visibility: "hidden" }}>{children}</div>;
	}

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
}