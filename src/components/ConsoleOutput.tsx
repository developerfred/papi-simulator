"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import { Trash2, Copy, CheckCircle2, MinimizeIcon, Maximize2, Code } from "lucide-react";
import type { ConsoleOutput as ConsoleOutputType } from "@/lib/types/example";

interface ConsoleOutputProps {
	outputs: ConsoleOutputType[];
	onClear: () => void;
	isLivePreviewActive?: boolean;
}

/**
 * Component that displays console output from code execution with responsive layout
 * and toggle capability when live preview is active
 */
const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
	outputs,
	onClear,
	isLivePreviewActive = false
}) => {
	const consoleRef = useRef<HTMLDivElement>(null);
	const [copied, setCopied] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [unreadOutputs, setUnreadOutputs] = useState(0);

	useEffect(() => {
		if (consoleRef.current) {
			consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
		}

		if (isMinimized && outputs.length > 0) {
			setUnreadOutputs(prev => prev + 1);
		}
	}, [outputs, isMinimized]); // Adicionado isMinimized como dependência


	useEffect(() => {
		if (!isMinimized) {
			setUnreadOutputs(0);
		}
	}, [isMinimized]);


	const copyToClipboard = () => {
		const text = outputs.map((output) => output.content).join("\n");
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};


	const toggleMinimize = () => {
		setIsMinimized(!isMinimized);
	};


	const renderOutput = (output: ConsoleOutputType, index: number) => {
		const textColorClass =
			output.type === "error"
				? "text-red-400"
				: output.type === "warning"
					? "text-yellow-400"
					: "text-green-400";

		return (
			<div key={index} className={`${textColorClass} my-1`}>
				{output.content}
			</div>
		);
	};


	if (isLivePreviewActive && isMinimized) {
		return (
			<div className="fixed bottom-4 right-4 z-10">
				<button
					onClick={toggleMinimize}
					className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-md shadow-lg hover:bg-gray-700 transition-all duration-200"
				>
					<Code size={16} />
					<span>Console</span>
					{unreadOutputs > 0 && (
						<span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
							{unreadOutputs > 9 ? '9+' : unreadOutputs}
						</span>
					)}
				</button>
			</div>
		);
	}
	
	const consoleHeight = isLivePreviewActive ? "h-64" : "h-full";
	const consolePosition = isLivePreviewActive ? "fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 shadow-lg" : "";

	return (
		<div className={`flex flex-col ${consoleHeight} ${consolePosition} bg-gray-50 transition-all duration-300`}>
			<div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-100">
				<div className="text-sm font-medium">Console Output</div>
				<div className="flex items-center space-x-2">
					<button
						className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
						onClick={copyToClipboard}
						disabled={outputs.length === 0}
						title="Copy output"
					>
						{copied ? (
							<CheckCircle2 size={16} className="text-green-500" />
						) : (
							<Copy size={16} />
						)}
					</button>
					<button
						className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
						onClick={onClear}
						disabled={outputs.length === 0}
						title="Clear console"
					>
						<Trash2 size={16} />
					</button>
					{isLivePreviewActive && (
						<button
							className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
							onClick={toggleMinimize}
							title={isMinimized ? "Maximize console" : "Minimize console"}
						>
							{isMinimized ? <Maximize2 size={16} /> : <MinimizeIcon size={16} />}
						</button>
					)}
				</div>
			</div>
			<div
				ref={consoleRef}
				className="flex-1 overflow-auto p-4 font-mono text-sm bg-gray-900"
			>
				{outputs.length === 0 ? (
					<div className="text-gray-500 h-full flex items-center justify-center">
						Run code to see output...
					</div>
				) : (
					<pre>{outputs.map(renderOutput)}</pre>
				)}
			</div>
		</div>
	);
};

export default ConsoleOutput;