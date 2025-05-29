/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

"use client";

import type React from "react";
import { useState, useCallback, useMemo } from "react";
import type { ApiPromise } from "@polkadot/api";
import { formatBalance } from "@polkadot/util";
import { Card, Button } from "@/components/ui";
import dynamic from "next/dynamic";

const TransactionBuilder = dynamic(
    () => import("./TransactionBuilder"),
    { ssr: false }
);

interface Network {
    name: string;
    symbol: string;
    decimals: number;
}

interface WalletAccount {
    address: string;
    meta?: {
        name?: string;
    };
}

interface TransactionFormProps {
    api: ApiPromise;
    network: Network;
    senderAccount: WalletAccount;
}

// Quick transfer component for simple transfers
const QuickTransfer: React.FC<{
    api: ApiPromise;
    network: Network;
    senderAccount: WalletAccount;
    onSuccess: () => void;
}> = ({ api, network, senderAccount, onSuccess }) => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);

    const handleQuickTransfer = useCallback(async () => {
        if (!recipient || !amount) return;

        setIsTransferring(true);
        try {
            const { web3FromAddress } = await import("@polkadot/extension-dapp");
            const injector = await web3FromAddress(senderAccount.address);

            const balance = parseFloat(amount) * Math.pow(10, network.decimals);
            const tx = api.tx.balances.transferKeepAlive(recipient, balance);

            await tx.signAndSend(
                senderAccount.address,
                { signer: injector.signer },
                (result: any) => {
                    if (result.status.isFinalized) {
                        setRecipient('');
                        setAmount('');
                        onSuccess();
                    }
                }
            );
        } catch (error) {
            console.error('Transfer error:', error);
        } finally {
            setIsTransferring(false);
        }
    }, [api, senderAccount.address, recipient, amount, network.decimals, onSuccess]);

    return (
        <div className="space-y-4">
            <h3 className="font-medium">Transferência Rápida</h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Para</label>
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Endereço de destino"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Quantidade</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Quantidade em ${network.symbol}`}
                        step="0.001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <Button
                    onClick={handleQuickTransfer}
                    disabled={!recipient || !amount || isTransferring}
                    className="w-full"
                    size="sm"
                >
                    {isTransferring ? 'Transferindo...' : 'Transferir'}
                </Button>
            </div>
        </div>
    );
};

const EnhancedTransactionForm: React.FC<TransactionFormProps> = ({
    api,
    network,
    senderAccount
}) => {
    const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleTransactionSuccess = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <Card className="p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Transações</h2>
                <div className="flex space-x-2">
                    <Button
                        variant={mode === 'quick' ? 'primary' : 'outline'}
                        onClick={() => setMode('quick')}
                        size="sm"
                    >
                        Transferência Rápida
                    </Button>
                    <Button
                        variant={mode === 'advanced' ? 'primary' : 'outline'}
                        onClick={() => setMode('advanced')}
                        size="sm"
                    >
                        Transaction Builder
                    </Button>
                </div>
            </div>

            {mode === 'quick' ? (
                <QuickTransfer
                    api={api}
                    network={network}
                    senderAccount={senderAccount}
                    onSuccess={handleTransactionSuccess}
                />
            ) : (
                <TransactionBuilder
                    api={api}
                    network={network}
                    senderAccount={senderAccount}
                />
            )}
        </Card>
    );
};

export default EnhancedTransactionForm;