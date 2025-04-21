"use client";

import React, { useState, useEffect } from "react";
import { useConnectionStatus } from "@/store/useChainStore";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingIndicatorProps {
	message?: string;
	showConnectionStatus?: boolean;
	size?: "sm" | "md" | "lg";
	fullScreen?: boolean;
	timeout?: number;
	onTimeout?: () => void;
	variant?: "spinner" | "dots" | "blocks";
	showProgress?: boolean;
}

export default function LoadingIndicator({
	message = "Loading...",
	showConnectionStatus = false,
	size = "md",
	fullScreen = false,
	timeout = 0,
	onTimeout,
	variant = "spinner",
	showProgress = true,
}: LoadingIndicatorProps) {
	const connectionStatus = useConnectionStatus();
	const [timeoutReached, setTimeoutReached] = useState(false);
	const [elapsedTime, setElapsedTime] = useState(0);

	const sizes = {
		sm: { container: "h-4 w-4", text: "text-xs" },
		md: { container: "h-8 w-8", text: "text-sm" },
		lg: { container: "h-12 w-12", text: "text-base" },
	};

	useEffect(() => {
		if (!timeout || timeout <= 0) return;

		const interval = setInterval(() => {
			setElapsedTime((prev) => {
				const newTime = prev + 100;
				if (newTime >= timeout && !timeoutReached) {
					clearInterval(interval);
					setTimeoutReached(true);
					onTimeout?.();
				}
				return newTime;
			});
		}, 100);

		return () => clearInterval(interval);
	}, [timeout, timeoutReached, onTimeout]);

	const getStatusMessage = () => {
		if (!showConnectionStatus) return message;

		switch (connectionStatus.state) {
			case "connecting":
				return "Connecting to blockchain...";
			case "connected":
				return "Connected! Processing...";
			case "disconnected":
				return "Disconnected from blockchain";
			case "error":
				return `Error: ${connectionStatus.error?.message || "Connection failed"}`;
			default:
				return message;
		}
	};

	const getStatusColor = () => {
		if (!showConnectionStatus) return "text-blue-600";

		switch (connectionStatus.state) {
			case "connecting":
				return "text-yellow-600";
			case "connected":
				return "text-green-600";
			case "disconnected":
				return "text-gray-600";
			case "error":
				return "text-red-600";
			default:
				return "text-blue-600";
		}
	};

	const progress = timeout > 0 ? (elapsedTime / timeout) * 100 : 0;

	const renderIndicator = () => {
		switch (variant) {
			case "dots":
				return (
					<div className={`flex gap-1 ${sizes[size].container}`}>
						{[0, 1, 2].map((i) => (
							<motion.div
								key={i}
								className={`${getStatusColor()} bg-current rounded-full`}
								initial={{ scale: 0 }}
								animate={{
									scale: [0, 1, 0],
									transition: {
										delay: i * 0.2,
										repeat: Infinity,
										duration: 1.2,
									},
								}}
								style={{ width: "30%", height: "30%" }}
							/>
						))}
					</div>
				);

			case "blocks":
				return (
					<div className={`grid grid-cols-3 gap-1 ${sizes[size].container}`}>
						{[...Array(9)].map((_, i) => (
							<motion.div
								key={i}
								className={`${getStatusColor()} bg-current rounded-sm`}
								initial={{ opacity: 0.2 }}
								animate={{
									opacity: [0.2, 1, 0.2],
									transition: {
										delay: i * 0.1,
										repeat: Infinity,
										duration: 0.8,
									},
								}}
							/>
						))}
					</div>
				);

			case "spinner":
			default:
				return (
					<div className={`relative ${sizes[size].container}`}>
						<motion.div
							className={`absolute inset-0 rounded-full border-2 border-slate-100/10`}
							initial={{ opacity: 0.2 }}
							animate={{ opacity: 0.5 }}
							transition={{
								duration: 1,
								repeat: Infinity,
								repeatType: "reverse",
							}}
						/>
						<motion.div
							className={`absolute inset-0 rounded-full border-t-2 ${getStatusColor()}`}
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						/>
					</div>
				);
		}
	};

	const content = (
		<div className="flex flex-col items-center justify-center">
			{renderIndicator()}

			<AnimatePresence mode="wait">
				<motion.div
					key={getStatusMessage()}
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 5 }}
					className={`mt-3 ${sizes[size].text} ${getStatusColor()}`}
				>
					{getStatusMessage()}
				</motion.div>
			</AnimatePresence>

			{timeout > 0 && showProgress && (
				<div className="mt-2 w-full max-w-xs">
					<div className="h-1 w-full bg-slate-100/10 rounded-full overflow-hidden">
						<motion.div
							className={`h-full ${timeoutReached ? "bg-red-500" : "bg-blue-500"}`}
							initial={{ width: "0%" }}
							animate={{ width: `${Math.min(progress, 100)}%` }}
							transition={{ type: "spring", damping: 20 }}
						/>
					</div>
					{timeout >= 5000 && (
						<motion.p
							className="text-xs text-slate-400 mt-1 text-center"
							animate={{ opacity: [0.7, 1] }}
							transition={{
								duration: 1,
								repeat: Infinity,
								repeatType: "reverse",
							}}
						>
							{Math.floor(elapsedTime / 1000)}s / {Math.floor(timeout / 1000)}s
						</motion.p>
					)}
				</div>
			)}

			<AnimatePresence>
				{timeoutReached && onTimeout && (
					<motion.button
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						onClick={() => {
							setTimeoutReached(false);
							setElapsedTime(0);
						}}
						className="mt-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						Try Again
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	);

	if (fullScreen) {
		return (
			<AnimatePresence>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50"
				>
					{content}
				</motion.div>
			</AnimatePresence>
		);
	}

	return content;
}

export function BlockchainLoader() {
	return <LoadingIndicator showConnectionStatus size="md" variant="dots" />;
}

export function TransactionLoader({
	hash,
	onComplete,
}: { hash?: string; onComplete?: () => void }) {
	return (
		<LoadingIndicator
			message={
				hash
					? `Processing transaction ${hash.slice(0, 8)}...`
					: "Processing transaction..."
			}
			showConnectionStatus
			size="lg"
			variant="spinner"
			timeout={60000}
			onTimeout={onComplete}
			fullScreen
		/>
	);
}

export function ComponentLoader() {
	return (
		<div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
			<LoadingIndicator size="sm" variant="blocks" showProgress={false} />
		</div>
	);
}
