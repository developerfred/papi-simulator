import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction, TransactionError, TransactionStatus } from "@/lib/types/transaction";

interface TransactionState {
	transactions: Transaction[];
	currentTransaction: Transaction | null;

	// Actions - combining related functions into fewer methods
	setTransaction: (transaction: Transaction) => void;
	updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
	clearTransaction: (transactionId: string) => void;
	clearAllTransactions: () => void;
	loadTransactions: () => Promise<void>;

	// Status update methods
	setStatus: (transactionId: string, status: TransactionStatus) => void;
	setTxHash: (transactionId: string, hash: string) => void;
	setError: (transactionId: string, error: TransactionError) => void;
	setBlockInfo: (transactionId: string, blockHash: string, blockNumber: number) => void;
}

export const useTransactionStore = create<TransactionState>()(
	persist(
		(set, get) => ({
			transactions: [],
			currentTransaction: null,

			// Combined function to add or update a transaction
			setTransaction: (transaction: Transaction) => {
				set(state => {
					const exists = state.transactions.some(tx => tx.id === transaction.id);
					return {
						transactions: exists
							? state.transactions.map(tx => tx.id === transaction.id ? { ...tx, ...transaction } : tx)
							: [transaction, ...state.transactions],
						currentTransaction: transaction
					};
				});
			},

			// Update specific fields of a transaction
			updateTransaction: (transactionId: string, updates: Partial<Transaction>) => {
				set(state => ({
					transactions: state.transactions.map(tx =>
						tx.id === transactionId ? { ...tx, ...updates } : tx
					),
					currentTransaction: state.currentTransaction?.id === transactionId
						? { ...state.currentTransaction, ...updates }
						: state.currentTransaction
				}));
			},

			// Remove a transaction
			clearTransaction: (transactionId: string) => {
				set(state => ({
					transactions: state.transactions.filter(tx => tx.id !== transactionId),
					currentTransaction: state.currentTransaction?.id === transactionId
						? null
						: state.currentTransaction
				}));
			},

			// Clear all transactions
			clearAllTransactions: () => {
				set({ transactions: [], currentTransaction: null });
			},

			// Load transactions (from persistence layer if needed)
			loadTransactions: async () => Promise.resolve(),

			// Update transaction status
			setStatus: (transactionId: string, status: TransactionStatus) => {
				set(state => {
					// Create an update object that includes timestamp if not set
					const statusUpdate = {
						status,
						timestamp: Date.now() // Always update timestamp for tracking purposes
					};

					return {
						transactions: state.transactions.map(tx =>
							tx.id === transactionId ? { ...tx, ...statusUpdate } : tx
						),
						currentTransaction: state.currentTransaction?.id === transactionId
							? { ...state.currentTransaction, ...statusUpdate }
							: state.currentTransaction
					};
				});
			},

			// Set transaction hash
			setTxHash: (transactionId: string, txHash: string) => {
				set(state => ({
					transactions: state.transactions.map(tx =>
						tx.id === transactionId ? { ...tx, txHash } : tx
					),
					currentTransaction: state.currentTransaction?.id === transactionId
						? { ...state.currentTransaction, txHash }
						: state.currentTransaction
				}));
			},

			// Set error and update status
			setError: (transactionId: string, error: TransactionError) => {
				set(state => ({
					transactions: state.transactions.map(tx =>
						tx.id === transactionId ? { ...tx, error, status: 'error' } : tx
					),
					currentTransaction: state.currentTransaction?.id === transactionId
						? { ...state.currentTransaction, error, status: 'error' }
						: state.currentTransaction
				}));
			},

			// Set block information
			setBlockInfo: (transactionId: string, blockHash: string, blockNumber: number) => {
				const blockInfo = { blockHash, blockNumber };
				set(state => ({
					transactions: state.transactions.map(tx =>
						tx.id === transactionId ? { ...tx, blockInfo } : tx
					),
					currentTransaction: state.currentTransaction?.id === transactionId
						? { ...state.currentTransaction, blockInfo }
						: state.currentTransaction
				}));
			}
		}),
		{
			name: 'transaction-store',
			partialize: (state) => ({ transactions: state.transactions }),
		}
	)
);