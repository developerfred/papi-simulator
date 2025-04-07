import { useState, useCallback } from 'react';
import { Example } from '../types/example';
import { Network } from '../types/network';
import { ConsoleOutput } from '../types/example';
import { simulateCodeExecution } from '../utils/simulator';

/**
 * Hook for running code examples and managing their output
 */
export function useCodeRunner() {
    const [code, setCode] = useState<string>('');
    const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    /**
     * Updates the code in the editor
     */
    const updateCode = useCallback((newCode: string) => {
        setCode(newCode);
    }, []);

    /**
     * Sets the code based on an example and selected network
     */
    const setExampleCode = useCallback((example: Example, network: Network) => {
        setCode(example.getCode(network));
        // Clear previous outputs when changing examples
        setOutputs([]);
    }, []);

    /**
     * Runs the current code and updates the output
     */
    const runCode = useCallback(async (example: Example, network: Network) => {
        setIsRunning(true);
        setOutputs([{
            type: 'log',
            content: 'Running code...',
            timestamp: Date.now()
        }]);

        try {
            const simulatedOutputs = await simulateCodeExecution(example, network);
            setOutputs(simulatedOutputs);
        } catch (error) {
            setOutputs([{
                type: 'error',
                content: error instanceof Error
                    ? `Error: ${error.message}`
                    : 'An unknown error occurred',
                timestamp: Date.now()
            }]);
        } finally {
            setIsRunning(false);
        }
    }, []);

    /**
     * Clears the console output
     */
    const clearOutput = useCallback(() => {
        setOutputs([]);
    }, []);

    return {
        code,
        outputs,
        isRunning,
        updateCode,
        setExampleCode,
        runCode,
        clearOutput
    };
}