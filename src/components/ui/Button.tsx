"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import type React from "react";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
	children: ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	icon?: ReactNode;
	isLoading?: boolean;
	fullWidth?: boolean;
	disabled?: boolean;
	onClick?: () => void;
	className?: string;
	networkColored?: boolean;
	type?: "button" | "submit" | "reset";
}

export default function Button({
	children,
	variant = "primary",
	size = "md",
	icon,
	isLoading = false,
	fullWidth = false,
	disabled = false,
	onClick,
	className = "",
	networkColored = true,
	type = "button",
}: ButtonProps) {
	const { isDarkTheme, getNetworkColor, getColor } = useTheme();

	// Size classes
	const sizeClasses = {
		sm: "px-2.5 py-1.5 text-xs",
		md: "px-4 py-2 text-sm",
		lg: "px-6 py-3 text-base",
	};

	// Get style based on variant and theme
	const getButtonStyle = (): React.CSSProperties => {
		switch (variant) {
			case "primary":
				return {
					backgroundColor: networkColored
						? getNetworkColor("primary")
						: getColor("info"),
					color: "#FFFFFF",
					boxShadow: isDarkTheme
						? "0 2px 4px rgba(0, 0, 0, 0.3)"
						: "0 2px 4px rgba(0, 0, 0, 0.1)",
				};
			case "secondary":
				return {
					backgroundColor: getColor("surfaceVariant"),
					color: isDarkTheme
						? getColor("textPrimary")
						: getColor("textPrimary"),
				};
			case "outline":
				return {
					backgroundColor: "transparent",
					color: networkColored
						? getNetworkColor("primary")
						: getColor("textPrimary"),
					border: `1px solid ${networkColored ? getNetworkColor("primary") : getColor("border")}`,
				};
			case "ghost":
				return {
					backgroundColor: "transparent",
					color: networkColored
						? getNetworkColor("primary")
						: getColor("textPrimary"),
				};
			case "danger":
				return {
					backgroundColor: getColor("error"),
					color: "#FFFFFF",
				};
			default:
				return {};
		}
	};

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || isLoading}
			className={`
        inline-flex items-center justify-center font-medium rounded-md
        transition-all duration-200 focus:outline-none focus-visible:ring-2
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:brightness-90 active:scale-[0.98]"}
        ${className}
      `}
			style={getButtonStyle()}
		>
			{isLoading ? (
				<svg
					className="animate-spin -ml-1 mr-2 h-4 w-4"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			) : icon ? (
				<span className="mr-2">{icon}</span>
			) : null}
			{children}
		</button>
	);
}
