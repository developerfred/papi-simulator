import { useThemeColors } from "@/lib/hooks/useThemeColors";
import React, { type ReactNode } from "react";

interface InfoRowProps {
	label: string;
	value: ReactNode;
}

export default function InfoRow({ label, value }: InfoRowProps) {
	const colors = useThemeColors();

	return (
		<div className="flex justify-between items-center">
			<span style={{ color: colors.textSecondary }}>{label}:</span>
			<div className="text-right">{value}</div>
		</div>
	);
}
