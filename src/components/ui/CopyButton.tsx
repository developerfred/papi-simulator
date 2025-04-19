"use client";

import React, { useState, useEffect } from "react";

interface CopyButtonProps {
	text: string;
	className?: string;
	successMessage?: string;
	size?: "sm" | "md" | "lg";
}

export default function CopyButton({
	text,
	className = "",
	successMessage = "Copied!",
	size = "md",
}: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	// Reset copied state after 2 seconds
	useEffect(() => {
		if (copied) {
			const timeout = setTimeout(() => setCopied(false), 2000);
			return () => clearTimeout(timeout);
		}
	}, [copied]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
		} catch (err) {
			console.error("Failed to copy text:", err);
		}
	};

	const sizeClasses = {
		sm: "p-1 text-xs",
		md: "p-2 text-sm",
		lg: "p-3 text-base",
	};

	return (
		<button
			onClick={handleCopy}
			className={`
        inline-flex items-center justify-center rounded-md transition-colors
        ${sizeClasses[size]}
        ${copied ? "bg-green-600 text-white" : "bg-gray-800 hover:bg-gray-700"}
        ${className}
      `}
			title={copied ? successMessage : "Copy to clipboard"}
		>
			{copied ? (
				<>
					<CheckIcon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
					<span className="ml-1">{successMessage}</span>
				</>
			) : (
				<CopyIcon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
			)}
		</button>
	);
}

function CopyIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
		</svg>
	);
}

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}
