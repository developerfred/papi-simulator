import { useCallback, useState } from "react";
import { simulateCodeExecution } from "../simulation/simulationService";
import type { Example } from "../types/example";
import type { ConsoleOutput } from "../types/example";
import type { Network } from "../types/network";

interface UseCodeRunnerOptions {
	onRunStart?: () => void;
	onRunComplete?: () => void;
	onRunError?: (error: Error) => void;
	timeoutMs?: number;
	maxRetries?: number;
}

class CodeExecutionError extends Error {
	constructor(
		message: string,
		public readonly type: 'network' | 'timeout' | 'simulation' | 'unknown',
		public readonly originalError?: Error
	) {
		super(message);
		this.name = 'CodeExecutionError';
	}
}

export function useCodeRunner(options: UseCodeRunnerOptions = {}) {
	const [code, setCode] = useState<string>("");
	const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);
	const [lastRun, setLastRun] = useState<{
		example: Example;
		network: Network;
		timestamp: number;
	} | null>(null);

	const {
		timeoutMs = 30000, // 30 seconds default
		maxRetries = 2,
	} = options;

	const updateCode = useCallback((newCode: string) => {
		setCode(newCode);
	}, []);

	const setExampleCode = useCallback((example: Example, network: Network) => {
		setCode(example.getCode(network));
		setOutputs([]);
		setProgress(0);
	}, []);

	const runCode = useCallback(
		async (example: Example, network: Network) => {
			setIsRunning(true);
			setProgress(10);
			options.onRunStart?.();

			setOutputs([
				{
					type: "log",
					content: `🚀 Starting execution on ${network.name}...`,
					timestamp: Date.now(),
				},
			]);

			let attempt = 0;
			let lastError: Error | null = null;

			while (attempt <= maxRetries) {
				try {
					setProgress(20 + (attempt * 10));
					
					if (attempt > 0) {
						setOutputs(prev => [...prev, {
							type: "warning",
							content: `🔄 Retry attempt ${attempt}/${maxRetries}...`,
							timestamp: Date.now(),
						}]);
					}

					// Create a timeout promise
					const timeoutPromise = new Promise<never>((_, reject) => {
						setTimeout(() => {
							reject(new CodeExecutionError(
								`Execution timed out after ${timeoutMs}ms`,
								'timeout'
							));
						}, timeoutMs);
					});

					// Race between simulation and timeout
					const simulatedOutputs = await Promise.race([
						simulateCodeExecution(example, network),
						timeoutPromise
					]);

					setProgress(90);

					// Add success message
					const successOutputs = [
						...simulatedOutputs,
						{
							type: "log" as const,
							content: `✅ Execution completed successfully on ${network.name}`,
							timestamp: Date.now(),
						}
					];

					setOutputs(successOutputs);
					setLastRun({
						example,
						network,
						timestamp: Date.now(),
					});

					options.onRunComplete?.();
					return; // Success, exit retry loop

				} catch (error) {
					lastError = error instanceof Error ? error : new Error(String(error));
					attempt++;

					let errorType: CodeExecutionError['type'] = 'unknown';
					let errorMessage = lastError.message;

					// Categorize errors
					if (lastError instanceof CodeExecutionError) {
						errorType = lastError.type;
					} else if (lastError.message.includes('network') || lastError.message.includes('connection')) {
						errorType = 'network';
						errorMessage = `Network error: ${lastError.message}. Please check your internet connection and try again.`;
					} else if (lastError.message.includes('timeout')) {
						errorType = 'timeout';
						errorMessage = `Execution timed out: ${lastError.message}. The operation took too long to complete.`;
					} else {
						errorType = 'simulation';
						errorMessage = `Simulation error: ${lastError.message}`;
					}

					const categorizedError = new CodeExecutionError(errorMessage, errorType, lastError);

					// If this was the last attempt, report the error
					if (attempt > maxRetries) {
						setOutputs(prev => [...prev, {
							type: "error",
							content: `❌ ${categorizedError.message}${errorType === 'network' ? ' (Check network connection)' : ''}${errorType === 'timeout' ? ' (Try simplifying the code)' : ''}`,
							timestamp: Date.now(),
						}]);

						options.onRunError?.(categorizedError);
					}

					// Wait before retry (exponential backoff)
					if (attempt <= maxRetries) {
						const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
						await new Promise(resolve => setTimeout(resolve, delay));
					}
				}
			}

			// If we get here, all retries failed
			setOutputs(prev => [...prev, {
				type: "error",
				content: `❌ All ${maxRetries + 1} attempts failed. Last error: ${lastError?.message || 'Unknown error'}`,
				timestamp: Date.now(),
			}]);

			options.onRunError?.(lastError || new Error('All retry attempts failed'));
		},
		[options, timeoutMs, maxRetries],
	);

	const clearOutput = useCallback(() => {
		setOutputs([]);
	}, []);

	const addConsoleMessage = useCallback(
		(message: string, type: "log" | "error" | "warning" = "log") => {
			setOutputs((prev) => [
				...prev,
				{
					type,
					content: message,
					timestamp: Date.now(),
				},
			]);
		},
		[],
	);

	return {
		code,
		outputs,
		isRunning,
		progress,
		lastRun,
		updateCode,
		setExampleCode,
		runCode,
		clearOutput,
		addConsoleMessage,
	};
}
