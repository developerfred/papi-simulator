import type { Network } from "../types/network";

/**
 * Formats a token amount from chain format (with all decimals) to human-readable format
 *
 * @param network The network configuration
 * @param amount The amount in smallest units (e.g., Planck)
 * @param includeSymbol Whether to include the token symbol in the output
 * @param decimals Number of decimal places to show (defaults to 4)
 * @returns Formatted amount as a string
 */
export function formatTokenAmount(
	network: Network,
	amount: bigint,
	includeSymbol = true,
	decimals = 4,
): string {
	const divisor = BigInt(10) ** BigInt(network.tokenDecimals);
	const whole = amount / divisor;
	const fraction = amount % divisor;

	// Format to include leading zeros for the fraction part
	const fractionStr = fraction.toString().padStart(network.tokenDecimals, "0");

	// Trim to requested decimal places
	const trimmedFraction = fractionStr.substring(0, decimals);

	const formattedAmount = `${whole.toString()}.${trimmedFraction}`;

	return includeSymbol
		? `${formattedAmount} ${network.tokenSymbol}`
		: formattedAmount;
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


/**
 * Truncate a hash or address to a readable format
 * @param hash The full hash/address to truncate
 * @param length The number of characters to keep at each end
 * @returns Formatted string with characters at start and end
 */
export function truncateHash(hash: string, length = 4): string {
	if (!hash) return '';
	if (hash.length <= length * 2) return hash;

	return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}