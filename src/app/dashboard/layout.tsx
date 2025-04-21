/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { ReactNode } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useTheme } from "@/lib/theme/ThemeProvider";

/**
 * Layout component for the blockchain dashboard
 */
export default function BlockchainDashboardLayout({
	children,
}: {
	children: ReactNode;
}) {
	const { getColor } = useTheme();

	return (
		<div
			className="min-h-screen"
			style={{ backgroundColor: getColor("background") }}
		>
			{children}
		</div>
	);
}
