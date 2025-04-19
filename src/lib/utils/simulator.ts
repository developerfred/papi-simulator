import type { Example } from "../types/example";
import type { ConsoleOutput } from "../types/example";
import type { Network } from "../types/network";

/**
 * Simulated output content for different example types
 */
const SIMULATED_OUTPUTS: Record<string, (network: Network) => string> = {
	// Simple transfer example
	"simple-transfer": (
		network,
	) => `Encoded transaction: 0x0400ff8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48e5c0fd77568d694a67dbf7711ef56ae5a9f95cd47c4ed95369791ba28f48c10f6fba3cb5211000004000000

To execute this transfer on ${network.name}:
1. Get testnet tokens from ${network.faucet}
2. Use a wallet like Polkadot.js extension to sign and submit
3. View results in the explorer: ${network.explorer}`,

	// Query balance example
	"query-balance": (network) => `Account Info: {
  providers: 1n,
  sufficients: 0n,
  consumers: 0n,
  data: {
    free: 1223523269650000n,
    reserved: 0n,
    frozen: 0n
  }
}
Free Balance: 1223523269650000
Reserved Balance: 0
Total Balance: 1223523269650000
Human readable balance: 1223.5233 ${network.tokenSymbol}`,

	// Watch blocks example
	"watch-blocks": (network) => {
		const timestamp = new Date().toISOString();
		const blockNumber = 19043122 + Math.floor(Math.random() * 100);
		const blockHash = generateRandomHash();
		const parentHash = generateRandomHash();

		return `Starting to watch finalized blocks on ${network.name}...
Will unsubscribe after 30 seconds (in a real app, manage subscription lifecycle)
Finalized Block: {
  number: ${blockNumber},
  hash: "${blockHash}",
  parentHash: "${parentHash}",
  timestamp: "${timestamp}"
}
Block explorer link: ${network.explorer}/block/${blockNumber}
Finalized Block: {
  number: ${blockNumber + 1},
  hash: "${generateRandomHash()}",
  parentHash: "${blockHash}",
  timestamp: "${new Date(Date.now() + 6000).toISOString()}"
}
Block explorer link: ${network.explorer}/block/${blockNumber + 1}`;
	},

	// Query storage example
	"query-storage": (network) => `Runtime Version: {
  specName: "${network.id}",
  implName: "parity-${network.id}",
  authoringVersion: 1,
  specVersion: 9430,
  implVersion: 0,
  apis: [
    ["0xdf6acb689907609b", 4],
    ["0x37e397fc7c91f5e4", 1],
    // ... more APIs ...
  ],
  transactionVersion: 21,
  stateVersion: 0
}`,

	// Chain properties example
	"chain-properties": (network) => `Chain Properties: {
  ss58Format: ${network.id === "polkadot" ? "0" : network.id === "kusama" ? "2" : "42"},
  tokenDecimals: [${network.tokenDecimals}],
  tokenSymbol: ["${network.tokenSymbol}"]
}`,

	// Submit and watch extrinsic example
	"extrinsic-lifecycle":
		() => `Transaction broadcast: 0x${generateRandomHash(32)}
Transaction included in block #${19043122 + Math.floor(Math.random() * 100)}
Transaction status: Ready
Transaction status: Broadcast
Transaction status: InBlock
Transaction status: Finalized
Transaction completed successfully
Events: [
  {
    section: "system",
    method: "ExtrinsicSuccess",
    data: [{ weight: {"refTime": 123456789, "proofSize": 0}, class: "Mandatory", paysFee: "Yes" }]
  },
  {
    section: "balances",
    method: "Transfer",
    data: ["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", 1000000000000]
  }
]`,
};

/**
 * Generate a random hash string of specified length (in bytes)
 */
function generateRandomHash(length = 32): string {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * Simulates running a code example with improved realistic outputs
 */
export async function simulateCodeExecution(
	example: Example,
	network: Network,
): Promise<ConsoleOutput[]> {
	return new Promise((resolve) => {
		// Create initial "running" output
		const outputs: ConsoleOutput[] = [
			{
				type: "log",
				content: `Running code on ${network.name}...`,
				timestamp: Date.now(),
			},
		];

		// Simulate execution with realistic delay
		setTimeout(
			() => {
				// Get the simulated output for this example, or generate a fallback
				const outputContent =
					SIMULATED_OUTPUTS[example.id]?.(network) ||
					generateFallbackOutput(example, network);

				// Add the simulated output
				outputs.push({
					type: "log",
					content: outputContent,
					timestamp: Date.now(),
				});

				resolve(outputs);
			},
			Math.floor(Math.random() * 1000) + 500,
		); // Random delay between 500-1500ms
	});
}

/**
 * Generates a fallback output for examples without predefined simulations
 */
function generateFallbackOutput(example: Example, network: Network): string {
	// Generate a generic output based on example categories
	if (example.categories.includes("transactions")) {
		return (
			`Transaction simulation for "${example.name}" on ${network.name}:\n` +
			`- Created transaction with random nonce\n` +
			`- Gas estimation: ${Math.floor(Math.random() * 1000000) + 100000}\n` +
			`- Encoded call data: 0x${generateRandomHash(16)}\n` +
			`\nTo run this transaction for real:\n` +
			`1. Get test tokens from ${network.faucet}\n` +
			`2. Connect a wallet like Polkadot.js extension\n` +
			`3. Execute the transaction\n`
		);
	}

	if (example.categories.includes("queries")) {
		return (
			`Query simulation for "${example.name}" on ${network.name}:\n` +
			`Successfully connected to ${network.endpoint}\n` +
			`Retrieved data at block #${19043122 + Math.floor(Math.random() * 100)}\n` +
			`Result: { ... simulated data would appear here ... }\n`
		);
	}

	if (example.categories.includes("subscriptions")) {
		return (
			`Subscription simulation for "${example.name}" on ${network.name}:\n` +
			`Connected to ${network.endpoint}\n` +
			`Started subscription...\n` +
			`[First event received] - Block #${19043122 + Math.floor(Math.random() * 100)}\n` +
			`[Second event received] - Block #${19043122 + Math.floor(Math.random() * 100) + 1}\n` +
			`\nSubscription would continue in a real environment until unsubscribed.\n`
		);
	}

	// Generic fallback
	return (
		`Simulated output for "${example.name}" on ${network.name}.\n\n` +
		`This is a placeholder result. In a real environment, you would see actual data from the ${network.name} network.\n` +
		`Try running this code with a real connection to ${network.endpoint}.\n`
	);
}
