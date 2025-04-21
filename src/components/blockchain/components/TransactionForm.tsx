/* eslint-disable @typescript-eslint/ban-ts-comment  */
// @ts-nocheck

"use client";

import React, { useState, useCallback, type FormEvent } from "react";
import { useChainTx, useAccountBalance } from "@/hooks";
import { useTheme } from "@/lib/theme/ThemeProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { MultiAddress } from "@polkadot-api/descriptors";
import { toChainAmount } from "@/lib/utils/formatters";
import type { Network } from "@/lib/types/network";
import { useChainStore } from "@/store/useChainStore";
import type { TransactionStatus } from "@/store/useTransactionStore";
import type { TypedApi } from "polkadot-api";
import type { PolkadotSigner } from "polkadot-api/signer";

/**
 * Props for the TransactionForm component
 */
interface TransactionFormProps {
	/** The blockchain network to interact with */
	network: Network;
	/** Optional sender address for the transaction */
	senderAddress?: string;
}

/**
 * Component for creating and submitting transactions on a blockchain network
 */
export default function TransactionForm({
	network,
	senderAddress,
}: TransactionFormProps) {
	const { getColor, getNetworkColor } = useTheme();
	const { typedApi } = useChainStore();
	const [recipient, setRecipient] = useState<string>("");
	const [amount, setAmount] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	// Transaction state management
	const { transaction, execute, clear } = useChainTx();

	// Determine transaction status for UI state management
	const isIdle = !transaction?.status || transaction.status === "preparing";
	const isPending = ["signed", "broadcasting", "inBlock"].includes(
		transaction?.status ?? "",
	);
	const isFinalized = transaction?.status === "finalized";
	const isError = transaction?.status === "error";

	// Get sender balance to validate transaction
	const { free: availableBalance = BigInt(0) } = useAccountBalance(
		senderAddress,
		{
			refetchOnBlock: true,
		},
	);

	/**
	 * Handles form submission and transaction creation
	 */
	const handleSubmit = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			setErrorMessage("");

			try {
				// Validate inputs
				if (!recipient || !amount) {
					setErrorMessage("Please fill in all fields");
					return;
				}

				if (!typedApi) {
					setErrorMessage("Chain not connected");
					return;
				}

				const amountValue = parseFloat(amount);
				if (isNaN(amountValue) || amountValue <= 0) {
					setErrorMessage("Please enter a valid amount greater than 0");
					return;
				}

				// Convert human-readable amount to chain amount
				const chainAmount = toChainAmount(network, amountValue);

				// Validate balance
				if (chainAmount >= availableBalance) {
					setErrorMessage("Insufficient balance");
					return;
				}

				// Create mock signer for demonstration purposes
				// In a real app, this would be connected to a real wallet
				const mockSigner: PolkadotSigner = {
					publicKey: new Uint8Array(32).fill(1),
					sign: async () => new Uint8Array(64).fill(1),
				};

				// Create and execute the transaction
				await execute(
					(api: TypedApi) =>
						api.tx.Balances.transfer_keep_alive({
							dest: MultiAddress.Id(recipient),
							value: chainAmount,
						}),
					[],
					mockSigner,
					{
						metadata: {
							title: `Transfer ${amount} ${network.tokenSymbol}`,
							recipient,
						},
					},
				);
			} catch (error) {
				setErrorMessage(error instanceof Error ? error.message : String(error));
			}
		},
		[recipient, amount, typedApi, network, availableBalance, execute],
	);

	/**
	 * Resets form and transaction state
	 */
	const handleReset = useCallback(() => {
		setRecipient("");
		setAmount("");
		setErrorMessage("");
		clear();
	}, [clear]);

	return (
		<Card
			header={
				<div className="flex justify-between items-center">
					<span className="font-medium">Send Transaction</span>
					{!isIdle && transaction?.status && (
						<TransactionStatusBadge status={transaction.status} />
					)}
				</div>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Sender info */}
				{senderAddress && (
					<div className="mb-4">
						<div className="text-sm font-medium mb-1">From</div>
						<div
							className="font-mono text-xs break-all p-2 rounded"
							style={{ backgroundColor: getColor("surfaceVariant") }}
						>
							{senderAddress}
						</div>
					</div>
				)}

				{/* Recipient input */}
				<div>
					<label className="block text-sm font-medium mb-1">Recipient</label>
					<Input
						placeholder="Enter recipient address"
						value={recipient}
						onChange={(e) => setRecipient(e.target.value)}
						disabled={isPending || isFinalized}
						fullWidth
					/>
				</div>

				{/* Amount input */}
				<div>
					<label className="block text-sm font-medium mb-1">
						Amount ({network.tokenSymbol})
					</label>
					<Input
						placeholder={`Amount in ${network.tokenSymbol}`}
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						disabled={isPending || isFinalized}
						fullWidth
					/>
				</div>

				{/* Error message */}
				{(errorMessage || transaction?.error) && (
					<div
						className="p-2 rounded text-sm"
						style={{
							backgroundColor: `${getColor("error")}20`,
							color: getColor("error"),
						}}
					>
						{errorMessage || transaction?.error?.message}
					</div>
				)}

				{/* Transaction info if available */}
				{transaction?.txHash && (
					<div
						className="p-3 rounded"
						style={{ backgroundColor: getColor("surfaceVariant") }}
					>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm font-medium">Transaction Hash:</span>
							</div>
							<div
								className="font-mono text-xs break-all p-2 rounded"
								style={{ backgroundColor: getColor("surface") }}
							>
								{transaction.txHash}
							</div>

							{isFinalized && transaction.blockInfo?.blockNumber && (
								<>
									<div className="flex justify-between mt-2">
										<span className="text-sm font-medium">Block Number:</span>
										<span className="font-mono">
											{transaction.blockInfo.blockNumber}
										</span>
									</div>

									<div
										className="pt-2 mt-2 border-t"
										style={{ borderColor: getColor("border") }}
									>
										<div className="flex justify-end">
											<a
												href={`${network.explorer}/extrinsic/${transaction.txHash}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm hover:underline"
												style={{ color: getNetworkColor("primary") }}
											>
												View in explorer →
											</a>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				)}

				{/* Action buttons */}
				<div className="flex space-x-3 pt-2">
					{isIdle || isError ? (
						<Button
							type="submit"
							variant="primary"
							fullWidth
							disabled={isPending}
						>
							{isPending ? "Sending..." : "Send Transaction"}
						</Button>
					) : (
						<Button
							type="button"
							variant="outline"
							fullWidth
							onClick={handleReset}
						>
							{isFinalized ? "Send Another" : "Cancel"}
						</Button>
					)}
				</div>
			</form>
		</Card>
	);
}

/**
 * Props for the TransactionStatusBadge component
 */
interface TransactionStatusBadgeProps {
	/** Current status of the transaction */
	status: TransactionStatus;
}

/**
 * Displays a badge representing the current transaction status
 */
function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
	switch (status) {
		case "preparing":
			return <Badge variant="warning">Preparing</Badge>;
		case "signed":
			return <Badge variant="warning">Signed</Badge>;
		case "broadcasting":
			return <Badge variant="warning">Broadcasting</Badge>;
		case "inBlock":
			return <Badge variant="info">In Block</Badge>;
		case "finalized":
			return <Badge variant="success">Finalized</Badge>;
		case "error":
			return <Badge variant="error">Failed</Badge>;
		default:
			return null;
	}
}
