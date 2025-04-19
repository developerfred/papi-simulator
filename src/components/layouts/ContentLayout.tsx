"use client";

import React, { type ReactNode } from "react";

interface ContentLayoutProps {
	children: ReactNode;
	sidebar?: ReactNode;
	sidebarWidth?: "narrow" | "medium" | "wide";
}

/**
 * Layout component for main content with optional sidebar
 * Makes the main content area responsive with proper spacing
 */
export default function ContentLayout({
	children,
	sidebar,
	sidebarWidth = "medium",
}: ContentLayoutProps) {
	const getSidebarGridCols = () => {
		switch (sidebarWidth) {
			case "narrow":
				return "lg:col-span-1 lg:grid-cols-5";
			case "wide":
				return "lg:col-span-2 lg:grid-cols-7";
			case "medium":
			default:
				return "lg:col-span-1 lg:grid-cols-4";
		}
	};

	const mainContentCols = () => {
		switch (sidebarWidth) {
			case "narrow":
				return "lg:col-span-4";
			case "wide":
				return "lg:col-span-5";
			case "medium":
			default:
				return "lg:col-span-3";
		}
	};

	if (!sidebar) {
		return (
			<div className="container mx-auto">
				<div className="animate-fadeIn">{children}</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto">
			<div
				className={`grid grid-cols-1 lg:${getSidebarGridCols()} gap-4 lg:gap-6`}
			>
				{/* Sidebar */}
				<div className="col-span-1 animate-fadeIn">{sidebar}</div>

				{/* Main content */}
				<div className={`col-span-1 ${mainContentCols()} animate-slideInRight`}>
					{children}
				</div>
			</div>
		</div>
	);
}
