import { useEffect, useMemo, useState } from "react";

export enum DeviceType {
	Mobile = "mobile",
	Tablet = "tablet",
	Desktop = "desktop",
}

export type BreakpointSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface Breakpoints {
	xs: number;
	sm: number;
	md: number;
	lg: number;
	xl: number;
	"2xl": number;
}

const defaultBreakpoints: Breakpoints = {
	xs: 0,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
};

export function useResponsive(customBreakpoints?: Partial<Breakpoints>) {
	const breakpoints = useMemo(
		() => ({
			...defaultBreakpoints,
			...customBreakpoints,
		}),
		[customBreakpoints],
	);

	const [windowSize, setWindowSize] = useState({
		width: typeof window !== "undefined" ? window.innerWidth : 0,
		height: typeof window !== "undefined" ? window.innerHeight : 0,
	});

	const [deviceType, setDeviceType] = useState<DeviceType>(DeviceType.Desktop);
	const [currentBreakpoint, setCurrentBreakpoint] =
		useState<BreakpointSize>("xl");

	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleResize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;

			setWindowSize({ width, height });

			// Determine device type
			if (width < breakpoints.sm) {
				setDeviceType(DeviceType.Mobile);
			} else if (width < breakpoints.lg) {
				setDeviceType(DeviceType.Tablet);
			} else {
				setDeviceType(DeviceType.Desktop);
			}

			// Determine current breakpoint
			if (width < breakpoints.sm) {
				setCurrentBreakpoint("xs");
			} else if (width < breakpoints.md) {
				setCurrentBreakpoint("sm");
			} else if (width < breakpoints.lg) {
				setCurrentBreakpoint("md");
			} else if (width < breakpoints.xl) {
				setCurrentBreakpoint("lg");
			} else if (width < breakpoints["2xl"]) {
				setCurrentBreakpoint("xl");
			} else {
				setCurrentBreakpoint("2xl");
			}
		};

		// Initial check
		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [breakpoints]);

	return {
		width: windowSize.width,
		height: windowSize.height,
		deviceType,
		currentBreakpoint,
		isMobile: deviceType === DeviceType.Mobile,
		isTablet: deviceType === DeviceType.Tablet,
		isDesktop: deviceType === DeviceType.Desktop,
		breakpoints,
		isBreakpoint: (size: BreakpointSize) => currentBreakpoint === size,
		isMinBreakpoint: (size: BreakpointSize) => {
			const breakpointSizes: BreakpointSize[] = [
				"xs",
				"sm",
				"md",
				"lg",
				"xl",
				"2xl",
			];
			const currentIndex = breakpointSizes.indexOf(currentBreakpoint);
			const targetIndex = breakpointSizes.indexOf(size);
			return currentIndex >= targetIndex;
		},
		isMaxBreakpoint: (size: BreakpointSize) => {
			const breakpointSizes: BreakpointSize[] = [
				"xs",
				"sm",
				"md",
				"lg",
				"xl",
				"2xl",
			];
			const currentIndex = breakpointSizes.indexOf(currentBreakpoint);
			const targetIndex = breakpointSizes.indexOf(size);
			return currentIndex <= targetIndex;
		},
	};
}
