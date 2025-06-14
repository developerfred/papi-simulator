/**
 * Parachain information
 */
export interface Parachain {
	/** Parachain ID */
	paraId: number;
	/** Human-readable parachain name */
	name: string;
	/** Native token symbol */
	symbol: string;
}

/**
 * XCM configuration for networks
 */
export interface XcmConfig {
	/** XCM version supported */
	version: 'V3' | 'V4';
	/** Supported XCM methods */
	supportedMethods: string[];
	/** Default weight limit */
	defaultWeightLimit: 'Unlimited' | 'Limited';
	/** Maximum message size in bytes */
	maxMessageSize: number;
	/** Whether XCM is fully supported */
	fullySupported: boolean;
	/** Whether XCM is enabled */
	xcmEnabled: boolean;
	/** Whether this is a testnet */
	isTestnet?: boolean;
	/** Known limitations */
	limitations?: string[];
	/** Supported XCM routes */
	supportedRoutes?: string[];
	/** Additional notes */
	notes?: string[];
}

/**
 * Network health status
 */
export interface NetworkHealth {
	/** Whether the network is online */
	online: boolean;
	/** Response time in milliseconds */
	responseTime?: number;
	/** Latest block number */
	latestBlock?: number;
	/** Last check timestamp */
	lastCheck?: Date;
}

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
	/** Network type for categorization */
	networkType: 'polkadot' | 'kusama' | 'paseo' | 'westend';
	/** XCM configuration */
	xcmConfig?: XcmConfig;
	/** System parachains */
	systemParachains?: Parachain[];
	/** Supported parachains */
	supportedParachains?: Parachain[];
	/** Alternative RPC endpoints */
	alternativeEndpoints?: string[];
	/** Network health check endpoint */
	healthEndpoint?: string;
	/** Network health status */
	health?: NetworkHealth;
	/** Network color for UI theming */
	color?: string;
	/** Network icon/logo URL */
	icon?: string;
	/** Genesis hash for verification */
	genesisHash?: string;
	/** Chain specification version */
	specVersion?: number;
	/** Transaction version */
	transactionVersion?: number;
	/** Whether the network supports smart contracts */
	supportsContracts?: boolean;
	/** Supported account formats */
	accountFormats?: ('sr25519' | 'ed25519' | 'ecdsa')[];
	/** Network-specific features */
	features?: {
		/** Governance system type */
		governance?: 'democracy' | 'council' | 'opengov' | 'collective';
		/** Staking system available */
		staking?: boolean;
		/** Identity pallet available */
		identity?: boolean;
		/** Multisig support */
		multisig?: boolean;
		/** Proxy support */
		proxy?: boolean;
		/** Treasury available */
		treasury?: boolean;
		/** Bounties available */
		bounties?: boolean;
		/** Tips available */
		tips?: boolean;
		/** Society pallet */
		society?: boolean;
		/** Vesting schedules */
		vesting?: boolean;
		/** Recovery pallet */
		recovery?: boolean;
		/** Scheduler pallet */
		scheduler?: boolean;
		/** Preimage pallet */
		preimage?: boolean;
		/** Asset management */
		assets?: boolean;
		/** NFT support */
		nfts?: boolean;
		/** Uniques pallet */
		uniques?: boolean;
	};
	/** Network-specific metadata */
	metadata?: {
		/** Official website */
		website?: string;
		/** Social media links */
		social?: {
			twitter?: string;
			discord?: string;
			telegram?: string;
			github?: string;
			reddit?: string;
		};
		/** Documentation links */
		documentation?: string;
		/** Wiki or help resources */
		wiki?: string;
		/** API documentation */
		apiDocs?: string;
		/** Whitepaper or technical docs */
		whitepaper?: string;
	};
	/** Rate limiting configuration */
	rateLimit?: {
		/** Requests per minute */
		requestsPerMinute: number;
		/** Burst capacity */
		burstCapacity?: number;
		/** Cooldown period in seconds */
		cooldownPeriod?: number;
	};
	/** Connection settings */
	connection?: {
		/** Connection timeout in milliseconds */
		timeout?: number;
		/** Retry attempts */
		retryAttempts?: number;
		/** Auto-reconnect */
		autoReconnect?: boolean;
		/** Keep-alive interval */
		keepAlive?: number;
	};
	/** Development settings */
	development?: {
		/** Local development endpoint */
		localEndpoint?: string;
		/** Docker compose available */
		dockerCompose?: boolean;
		/** Parachain template available */
		parachainTemplate?: boolean;
		/** Test data available */
		testData?: boolean;
	};
}

/**
 * Network selection criteria
 */
export interface NetworkFilter {
	/** Filter by test/production */
	testOnly?: boolean;
	/** Filter by XCM support */
	xcmEnabled?: boolean;
	/** Filter by specific features */
	features?: (keyof Network['features'])[];
	/** Filter by network type */
	networkType?: Network['networkType'][];
	/** Filter by online status */
	onlineOnly?: boolean;
}

/**
 * Network comparison result
 */
export interface NetworkComparison {
	/** Networks being compared */
	networks: Network[];
	/** Common features */
	commonFeatures: string[];
	/** Unique features per network */
	uniqueFeatures: Record<string, string[]>;
	/** Performance comparison */
	performance: Record<string, {
		responseTime: number;
		blockTime: number;
		throughput: number;
	}>;
}

/**
 * Network validation result
 */
export interface NetworkValidation {
	/** Whether the network configuration is valid */
	isValid: boolean;
	/** Validation errors */
	errors: string[];
	/** Validation warnings */
	warnings: string[];
	/** Connection test result */
	connectionTest?: {
		success: boolean;
		responseTime?: number;
		error?: string;
	};
}

/**
 * Network metrics for monitoring
 */
export interface NetworkMetrics {
	/** Network identifier */
	networkId: string;
	/** Current block height */
	blockHeight: number;
	/** Block time in seconds */
	blockTime: number;
	/** Number of active validators */
	activeValidators: number;
	/** Total issuance */
	totalIssuance: string;
	/** Active accounts */
	activeAccounts: number;
	/** Finalized block hash */
	finalizedHash: string;
	/** Peer count */
	peerCount: number;
	/** Sync status */
	syncStatus: 'syncing' | 'synced' | 'offline';
	/** Last update timestamp */
	lastUpdate: Date;
}