/* eslint-disable  react/display-name */

import React from "react";
import type { TransactionPreset } from "../types/transaction.types";

interface PresetSelectorProps {
    presets: TransactionPreset[];
    onSelect: (preset: TransactionPreset) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = React.memo(({ presets, onSelect }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-medium">Select Transaction Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presets.map(preset => (
                <button
                    key={preset.id}
                    onClick={() => onSelect(preset)}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{preset.description}</div>
                </button>
            ))}
        </div>
    </div>
));