import React, { useState } from 'react';
import { Play, Copy, CheckCircle2 } from 'lucide-react';

interface CodeEditorProps {
    code: string;
    onChange: (code: string) => void;
    onRun: () => void;
    isRunning: boolean;
}

/**
 * Component for editing code with basic editor features
 */
const CodeEditor: React.FC<CodeEditorProps> = ({
    code,
    onChange,
    onRun,
    isRunning,
}) => {
    const [copySuccess, setCopySuccess] = useState(false);

    // Copy code to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
                <div className="text-sm font-medium">TypeScript Editor</div>
                <div className="flex items-center space-x-2">
                    <button
                        className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={copyToClipboard}
                        title="Copy code"
                    >
                        {copySuccess ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                        ) : (
                            <Copy size={16} />
                        )}
                    </button>
                    <button
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors ${isRunning ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        onClick={onRun}
                        disabled={isRunning}
                    >
                        <Play size={14} />
                        <span className="text-sm">Run</span>
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-0 font-mono text-sm bg-white">
                <textarea
                    className="w-full h-full resize-none p-4 outline-none"
                    value={code}
                    onChange={(e) => onChange(e.target.value)}
                    spellCheck={false}
                    style={{
                        // Basic styling for readability
                        fontFamily: 'var(--font-geist-mono), monospace',
                        lineHeight: '1.5',
                        tabSize: 2
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;