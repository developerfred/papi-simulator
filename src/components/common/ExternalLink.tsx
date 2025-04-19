import { useThemeColors } from "@/lib/hooks/useThemeColors";
import React, { type ReactNode } from "react";
import Icon from "../ui/Icon";

interface ExternalLinkProps {
	href: string;
	children: ReactNode;
	className?: string;
	iconSize?: number;
	networkColored?: boolean;
}

export default function ExternalLink({
	href,
	children,
	className = "",
	iconSize = 12,
	networkColored = true,
}: ExternalLinkProps) {
	const colors = useThemeColors();

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={`inline-flex items-center hover:underline transition-all duration-200 hover:translate-y-[-1px] ${className}`}
			style={{ color: networkColored ? colors.networkPrimary : colors.info }}
		>
			{children}
			<Icon name="externalLink" size={iconSize} className="ml-1" />
		</a>
	);
}
