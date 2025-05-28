"use client";

import React, { type ReactNode, useMemo, memo } from "react";
import { cn } from "@/lib/utils";


const SIDEBAR_WIDTHS = ['narrow', 'medium', 'wide'] as const;
type SidebarWidth = typeof SIDEBAR_WIDTHS[number];

interface ContentLayoutProps {
	children: ReactNode;
	sidebar?: ReactNode;
	sidebarWidth?: SidebarWidth;
	className?: string;	
	gap?: 'sm' | 'md' | 'lg';
	containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
	enableAnimations?: boolean;
}


const GRID_CONFIGS = {
	narrow: {
		sidebar: "lg:col-span-1",
		main: "lg:col-span-4",
		grid: "lg:grid-cols-5"
	},
	medium: {
		sidebar: "lg:col-span-1",
		main: "lg:col-span-3",
		grid: "lg:grid-cols-4"
	},
	wide: {
		sidebar: "lg:col-span-2",
		main: "lg:col-span-5",
		grid: "lg:grid-cols-7"
	}
} as const;

const GAP_CLASSES = {
	sm: "gap-2 lg:gap-3",
	md: "gap-4 lg:gap-6",
	lg: "gap-6 lg:gap-8"
} as const;

const CONTAINER_CLASSES = {
	sm: "max-w-4xl",
	md: "max-w-6xl",
	lg: "max-w-7xl",
	xl: "max-w-screen-xl",
	full: "max-w-full"
} as const;

/**
 * Layout component otimizado para conteúdo principal com sidebar opcional
 * Performance melhorada com memoização e cálculos pré-computados
 */
const ContentLayout = memo<ContentLayoutProps>(({
	children,
	sidebar,
	sidebarWidth = "medium",
	className,
	gap = "md",
	containerSize = "lg",
	enableAnimations = true
}) => {
	// Memoização dos cálculos de classe para evitar recálculos
	const gridClasses = useMemo(() => {
		const config = GRID_CONFIGS[sidebarWidth];
		const gapClass = GAP_CLASSES[gap];
		const containerClass = CONTAINER_CLASSES[containerSize];

		return {
			container: cn(
				"container mx-auto px-4 sm:px-6 lg:px-8",
				containerClass,
				className
			),
			grid: cn(
				"grid grid-cols-1",
				config.grid,
				gapClass
			),
			sidebar: cn(
				"col-span-1",
				config.sidebar,
				enableAnimations && "animate-fadeIn"
			),
			main: cn(
				"col-span-1",
				config.main,
				enableAnimations && "animate-slideInRight"
			),
			singleColumn: cn(
				enableAnimations && "animate-fadeIn"
			)
		};
	}, [sidebarWidth, gap, containerSize, className, enableAnimations]);

	// Early return para layout sem sidebar (otimização)
	if (!sidebar) {
		return (
			<div className={gridClasses.container}>
				<div className={gridClasses.singleColumn}>
					{children}
				</div>
			</div>
		);
	}

	return (
		<div className={gridClasses.container}>
			<div className={gridClasses.grid}>
				{/* Sidebar otimizada */}
				<aside
					className={gridClasses.sidebar}
					aria-label="Sidebar navigation"
				>
					{sidebar}
				</aside>

				{/* Conteúdo principal otimizado */}
				<main className={gridClasses.main}>
					{children}
				</main>
			</div>
		</div>
	);
});

ContentLayout.displayName = 'ContentLayout';

export default ContentLayout;

// Hook personalizado para usar com o layout (opcional)
export const useContentLayout = (
	sidebarWidth: SidebarWidth = 'medium',
	gap: ContentLayoutProps['gap'] = 'md'
) => {
	const config = useMemo(() => GRID_CONFIGS[sidebarWidth], [sidebarWidth]);
	const gapClasses = useMemo(() => GAP_CLASSES[gap], [gap]);

	return {
		config,
		gapClasses,
		isSidebarWide: sidebarWidth === 'wide',
		isSidebarNarrow: sidebarWidth === 'narrow'
	};
};


export const ContentLayoutWithSidebar = memo<{
	children: ReactNode;
	sidebar: ReactNode;
	sidebarProps?: Partial<ContentLayoutProps>;
}>(({ children, sidebar, sidebarProps }) => (
	<ContentLayout sidebar={sidebar} {...sidebarProps}>
		{children}
	</ContentLayout>
));

ContentLayoutWithSidebar.displayName = 'ContentLayoutWithSidebar';