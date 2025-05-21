import { useEffect, useCallback } from "react";
import { nanoid } from "nanoid";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useChainStore } from "@/store/useChainStore";
import { TransactionStatus, Signer, TransactionMetadata } from "@/lib/types/transaction";

export type TransactionBuilder = (api: any) => any;

interface UseTransactionOptions {
    metadata?: TransactionMetadata;
}

export const useTransaction = (transactionId: string = nanoid()) => {
    const { api } = useChainStore();
    const {
        transactions,
        setTransaction,
        updateTransaction,
        setStatus,
        setTxHash,
        setError,
        setBlockInfo
    } = useTransactionStore();

    // Get the current transaction from the store or create a default one
    const transaction = transactions.find(tx => tx.id === transactionId) || {
        id: transactionId,
        status: "idle" as TransactionStatus,
        timestamp: null,
        txHash: "",
        blockInfo: null,
        error: null,
        metadata: {}
    };

    // Compute all status flags from a single source of truth
    const statusFlags = {
        isIdle: transaction.status === "idle",
        isPreparing: transaction.status === "preparing",
        isSigned: transaction.status === "signed",
        isBroadcasting: transaction.status === "broadcasting",
        isInBlock: transaction.status === "inBlock",
        isFinalized: transaction.status === "finalized",
        isError: transaction.status === "error",
    };

    const isPending = statusFlags.isPreparing || statusFlags.isSigned || statusFlags.isBroadcasting;
    const isComplete = statusFlags.isFinalized || statusFlags.isError;

    // Initialize the transaction in the store if it doesn't exist
    useEffect(() => {
        if (!transactions.some(tx => tx.id === transactionId)) {
            setTransaction({
                id: transactionId,
                status: "idle",
                timestamp: null,
                txHash: "",
                blockInfo: null,
                error: null,
                metadata: {}
            });
        }
    }, [transactionId, setTransaction, transactions]);

    // Execute a transaction
    const execute = useCallback(
        async (
            txBuilder: TransactionBuilder,
            args: any[] = [],
            signer: Signer,
            options: UseTransactionOptions = {}
        ) => {
            if (!api) throw new Error("API not connected");
            if (!signer) throw new Error("No signer provided");

            try {
                // Update status to preparing
                setStatus(transactionId, "preparing");
                updateTransaction(transactionId, { metadata: options.metadata });

                // Create and sign transaction
                const tx = txBuilder(api);
                setStatus(transactionId, "signed");
                const signed = await tx.signAsync(signer.address, { signer: signer.sign });

                // Send transaction
                setStatus(transactionId, "broadcasting");

                return new Promise((resolve, reject) => {
                    signed
                        .send((result: any) => {
                            const { status, events = [], dispatchError } = result;

                            // Set transaction hash if not already set
                            if (!transaction.txHash) {
                                setTxHash(transactionId, signed.hash.toHex());
                            }

                            // Handle transaction status updates
                            if (status.isInBlock || status.isFinalized) {
                                const blockHash = status.asInBlock?.toHex() || status.asFinalized?.toHex();

                                // Update block info when available
                                api.rpc.chain.getHeader(status.asInBlock || status.asFinalized)
                                    .then((header) => {
                                        setBlockInfo(
                                            transactionId,
                                            blockHash,
                                            header.number.toNumber()
                                        );
                                    })
                                    .catch(console.error);

                                // Check for errors
                                if (dispatchError) {
                                    let errorMessage = "Transaction failed";

                                    if (dispatchError.isModule) {
                                        try {
                                            const decoded = api.registry.findMetaError(dispatchError.asModule);
                                            errorMessage = `${decoded.section}.${decoded.method}: ${decoded.docs.join(" ")}`;
                                        } catch (error) {
                                            errorMessage = "Unknown error";
                                        }
                                    } else {
                                        errorMessage = dispatchError.toString();
                                    }

                                    setError(transactionId, { message: errorMessage });
                                    reject(new Error(errorMessage));
                                    return;
                                }

                                // Set status based on transaction state
                                setStatus(transactionId, status.isFinalized ? "finalized" : "inBlock");
                                if (status.isFinalized) resolve(result);
                            }
                        })
                        .catch((error: Error) => {
                            setError(transactionId, { message: error.message });
                            reject(error);
                        });
                });
            } catch (error) {
                setError(transactionId, { message: error.message });
                throw error;
            }
        },
        [api, transactionId, setStatus, setTxHash, setError, setBlockInfo, updateTransaction, transaction.txHash]
    );

    return {
        transaction,
        execute,
        ...statusFlags,
        isPending,
        isComplete,
    };
};