/**
 * UI components for the Monaco editor
 */
import React from "react";
import { useTheme } from "@/lib/theme/ThemeProvider";

/**
 * Loading placeholder for the Monaco editor
 */
export function EditorLoadingPlaceholder() {
	const { getColor } = useTheme();

	return (
		<div
			style={{
				backgroundColor: getColor("surface"),
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100%",
				width: "100%",
			}}
		>
			<div className="animate-pulse flex flex-col items-center">
				<svg
					width="40"
					height="40"
					viewBox="0 0 24 24"
					fill="none"
					stroke={getColor("textTertiary")}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="16 18 22 12 16 6"></polyline>
					<polyline points="8 6 2 12 8 18"></polyline>
				</svg>
				<span style={{ color: getColor("textSecondary"), marginTop: "8px" }}>
					Loading editor...
				</span>
			</div>
		</div>
	);
}

/**
 * Editor container component with styling
 */
export function EditorContainer({
	children,
	height = "400px",
}: {
	children: React.ReactNode;
	height?: string;
}) {
	const { getColor } = useTheme();

	const containerStyle = {
		border: `1px solid ${getColor("border")}`,
		borderRadius: "0.375rem",
		overflow: "hidden",
		height,
	};

	return <div style={containerStyle}>{children}</div>;
}

/**
 * Error boundary component for the Monaco editor
 */
export class EditorErrorBoundary extends React.Component<
	{ children: React.ReactNode; fallback?: React.ReactNode },
	{ hasError: boolean }
> {
	constructor(props: {
		children: React.ReactNode;
		fallback?: React.ReactNode;
	}) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error in Monaco Editor:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="p-4 text-red-500">
						An error occurred while loading the editor. Please refresh the page.
					</div>
				)
			);
		}

		return this.props.children;
	}
}
