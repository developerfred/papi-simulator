import React, { useRef, useEffect } from 'react';
import { Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { ConsoleOutput as ConsoleOutputType } from '@/lib/types/example';

interface ConsoleOutputProps {
    outputs: ConsoleOutputType[];
    onClear: () => void;
}

/**
 * Component that displays console output from code execution
 */
const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ outputs, onClear }) => {
    const consoleRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = React.useState(false);

    // Auto-scroll to bottom when new output is added
    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [outputs]);

    // Copy console output to clipboard
    const copyToClipboard = () => {
        const text = outputs.map(output => output.content).join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Render a specific output item based on its type
    const renderOutput = (output: ConsoleOutputType, index: number) => {
        // Determine text color based on output type
        const textColorClass =
            output.type === 'error' ? 'text-red-400' :
                output.type === 'warning' ? 'text-yellow-400' :
                    'text-green-400';

        return (
            <div key={index} className={`${textColorClass} my-1`}>
                {output.content}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
                <div className="text-sm font-medium">Console Output</div>
                <div className="flex items-center space-x-2">
                    <button
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={copyToClipboard}
                        disabled={outputs.length === 0}
                        title="Copy output"
                    >
                        {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <button
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={onClear}
                        disabled={outputs.length === 0}
                        title="Clear console"
                    >
                        <Trash2 size={16} />
                    </button>
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