import { useThemeColors } from "@/lib/hooks/useThemeColors";
import React, { type ReactNode } from "react";
import Icon, { type IconName } from "../ui/Icon";

interface EmptyStateProps {
	icon?: IconName;
	title: string;
	description?: string;
	action?: ReactNode;
	size?: "sm" | "md" | "lg";
}

export default function EmptyState({
	icon = "info",
	title,
	description,
	action,
	size = "md",
}: EmptyStateProps) {
	const colors = useThemeColors();

	const sizeClasses = {
		sm: {
			container: "p-4",
			icon: 24,
			titleSize: "text-sm",
			descSize: "text-xs",
		},
		md: {
			container: "p-6",
			icon: 36,
			titleSize: "text-base",
			descSize: "text-sm",
		},
		lg: {
			container: "p-8",
			icon: 48,
			titleSize: "text-lg",
			descSize: "text-base",
		},
	};

	const styles = sizeClasses[size];

	return (
		<div
			className={`flex flex-col items-center justify-center text-center ${styles.container}`}
		>
			<div className="mb-3" style={{ color: colors.textTertiary }}>
				<Icon name={icon} size={styles.icon} />
			</div>

			<h3
				className={`font-medium ${styles.titleSize} mb-2`}
				style={{ color: colors.textSecondary }}
			>
				{title}
			</h3>

			{description && (
				<p
					className={`${styles.descSize} mb-4`}
					style={{ color: colors.textTertiary }}
				>
					{description}
				</p>
			)}

			{action && <div className="mt-2">{action}</div>}
		</div>
	);
}
