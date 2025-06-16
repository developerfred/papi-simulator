/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client";

import type React from "react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { Search, ExternalLink, Wallet, RefreshCw, AlertCircle, Eye, Copy, Check, Hash } from "lucide-react";
import type { ApiPromise } from "@polkadot/api";
import { formatBalance } from "@polkadot/util";
import { buildSubscanUrl } from "@/lib/utils/explorer";

// Types
interface Network {
	name: string;
	symbol: string;
	decimals: number;
	explorer: string;
}

interface AccountBalanceProps {
	api: ApiPromise;
	network: Network;
	initialAddress?: string;
}

interface BalanceInfo {
	free: bigint;
	reserved: bigint;
	frozen: bigint;
	total: bigint;
	transferable: bigint;
	nonce: number;
}




const useAccountBalance = (api: ApiPromise, address: string, network: Network) => {
	const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const isMountedRef = useRef(true);

	const fetchBalance = useCallback(async () => {
		if (!api || !address || !api.isReady) {
			setBalanceInfo(null);
			return;
		}

		// Validate address format
		try {
			// Basic SS58 address validation
			if (address.length < 47 || address.length > 48) {
				throw new Error('Invalid address format');
			}
		} catch (err) {
			setError('Invalid address format');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {			
			const accountData = await Promise.race([
				api.query.system.account(address),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error('Request timeout')), 10000)
				)
			]);

			if (!isMountedRef.current) return;

			
			const account = accountData as any;
			const data = account.data || account;
			
			const free = BigInt(data.free?.toString() || '0');
			const reserved = BigInt(data.reserved?.toString() || '0');
			const frozen = BigInt(data.frozen?.toString() || data.miscFrozen?.toString() || '0');
			const nonce = Number(account.nonce?.toString() || '0');

			const total = free + reserved;
			const transferable = free - frozen;

			const balanceInfo: BalanceInfo = {
				free,
				reserved,
				frozen,
				total,
				transferable: transferable > 0n ? transferable : 0n,
				nonce
			};

			setBalanceInfo(balanceInfo);

		} catch (error) {
			console.error('Error fetching balance:', error);
			if (isMountedRef.current) {
				setError(error instanceof Error ? error.message : 'Failed to fetch balance');
			}
		} finally {
			if (isMountedRef.current) {
				setIsLoading(false);
			}
		}
	}, [api, address, network]);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		if (address) {
			fetchBalance();
		} else {
			setBalanceInfo(null);
			setError(null);
		}
	}, [fetchBalance, address]);

	return {
		balanceInfo,
		isLoading,
		error,
		refetch: fetchBalance
	};
};


const CopyButton = ({ text }: { text: string }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}, [text]);

	return (
		<button
			onClick={handleCopy}
			className="p-1 rounded hover:bg-theme-surface-variant transition-colors duration-200"
			title="Copy address"
		>
			{copied ? (
				<Check className="w-3 h-3 text-green-500" />
			) : (
				<Copy className="w-3 h-3 text-theme-secondary hover:text-theme-primary" />
			)}
		</button>
	);
};

const AccountHeader = ({ address }: { address: string }) => (
	<div className="space-y-2">
		<div className="flex items-center justify-between">
			<span className="text-sm font-medium text-theme-secondary">Account Address</span>
			<CopyButton text={address} />
		</div>
		<div className="bg-theme-surface-variant border border-theme rounded-lg p-3 font-mono text-xs break-all">
			{address}
		</div>
	</div>
);

const BalanceRow = ({
	label,
	amount,
	network,
	isTotal = false,
	icon
}: {
	label: string;
	amount: bigint;
	network: Network;
	isTotal?: boolean;
	icon?: React.ReactNode;
}) => {
	const formattedAmount = useMemo(() => {
		try {
			return formatBalance(amount, {
				withUnit: network.symbol,
				decimals: network.decimals,
				forceUnit: network.symbol
			});
		} catch {
			return `0 ${network.symbol}`;
		}
	}, [amount, network]);

	return (
		<div className={`flex justify-between items-center py-2 ${isTotal ? 'pt-3 border-t border-theme' : ''}`}>
			<div className="flex items-center space-x-2">
				{icon}
				<span className={`text-sm ${isTotal ? 'font-medium text-theme-primary' : 'text-theme-secondary'}`}>
					{label}
				</span>
			</div>
			<span className={`font-mono text-sm ${isTotal ? 'font-bold text-network-primary' : 'text-theme-primary'}`}>
				{formattedAmount}
			</span>
		</div>
	);
};

const StatsCard = ({
	label,
	value,
	icon,
	color = 'primary'
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	color?: 'primary' | 'success' | 'warning' | 'info';
}) => {
	const colorClasses = {
		primary: 'bg-theme-surface border-theme',
		success: 'bg-green-50/80 dark:bg-green-900/40 border-green-200/70 dark:border-green-600/70',
		warning: 'bg-yellow-50/80 dark:bg-yellow-900/40 border-yellow-200/70 dark:border-yellow-600/70',
		info: 'bg-blue-50/80 dark:bg-blue-900/40 border-blue-200/70 dark:border-blue-600/70'
	};

	return (
		<div className={`rounded-lg p-3 border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group ${colorClasses[color]}`}>
			<div className="flex items-center space-x-2 mb-1">
				<div className="text-theme-secondary group-hover:text-theme-primary transition-colors duration-300">
					{icon}
				</div>
				<span className="text-xs text-theme-secondary group-hover:text-theme-primary transition-colors duration-300">
					{label}
				</span>
			</div>
			<div className="font-mono text-sm font-semibold text-theme-primary group-hover:text-network-primary transition-colors duration-300">
				{value}
			</div>
		</div>
	);
};


export default function AccountBalance({
	api,
	network,
	initialAddress = ""
}: AccountBalanceProps) {
	const [address, setAddress] = useState(initialAddress);
	const [searchAddress, setSearchAddress] = useState(initialAddress);
	const [showDetails, setShowDetails] = useState(false);

	const { balanceInfo, isLoading, error, refetch } = useAccountBalance(api, searchAddress, network);

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		if (address.trim()) {
			setSearchAddress(address.trim());
			setShowDetails(true);
		}
	}, [address]);

	const handleClear = useCallback(() => {
		setAddress('');
		setSearchAddress('');
		setShowDetails(false);
	}, []);

	
	const quickStats = useMemo(() => {
		if (!balanceInfo) return null;

		const formatAmount = (amount: bigint) => {
			try {
				return formatBalance(amount, {
					withUnit: network.symbol,
					decimals: network.decimals,
					forceUnit: network.symbol
				});
			} catch {
				return `0 ${network.symbol}`;
			}
		};

		return {
			total: formatAmount(balanceInfo.total),
			transferable: formatAmount(balanceInfo.transferable),
			nonce: balanceInfo.nonce.toString()
		};
	}, [balanceInfo, network]);

	const isValidAddress = address.length >= 47 && address.length <= 48;

	return (
		<Card className="overflow-hidden bg-theme-surface border-2 border-theme backdrop-blur-xl shadow-2xl network-transition">			
			<div className="p-6 border-b border-theme bg-theme-surface-variant/50 backdrop-blur-lg">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 rounded-lg bg-network-primary flex items-center justify-center shadow-lg">
							<Wallet className="w-5 h-5 text-white" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-theme-primary">
								Account Balance
							</h2>
							<p className="text-sm text-theme-secondary">
								Check balances on <span className="font-medium text-network-primary">{network.name}</span>
							</p>
						</div>
					</div>

					{searchAddress && (
						<Button
							onClick={refetch}
							variant="outline"
							size="sm"
							disabled={isLoading}
							className="transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl network-transition"
						>
							<RefreshCw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
							Refresh
						</Button>
					)}
				</div>

				
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex space-x-3">
						<div className="flex-1 relative">
							<Input
								placeholder="Enter account address (47-48 characters)"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								className={`pr-10 ${address && !isValidAddress ? 'border-red-300 dark:border-red-600' : ''}`}
								size="sm"
							/>
							<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
								{address && (
									<div className={`w-2 h-2 rounded-full ${isValidAddress ? 'bg-green-500' : 'bg-red-500'}`} />
								)}
							</div>
						</div>

						<Button
							type="submit"
							variant="primary"
							size="sm"
							disabled={!isValidAddress || isLoading}
							className="transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl network-transition"
						>
							{isLoading ? (
								<RefreshCw className="w-4 h-4 animate-spin" />
							) : (
								<Search className="w-4 h-4" />
							)}
						</Button>

						{searchAddress && (
							<Button
								type="button"
								onClick={handleClear}
								variant="outline"
								size="sm"
								className="transition-all duration-300 hover:scale-105 active:scale-95 
										 hover:bg-red-50/80 dark:hover:bg-red-900/40
										 hover:text-red-500 hover:border-red-300/70 dark:hover:border-red-600/70
										 shadow-lg hover:shadow-xl network-transition"
							>
								Clear
							</Button>
						)}
					</div>

					{address && !isValidAddress && (
						<div className="text-xs text-red-600 dark:text-red-400">
							Please enter a valid Substrate address (47-48 characters)
						</div>
					)}
				</form>
			</div>

			
			{error && (
				<div className="p-4 bg-red-50/80 dark:bg-red-900/40 border-b border-red-200/70 dark:border-red-600/70 backdrop-blur-sm">
					<div className="flex items-center space-x-2">
						<AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
						<span className="text-sm font-medium text-red-700 dark:text-red-300">Error</span>
					</div>
					<p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
				</div>
			)}

			
			{isLoading && (
				<div className="p-12 text-center">
					<div className="w-16 h-16 mx-auto mb-4 bg-theme-surface-variant rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
						<RefreshCw className="w-6 h-6 text-network-primary animate-spin" />
					</div>
					<div className="text-theme-primary font-medium mb-2">
						Fetching balance...
					</div>
					<div className="text-sm text-theme-secondary">
						Querying {network.name} network
					</div>
				</div>
			)}

			{/* Balance Display */}
			{balanceInfo && !isLoading && (
				<div className="p-6 space-y-6">					
					<AccountHeader address={searchAddress} />
					
					{quickStats && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<StatsCard
								label="Total Balance"
								value={quickStats.total}
								icon={<Wallet className="w-4 h-4" />}
								color="primary"
							/>
							<StatsCard
								label="Transferable"
								value={quickStats.transferable}
								icon={<ExternalLink className="w-4 h-4" />}
								color="success"
							/>
							<StatsCard
								label="Nonce"
								value={quickStats.nonce}
								icon={<Hash className="w-4 h-4" />}
								color="info"
							/>
						</div>
					)}

					
					<div className="bg-theme-surface-variant/50 rounded-lg p-4 border border-theme backdrop-blur-sm">
						<div className="flex items-center justify-between mb-4">
							<h3 className="font-medium text-theme-primary">Balance Breakdown</h3>
							<Button
								onClick={() => setShowDetails(!showDetails)}
								variant="outline"
								size="sm"
								className="text-xs"
							>
								<Eye className="w-3 h-3 mr-1" />
								{showDetails ? 'Hide' : 'Show'} Details
							</Button>
						</div>

						<div className="space-y-1">
							<BalanceRow
								label="Free Balance"
								amount={balanceInfo.free}
								network={network}
								icon={<div className="w-3 h-3 rounded-full bg-green-500" />}
							/>

							{showDetails && (
								<>
									<BalanceRow
										label="Reserved"
										amount={balanceInfo.reserved}
										network={network}
										icon={<div className="w-3 h-3 rounded-full bg-yellow-500" />}
									/>

									<BalanceRow
										label="Frozen"
										amount={balanceInfo.frozen}
										network={network}
										icon={<div className="w-3 h-3 rounded-full bg-blue-500" />}
									/>

									<BalanceRow
										label="Transferable"
										amount={balanceInfo.transferable}
										network={network}
										icon={<div className="w-3 h-3 rounded-full bg-purple-500" />}
									/>
								</>
							)}

							<BalanceRow
								label="Total Balance"
								amount={balanceInfo.total}
								network={network}
								isTotal
								icon={<Wallet className="w-4 h-4 text-network-primary" />}
							/>
						</div>
					</div>

					
					<div className="pt-4 border-t border-theme">
						<a
							href={buildSubscanUrl(network, 'account', searchAddress)}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center space-x-2 text-sm text-network-primary 
									 hover:underline transition-all duration-200 hover:scale-105 group"
						>
							<span>View in {network.name} explorer</span>
							<ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
						</a>
					</div>
				</div>
			)}

			
			{!searchAddress && !isLoading && (
				<div className="p-12 text-center">
					<div className="w-16 h-16 mx-auto mb-4 bg-theme-surface-variant rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
						<Search className="w-8 h-8 text-theme-tertiary" />
					</div>
					<div className="text-theme-primary font-medium mb-2">
						Enter an account address
					</div>
					<div className="text-sm text-theme-secondary">
						Check balances and account information on {network.name}
					</div>
				</div>
			)}
		</Card>
	);
}