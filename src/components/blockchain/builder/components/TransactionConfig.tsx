/* eslint-disable @typescript-eslint/no-explicit-any, react/display-name */

import React from "react";
import { Button } from "@/components/ui";
import { TransactionPreset, Network } from "../types/transaction.types";
import { ArgumentInput } from "./ArgumentInput";
import { XcmHelper } from "./XcmHelper";
import { XcmNetworkStatus } from "./XcmNetworkStatus";

interface TransactionConfigProps {
    preset: TransactionPreset;
    customPallet: string;
    customCall: string;
    args: Record<string, any>;
    availablePallets: string[];
    availableCalls: string[];
    network: Network;
    isBuilding: boolean;
    onCustomPalletChange: (pallet: string) => void;
    onCustomCallChange: (call: string) => void;
    onArgChange: (name: string, value: any) => void;
    onBuild: () => void;
    onReset: () => void;
}

export const TransactionConfig: React.FC<TransactionConfigProps> = React.memo(({
    preset,
    customPallet,
    customCall,
    args,
    availablePallets,
    availableCalls,
    network,
    isBuilding,
    onCustomPalletChange,
    onCustomCallChange,
    onArgChange,
    onBuild,
    onReset
}) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Configure Transaction</h3>
            <Button variant="outline" onClick={onReset} size="sm">
                Back
            </Button>
        </div>

        {/* Custom transaction fields */}
        {preset.id === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Pallet</label>
                    <select
                        value={customPallet}
                        onChange={(e) => onCustomPalletChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a pallet</option>
                        {availablePallets.map(pallet => (
                            <option key={pallet} value={pallet}>{pallet}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Call</label>
                    <select
                        value={customCall}
                        onChange={(e) => onCustomCallChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!customPallet}
                    >
                        <option value="">Select a call</option>
                        {availableCalls.map(call => (
                            <option key={call} value={call}>{call}</option>
                        ))}
                    </select>
                </div>
            </div>
        )}

        {/* Transaction arguments */}
        {preset.id !== 'custom' && preset.args.length > 0 && (
            <div className="space-y-4">
                <h4 className="font-medium">Parameters</h4>
                {preset.args.map(arg => (
                    <ArgumentInput
                        key={arg.name}
                        arg={arg}
                        value={args[arg.name]}
                        onChange={onArgChange}
                        networkSymbol={network.symbol}
                    />
                ))}
            </div>
        )}

        {/* Custom transaction raw args */}
        {preset.id === 'custom' && customPallet && customCall && (
            <div>
                <label className="block text-sm font-medium mb-1">Arguments (JSON)</label>
                <textarea
                    value={JSON.stringify(args, null, 2)}
                    onChange={(e) => {
                        try {
                            const parsedArgs = JSON.parse(e.target.value);
                            Object.keys(parsedArgs).forEach(key => onArgChange(key, parsedArgs[key]));
                        } catch {
                            // Invalid JSON, ignore
                        }
                    }}
                    placeholder='{"arg1": "value1", "arg2": "value2"}'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono text-sm"
                />
            </div>
        )}

        {/* XCM Helper */}
        <XcmHelper presetId={preset.id} />

        {/* XCM Network Status */}
        <XcmNetworkStatus network={network} />

        <Button
            onClick={onBuild}
            disabled={isBuilding || (preset.id === 'custom' && (!customPallet || !customCall))}
            className="w-full"
        >
            {isBuilding ? 'Building...' : 'Build Transaction'}
        </Button>
    </div>
));