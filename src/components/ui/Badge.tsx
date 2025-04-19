"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import type React from "react";
import type { ReactNode } from "react";

type BadgeVariant =
	| "default"
	| "primary"
	| "success"
	| "error"
	| "warning"
	| "info"
	| "network";
type BadgeSize = "sm" | "md";

interface BadgeProps {
	children: ReactNode;
	variant?: BadgeVariant;
	size?: BadgeSize;
	rounded?: boolean;
	className?: string;
}

export default function Badge({
	children,
	variant = "default",
	size = "sm",
	rounded = false,
	className = "",
}: BadgeProps) {
	const { getColor, getNetworkColor } = useTheme();

	// Size classes
	const sizeClasses = {
		sm: "px-1.5 py-0.5 text-xs",
		md: "px-2 py-1 text-sm",
	};

	// Get style based on variant
	const getBadgeStyle = (): React.CSSProperties => {
		switch (variant) {
			case "primary":
				return {
					backgroundColor: getColor("info"),
					color: "#FFFFFF",
				};
			case "success":
				return {
					backgroundColor: getColor("success"),
					color: "#FFFFFF",
				};
			case "error":
				return {
					backgroundColor: getColor("error"),
					color: "#FFFFFF",
				};
			case "warning":
				return {
					backgroundColor: getColor("warning"),
					color: "#FFFFFF",
				};
			case "info":
				return {
					backgroundColor: getColor("info"),
					color: "#FFFFFF",
				};
			case "network":
				return {
					backgroundColor: getNetworkColor("primary"),
					color: "#FFFFFF",
				};
			default:
				return {
					backgroundColor: getColor("surfaceVariant"),
					color: getColor("textSecondary"),
				};
		}
	};

	return (
		<span
			className={`
        inline-flex items-center font-medium
        ${sizeClasses[size]}
        ${rounded ? "rounded-full" : "rounded"}
        ${className}
      `}
			style={getBadgeStyle()}
		>
			{children}
		</span>
	);
}
