"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import React, { type ReactNode } from "react";

interface CardProps {
	children: ReactNode;
	className?: string;
	elevation?: "level0" | "level1" | "level2" | "level3";
	bordered?: boolean;
	header?: ReactNode;
	footer?: ReactNode;
}

export default function Card({
	children,
	className = "",
	elevation = "level1",
	bordered = true,
	header,
	footer,
}: CardProps) {
	const { getElevation, getColor } = useTheme();

	const cardStyle = {
		backgroundColor: getColor("surface"),
		boxShadow: getElevation(elevation),
		borderColor: bordered ? getColor("border") : "transparent",
	};

	const headerStyle = {
		borderBottomColor: getColor("border"),
		backgroundColor: getColor("surfaceVariant"),
	};

	const footerStyle = {
		borderTopColor: getColor("border"),
		backgroundColor: getColor("surfaceVariant"),
	};

	return (
		<div
			className={`overflow-hidden rounded-md transition-all ${bordered ? "border" : ""} ${className}`}
			style={cardStyle}
		>
			{header && (
				<div className="p-3 border-b" style={headerStyle}>
					{header}
				</div>
			)}

			<div className="p-4">{children}</div>

			{footer && (
				<div className="p-3 border-t" style={footerStyle}>
					{footer}
				</div>
			)}
		</div>
	);
}
