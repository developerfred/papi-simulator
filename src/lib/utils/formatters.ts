import type { Network } from "../types/network";

/**
 * Formats a token amount from chain format (with all decimals) to human-readable format
 *
 * @param network The network configuration
 * @param amount The amount in smallest units (e.g., Planck), or undefined
 * @param includeSymbol Whether to include the token symbol in the output
 * @param decimals Number of decimal places to show (defaults to 4)
 * @returns Formatted amount as a string
 */
export function formatTokenAmount(
	network: Network,
	amount: bigint | undefined,
	includeSymbol = true,
	decimals = 4,
): string {
	// Validação reforçada
	if (amount === undefined || amount === null) {
		return includeSymbol ? `0 ${network.tokenSymbol}` : "0";
	}

	// Conversão segura para tokenDecimals
	const tokenDecimals = Number(network.tokenDecimals) || 0;

	try {
		const divisor = 10n ** BigInt(tokenDecimals);
		const whole = amount / divisor;
		const fractional = amount % divisor;

		// Formatação da parte fracionária
		let fractionalStr = fractional.toString()
			.padStart(tokenDecimals, '0')
			.substring(0, decimals);

		// Remove zeros não significativos no final
		fractionalStr = fractionalStr.replace(/0+$/, '');

		const formattedAmount = fractionalStr
			? `${whole.toString()}.${fractionalStr}`
			: whole.toString();

		return includeSymbol
			? `${formattedAmount} ${network.tokenSymbol}`
			: formattedAmount;

	} catch (error) {
		console.error("Error formatting token amount:", error);
		return includeSymbol ? `0 ${network.tokenSymbol}` : "0";
	}
}
/**
 * Converts a human-readable amount to chain format with all decimals
 *
 * @param network The network configuration
 * @param humanAmount The amount as a human-readable string or number
 * @returns Amount in smallest units as a BigInt
 */
export function toChainAmount(
	network: Network,
	humanAmount: string | number,
): bigint {
	const amount =
		typeof humanAmount === "string"
			? Number.parseFloat(humanAmount)
			: humanAmount;
	const factor = 10 ** network.tokenDecimals;

	// Multiply by the decimal factor and convert to BigInt
	return BigInt(Math.floor(amount * factor));
}

/**
 * Shortens an address for display purposes
 *
 * @param address The full address
 * @returns Shortened address (e.g., "5GrwvaE...utQY")
 */
export function shortenAddress(address: string): string {
	if (!address) return "";

	const start = address.substring(0, 7);
	const end = address.substring(address.length - 4);

	return `${start}...${end}`;
}

/**
 * Formats a URL for an address on a block explorer
 *
 * @param network The network configuration
 * @param address The address to link to
 * @returns Complete URL to view the address on the block explorer
 */
export function formatExplorerAddressUrl(
	network: Network,
	address: string,
): string {
	return `${network.explorer}/account/${address}`;
}

/**
 * Formats a URL for a block on a block explorer
 *
 * @param network The network configuration
 * @param blockNumber The block number or hash
 * @returns Complete URL to view the block on the explorer
 */
export function formatExplorerBlockUrl(
	network: Network,
	blockNumber: number | string,
): string {
	return `${network.explorer}/block/${blockNumber}`;
}
