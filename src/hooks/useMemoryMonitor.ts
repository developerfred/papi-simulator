/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

/**
 * Interface representing memory usage metrics
 */
interface MemoryMetrics {
	jsHeapSizeLimit: number;
	totalJSHeapSize: number;
	usedJSHeapSize: number;
	usagePercentage: number;
}

/**
 * Custom hook to monitor browser memory usage
 * @param intervalMs Interval for checking memory usage (default: 5000ms)
 * @param memoryWarningThreshold Percentage threshold for memory warning (default: 80%)
 */
export function useMemoryMonitor(
	intervalMs = 5000,
	memoryWarningThreshold = 80,
): MemoryMetrics | null {
	const [memoryUsage, setMemoryUsage] = useState<MemoryMetrics | null>(null);

	useEffect(() => {
		// Check for memory monitoring support
		if (
			typeof window === "undefined" ||
			!window.performance ||
			!("memory" in window.performance)
		) {
			console.warn("Memory monitoring is not supported in this environment.");
			return;
		}

		/**
		 * Retrieve and calculate memory usage metrics
		 */
		const updateMemoryInfo = () => {
			// TypeScript type assertion for performance.memory
			const memory = (window.performance as any).memory;

			if (!memory) return;

			const usagePercentage =
				(memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

			const metrics: MemoryMetrics = {
				jsHeapSizeLimit: memory.jsHeapSizeLimit,
				totalJSHeapSize: memory.totalJSHeapSize,
				usedJSHeapSize: memory.usedJSHeapSize,
				usagePercentage,
			};

			setMemoryUsage(metrics);

			// Alert about potential memory leaks
			if (usagePercentage > memoryWarningThreshold) {
				console.warn(
					`High memory usage detected: ${usagePercentage.toFixed(2)}%`,
				);
			}
		};

		// Initial memory check
		updateMemoryInfo();

		// Periodic memory monitoring
		const intervalId = setInterval(updateMemoryInfo, intervalMs);

		// Cleanup interval on component unmount
		return () => clearInterval(intervalId);
	}, [intervalMs, memoryWarningThreshold]);

	return memoryUsage;
}
