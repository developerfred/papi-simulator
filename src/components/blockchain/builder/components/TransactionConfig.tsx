/* eslint-disable @typescript-eslint/no-explicit-any, react/display-name, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useState } from "react";
import { Button } from "@/components/ui";
import type { TransactionPreset, Network } from "../types/transaction.types";
import { ArgumentInput } from "./ArgumentInput";
import { XcmHelper } from "./XcmHelper";

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

const SelectField: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder: string;
    disabled?: boolean;
}> = ({ label, value, onChange, options, placeholder, disabled = false }) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-[#f8fafc]">
            {label}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border rounded-md text-sm bg-[#f8fafc] dark:bg-[#1e293b] border-[#64748b] text-gray-900 dark:text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-[#E6007A] disabled:bg-gray-200 dark:disabled:bg-[#1e293b]/50 disabled:cursor-not-allowed disabled:text-[#64748b]"
            aria-label={label}
        >
            <option value="">{placeholder}</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);

const WarningMessage: React.FC<{ networkSymbol: string; onDismiss: () => void }> = ({ networkSymbol, onDismiss }) => {
    const isMainnet = ["DOT", "KSM"].includes(networkSymbol.toUpperCase());
    if (!isMainnet) return null;

    return (
        <div className="p-4 rounded-lg border-l-4 border-[#E6007A] bg-[#f8fafc] dark:bg-[#1e293b]/50 text-gray-900 dark:text-[#f8fafc] flex justify-between items-start">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#E6007A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-sm">Important: Real Transactions</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-[#64748b]">
                    Transactions on {networkSymbol === "DOT" ? "Polkadot" : "Kusama"} are real and irreversible. They affect actual funds. For testing, use the Paseo testnet.
                    <a
                        href="https://docs.polkadot.network/testnet/paseo/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-[#E6007A] hover:text-[#c00065] ml-1"
                    >
                        Learn more
                    </a>
                </p>
            </div>
            <button
                onClick={onDismiss}
                className="text-[#64748b] hover:text-[#E6007A] focus:outline-none"
                aria-label="Dismiss warning"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export const TransactionConfig: React.FC<TransactionConfigProps> = React.memo(
    ({
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
        onReset,
    }) => {
        const isCustom = preset.id === "custom";
        const canBuild = isCustom ? customPallet && customCall : true;
        const [jsonError, setJsonError] = useState<string | null>(null);
        const [isWarningDismissed, setIsWarningDismissed] = useState(false);
        const [showResetConfirm, setShowResetConfirm] = useState(false);

        const handleArgsChange = (rawArgs: string) => {
            try {
                const parsedArgs = JSON.parse(rawArgs);
                setJsonError(null);
                Object.keys(parsedArgs).forEach((key) => onArgChange(key, parsedArgs[key]));
            } catch {
                setJsonError("Invalid JSON format. Please check your input.");
            }
        };

        const handleResetClick = () => {
            if (Object.keys(args).length > 0 || customPallet || customCall) {
                setShowResetConfirm(true);
            } else {
                onReset();
            }
        };

        const confirmReset = () => {
            setShowResetConfirm(false);
            onReset();
        };

        return (
            <div className="space-y-6 p-4 rounded-lg bg-[#f8fafc] dark:bg-[#1e293b]/90 border border-[#64748b]">
                {!isWarningDismissed && (
                    <WarningMessage
                        networkSymbol={network.symbol}
                        onDismiss={() => setIsWarningDismissed(true)}
                    />
                )}

                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-[#f8fafc]">
                        Configure Transaction
                    </h3>
                    <Button
                        variant="outline"
                        onClick={handleResetClick}
                        size="sm"
                        className="border-[#64748b] text-[#64748b] hover:bg-[#E6007A] hover:text-[#f8fafc] dark:hover:bg-[#E6007A] dark:hover:text-[#f8fafc]"
                    >
                        Back
                    </Button>
                </div>

                {showResetConfirm && (
                    <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-[#1e293b]/50 border border-[#64748b] flex justify-between items-center">
                        <p className="text-sm text-gray-700 dark:text-[#f8fafc]">
                            Are you sure you want to reset? All entered data will be lost.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowResetConfirm(false)}
                                className="border-[#64748b] text-[#64748b] hover:bg-[#64748b] hover:text-[#f8fafc]"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={confirmReset}
                                className="bg-[#E6007A] hover:bg-[#c00065] text-[#f8fafc]"
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                )}

                {isCustom && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                            label="Pallet"
                            value={customPallet}
                            onChange={onCustomPalletChange}
                            options={availablePallets}
                            placeholder="Select a pallet"
                        />
                        <SelectField
                            label="Call"
                            value={customCall}
                            onChange={onCustomCallChange}
                            options={availableCalls}
                            placeholder="Select a call"
                            disabled={!customPallet}
                        />
                    </div>
                )}

                {!isCustom && preset.args.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-[#f8fafc]">
                            Parameters
                        </h4>
                        {preset.args.map((arg) => (
                            <ArgumentInput
                                key={arg.name}
                                arg={arg}
                                value={args[arg.name]}
                                onChange={onArgChange}
                                networkSymbol={network.symbol}
                                isDarkMode={document.documentElement.classList.contains("dark")}
                            />
                        ))}
                    </div>
                )}

                {isCustom && customPallet && customCall && (
                    <div className="space-y-2">
                        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                        <label className="block text-sm font-medium text-gray-900 dark:text-[#f8fafc]">
                            Arguments (JSON)
                            <span
                                className="ml-2 px-2 py-0.5 text-xs rounded-full font-mono bg-[#f8fafc] dark:bg-[#1e293b]/50 text-gray-700 dark:text-[#f8fafc] border border-[#64748b]"
                            >
                                Optional
                            </span>
                        </label>
                        <textarea
                            value={JSON.stringify(args, null, 2)}
                            onChange={(e) => handleArgsChange(e.target.value)}
                            placeholder='{"arg1": "value1", "arg2": "value2"}'
                            className="w-full px-3 py-2 border rounded-md text-sm font-mono bg-[#f8fafc] dark:bg-[#1e293b] border-[#64748b] text-gray-900 dark:text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#E6007A] focus:border-[#E6007A] h-24 resize-y"
                            aria-label="Enter transaction arguments in JSON format"
                        />
                        {jsonError && (
                            <p className="text-xs text-[#EF4444] mt-1">{jsonError}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-[#64748b]">
                            Enter arguments as a JSON object. Ensure the format matches the selected pallet and call.
                        </p>
                    </div>
                )}

                <XcmHelper presetId={preset.id} />

                <Button
                    onClick={onBuild}
                    disabled={isBuilding || !canBuild}
                    className="w-full bg-[#E6007A] hover:bg-[#c00065] text-[#f8fafc] disabled:bg-[#64748b] disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isBuilding && (
                        <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 12a8 8 0 0116 0"
                            />
                        </svg>
                    )}
                    {isBuilding ? "Building..." : "Build Transaction"}
                </Button>
            </div>
        );
    }
);