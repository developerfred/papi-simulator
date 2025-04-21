import { useCallback, useState } from "react";
import { simulateCodeExecution } from "../simulation/simulationService";
import type { Example } from "../types/example";
import type { ConsoleOutput } from "../types/example";
import type { Network } from "../types/network";

interface UseCodeRunnerOptions {
	onRunStart?: () => void;
	onRunComplete?: () => void;
	onRunError?: (error: Error) => void;
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
					content: "Running code...",
					timestamp: Date.now(),
				},
			]);

			try {
				setProgress(30);
				await new Promise((resolve) => setTimeout(resolve, 300));
				setProgress(50);

				const simulatedOutputs = await simulateCodeExecution(example, network);
				setProgress(90);

				await new Promise((resolve) => setTimeout(resolve, 200));

				setOutputs(simulatedOutputs);
				setLastRun({
					example,
					network,
					timestamp: Date.now(),
				});

				options.onRunComplete?.();
			} catch (error) {
				setOutputs([
					{
						type: "error",
						content:
							error instanceof Error
								? `Error: ${error.message}`
								: "An unknown error occurred",
						timestamp: Date.now(),
					},
				]);

				options.onRunError?.(
					error instanceof Error ? error : new Error("Unknown error"),
				);
			} finally {
				setIsRunning(false);
				setProgress(100);

				setTimeout(() => setProgress(0), 500);
			}
		},
		[options],
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
