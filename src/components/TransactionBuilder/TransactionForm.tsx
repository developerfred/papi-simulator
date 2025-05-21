"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useChainStore } from "@/store/useChainStore";
import { useSignerStore } from "@/store/useSignerStore";
import { useTransactionForm, TransactionType } from "@/hooks/useTransactionForm";

interface TransactionFormProps {
    transactionId: string;
    className?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
    transactionId,
    className = ""
}) => {
    const { network } = useChainStore();
    const { selectedSigner } = useSignerStore();
    const {
        transactionType,
        setTransactionType,
        formData,
        handleChange,
        handleSubmit,
        formError,
        isPending,
        availablePallets,
        availableCalls,
    } = useTransactionForm(transactionId);

    // Render form fields based on transaction type
    const renderFormFields = () => {
        switch (transactionType) {
            case "balanceTransfer":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Recipient Address</label>
                            <Input
                                placeholder="Enter recipient address"
                                value={formData.dest}
                                onChange={(e) => handleChange("dest", e.target.value)}
                                disabled={isPending}
                                fullWidth
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Amount ({network.tokenSymbol})
                            </label>
                            <Input
                                placeholder={`Amount in ${network.tokenSymbol}`}
                                value={formData.value}
                                onChange={(e) => handleChange("value", e.target.value)}
                                disabled={isPending}
                                fullWidth
                            />
                        </div>
                    </>
                );
            case "remarkWithEvent":
                return (
                    <div>
                        <label className="block text-sm font-medium mb-1">Remark</label>
                        <textarea
                            className="w-full p-2 border rounded-md bg-surface"
                            placeholder="Enter your remark text"
                            value={formData.remark}
                            onChange={(e) => handleChange("remark", e.target.value)}
                            disabled={isPending}
                            rows={4}
                        />
                    </div>
                );
            case "custom":
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Pallet</label>
                                <select
                                    className="w-full p-2 border rounded-md bg-surface"
                                    value={formData.pallet}
                                    onChange={(e) => handleChange("pallet", e.target.value)}
                                    disabled={isPending}
                                >
                                    {availablePallets.map(pallet => (
                                        <option key={pallet} value={pallet}>{pallet}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Call</label>
                                <select
                                    className="w-full p-2 border rounded-md bg-surface"
                                    value={formData.call}
                                    onChange={(e) => handleChange("call", e.target.value)}
                                    disabled={isPending || !formData.pallet}
                                >
                                    {availableCalls.map(call => (
                                        <option key={call} value={call}>{call}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Parameters (JSON)</label>
                            <textarea
                                className="w-full p-2 border rounded-md bg-surface font-mono text-sm"
                                placeholder='{"param1": "value1", "param2": 123}'
                                value={formData.params}
                                onChange={(e) => handleChange("params", e.target.value)}
                                disabled={isPending}
                                rows={4}
                            />
                            <div className="mt-1 text-xs text-theme-tertiary">
                                Enter parameters as a JSON object matching the call signature
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <Card className={className}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Transaction Type</label>
                    <select
                        className="w-full p-2 border rounded-md bg-surface"
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                        disabled={isPending}
                    >
                        <option value="balanceTransfer">Balance Transfer</option>
                        <option value="remarkWithEvent">Add Remark</option>
                        <option value="custom">Custom Transaction</option>
                    </select>
                </div>

                {renderFormFields()}

                {formError && (
                    <div className="p-2 rounded bg-red-100 text-red-600 text-sm">
                        {formError}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={isPending || !selectedSigner}
                    networkColored
                >
                    {isPending ? "Processing..." : "Submit Transaction"}
                </Button>
            </form>
        </Card>
    );
};

export default TransactionForm;