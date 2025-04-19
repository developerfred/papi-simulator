import Icon from "@/components/ui/Icon";
import { useTheme } from "@/lib/theme/ThemeProvider";
import React from "react";

interface MobileSidebarToggleProps {
	isCollapsed: boolean;
	onToggle: () => void;
}

export default function MobileSidebarToggle({
	isCollapsed,
	onToggle,
}: MobileSidebarToggleProps) {
	const { getNetworkColor } = useTheme();

	return (
		<div className="fixed bottom-6 right-6 lg:hidden z-30">
			<button
				onClick={onToggle}
				className="p-3 rounded-full shadow-lg animate-pulse-slow"
				style={{
					backgroundColor: getNetworkColor("primary"),
					color: "white",
				}}
			>
				<Icon name={isCollapsed ? "chevronDown" : "close"} size={24} />
			</button>
		</div>
	);
}
