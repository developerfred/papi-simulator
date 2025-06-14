/* eslint-disable react/display-name */

import React, { useState } from "react";
import type { TransactionPreset } from "../types/transaction.types";

interface PresetSelectorProps {
    presets: TransactionPreset[];
    onSelect: (preset: TransactionPreset) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = React.memo(({ presets, onSelect }) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-theme-primary">Select Transaction Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {presets.map(preset => {
                    const isHovered = hoveredId === preset.id;

                    return (
                        <button
                            key={preset.id}
                            onClick={() => onSelect(preset)}
                            onMouseEnter={() => setHoveredId(preset.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="p-4 text-left border rounded-lg transition-all duration-200
                                bg-theme-surface border-theme
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-network-primary
                                relative overflow-hidden"
                        >
                            
                            <div
                                className={`absolute inset-0 bg-network-primary opacity-0 transition-opacity duration-300
                                    ${isHovered ? 'opacity-5 dark:opacity-10' : ''}`}
                            ></div>

                            <div
                                className={`font-medium text-theme-primary transition-colors
                                    ${isHovered ? 'text-network-primary' : ''}`}
                            >
                                {preset.name}
                            </div>
                            <div
                                className={`text-sm text-theme-secondary transition-colors mt-1
                                    ${isHovered ? 'text-theme-primary' : ''}`}
                            >
                                {preset.description}
                            </div>

                            
                            <div
                                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-opacity
                                    ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" className="text-network-primary">
                                    <path d="M9 18l6-6-6-6" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});