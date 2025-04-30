import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ConsoleOutputToggleProps {
    isCodeOutputVisible: boolean;
    toggleCodeOutputVisibility: () => void;
}

const ConsoleOutputToggle: React.FC<ConsoleOutputToggleProps> = ({
    isCodeOutputVisible,
    toggleCodeOutputVisibility
}) => {
    return (
        <div
            className="flex justify-between items-center cursor-pointer p-2 
        hover:bg-surface-variant 
        border-t border-theme 
        bg-surface 
        network-transition group"
            onClick={toggleCodeOutputVisibility}
        >
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-theme-secondary">
                    Console Output
                </span>
                <div
                    className="rounded-full bg-surface-variant 
            w-5 h-5 flex items-center justify-center 
            transition-all duration-200 
            group-hover:bg-network-light"
                >
                    {isCodeOutputVisible ? (
                        <ChevronUp className="w-4 h-4 text-theme-tertiary group-hover:text-network-primary" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-theme-tertiary group-hover:text-network-primary" />
                    )}
                </div>
            </div>
            <div
                className="text-xs text-theme-tertiary 
          bg-surface-variant 
          px-2 py-1 rounded-md 
          opacity-0 group-hover:opacity-100 
          transition-opacity duration-200 
          group-hover:text-network-primary"
            >
                {isCodeOutputVisible ? 'Hide' : 'Show'}
            </div>
        </div>
    );
};

export default ConsoleOutputToggle;