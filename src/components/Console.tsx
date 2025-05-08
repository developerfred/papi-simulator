"use client";

import React, { useRef, useEffect } from "react";
import type { ConsoleOutput } from "@/lib/types/example";
import { useTheme } from "@/lib/theme/ThemeProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface ConsoleProps {
	outputs: ConsoleOutput[];
	onClear?: () => void;
}

export default function Console({ outputs, onClear }: ConsoleProps) {
	const consoleRef = useRef<HTMLDivElement>(null);
	const { getColor } = useTheme();

	useEffect(() => {
		if (consoleRef.current) {
			consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
		}
	}, [outputs]);

	const formatTimestamp = (timestamp: number): string => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	const getMessageStyle = (type: string) => {
		switch (type) {
			case "error":
				return { color: getColor("error") };
			case "warning":
				return { color: getColor("warning") };
			case "success":
			case "log":
				if (
					type === "log" &&
					outputs.some((o) => o.content.includes("Success"))
				) {
					return { color: getColor("success") };
				}
				return { color: getColor("textPrimary") };
			default:
				return { color: getColor("textPrimary") };
		}
	};

	const consoleHeader = (
		<div className="flex justify-between items-center">
			<div className="flex items-center space-x-2">
				<h3 className="text-sm font-medium">Console Output</h3>
				<span
					className="text-xs px-1.5 py-0.5 rounded"
					style={{
						backgroundColor: getColor("surfaceVariant"),
						color: getColor("textSecondary"),
					}}
				>
					{outputs.length} messages
				</span>
			</div>

			{onClear && (
				<Button
					variant="ghost"
					size="sm"
					onClick={onClear}
					disabled={outputs.length === 0}
					icon={
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					}
				>
					Clear
				</Button>
			)}
		</div>
	);

	const emptyConsole = (
		<div className="h-full flex flex-col items-center justify-center p-8">
			<div style={{ color: getColor("textTertiary") }}>
				<svg
					width="40"
					height="40"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="16 18 22 12 16 6"></polyline>
					<polyline points="8 6 2 12 8 18"></polyline>
				</svg>
			</div>
			<p
				className="mt-2 text-sm text-center"
				style={{ color: getColor("textSecondary") }}
			>
				Run code to see output here
			</p>
			<p
				className="mt-1 text-xs text-center"
				style={{ color: getColor("textTertiary") }}
			>
				Console logs and errors will appear in this panel
			</p>
		</div>
	);

	return (
		<Card header={consoleHeader} className="h-1/2 min-h-[220px] flex flex-col" style={{ position: "relative", zIndex: "var(--z-index-content)" }}>
			<div
				ref={consoleRef}
				className="flex-1 font-mono text-sm overflow-y-auto -mt-2 -mb-2 p-2"
				style={{
					backgroundColor: getColor("surface"),
					borderRadius: "4px",
					position: "relative", 
					zIndex: "var(--z-index-content)" 
				}}
			>
				{outputs.length === 0 ? (
					emptyConsole
				) : (
					<div className="space-y-1">
						{outputs.map((output, index) => (
							<div
								key={index}
								className="py-1 border-b last:border-b-0"
								style={{ borderColor: getColor("divider") }}
							>
								<span
									className="text-xs mr-2"
									style={{ color: getColor("textTertiary") }}
								>
									[{formatTimestamp(output.timestamp)}]
								</span>
								<span
									className="whitespace-pre-wrap"
									style={getMessageStyle(output.type)}
								>
									{output.content}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</Card>
	);
}
