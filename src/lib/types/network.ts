/**
 * Network configuration type
 */
export interface Network {
    /** Unique identifier for the network */
    id: string;
    /** Human-readable network name */
    name: string;
    /** WebSocket RPC endpoint */
    endpoint: string;
    /** URL to the network's faucet */
    faucet: string;
    /** URL to the network's block explorer */
    explorer: string;
    /** Whether this is a test network */
    isTest: boolean;
    /** Native token symbol */
    tokenSymbol: string;
    /** Number of decimal places for the native token */
    tokenDecimals: number;
    /** Key to use when importing from @polkadot-api/descriptors */
    descriptorKey: string;
    /** Path to use when importing chain spec */
    chainSpecPath: string;
}