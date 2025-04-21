/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";
import { useState } from "react";
import { useAccountBalance } from "@/hooks";
import { useTheme } from "@/lib/theme/ThemeProvider";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Network } from "@/lib/types/network";
import { formatTokenAmount } from "@/lib/utils/formatters";

/**
 * Component that displays and queries account balances
 */
export default function AccountBalance({
	network,
	initialAddress,
}: {
	network: Network;
	initialAddress?: string;
}) {
	const { getColor, getNetworkColor } = useTheme();
	const [address, setAddress] = useState(initialAddress || "");
	const [searchAddress, setSearchAddress] = useState(initialAddress || "");

	// Query balance for the current search address
	const { free, reserved, frozen, total, isLoading, error, refetch } =
		useAccountBalance(searchAddress, {
			refetchOnBlock: true,
		});

	// Handle search form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchAddress(address);
	};

	return (
		<Card
			header={
				<div className="flex justify-between items-center">
					<span className="font-medium">Account Balance</span>
				</div>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="flex space-x-2">
					<Input
						placeholder="Enter account address"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						fullWidth
						size="sm"
					/>
					<Button
						type="submit"
						variant="primary"
						size="sm"
						disabled={!address || isLoading}
					>
						{isLoading ? "Loading..." : "Check"}
					</Button>
				</div>

				{error && (
					<div
						className="p-2 rounded text-sm"
						style={{
							backgroundColor: `${getColor("error")}20`,
							color: getColor("error"),
						}}
					>
						Error: {error.message}
					</div>
				)}

				{searchAddress && !error && (
					<div
						className="p-3 rounded"
						style={{ backgroundColor: getColor("surfaceVariant") }}
					>
						{isLoading ? (
							<div className="text-center py-4">Loading balance...</div>
						) : (
							<div className="space-y-3">
								<AccountHeader address={searchAddress} />

								<BalanceRow
									label="Free Balance"
									amount={free}
									network={network}
								/>

								<BalanceRow
									label="Reserved"
									amount={reserved}
									network={network}
								/>

								<BalanceRow label="Frozen" amount={frozen} network={network} />

								<div
									className="pt-2 border-t"
									style={{ borderColor: getColor("border") }}
								>
									<BalanceRow
										label="Total Balance"
										amount={total}
										network={network}
										isTotal
									/>
								</div>

								<div className="pt-2 flex justify-end">
									<a
										href={`${network.explorer}/account/${searchAddress}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm hover:underline"
										style={{ color: getNetworkColor("primary") }}
									>
										View in explorer →
									</a>
								</div>
							</div>
						)}
					</div>
				)}
			</form>
		</Card>
	);
}

/**
 * Account header component
 */
function AccountHeader({ address }: { address: string }) {
	const { getColor } = useTheme();

	return (
		<div>
			<div className="text-sm font-medium">Account</div>
			<div
				className="font-mono text-xs break-all mt-1 p-2 rounded"
				style={{ backgroundColor: getColor("surface") }}
			>
				{address}
			</div>
		</div>
	);
}

/**
 * Balance row component
 */
function BalanceRow({
	label,
	amount,
	network,
	isTotal = false,
}: {
	label: string;
	amount: bigint;
	network: Network;
	isTotal?: boolean;
}) {
	const { getColor, getNetworkColor } = useTheme();

	return (
		<div className="flex justify-between items-center">
			<span className="text-sm" style={{ color: getColor("textSecondary") }}>
				{label}:
			</span>
			<span
				className={`text-sm font-mono ${isTotal ? "font-semibold" : ""}`}
				style={{
					color: isTotal ? getNetworkColor("primary") : getColor("textPrimary"),
				}}
			>
				{formatTokenAmount(network, amount, true, 4)}
			</span>
		</div>
	);
}
