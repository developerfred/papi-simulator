import type { Example } from "../types/example";
import type { ConsoleOutput } from "../types/example";
import type { Network } from "../types/network";
import { SIMULATION_OUTPUTS } from "./simulationMapping";

function generateFallbackOutput(example: Example, network: Network): string {
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

	return (
		`Simulated output for "${example.name}" on ${network.name}.\n\n` +
		`This is a placeholder result. In a real environment, you would see actual data from the ${network.name} network.\n` +
		`Try running this code with a real connection to ${network.endpoint}.\n`
	);
}

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
 * Simulates running a code example with realistic outputs
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

		setTimeout(
			() => {
				const outputContent =
					SIMULATION_OUTPUTS[example.id]?.(network) ||
					generateFallbackOutput(example, network);

				outputs.push({
					type: "log",
					content: outputContent,
					timestamp: Date.now(),
				});

				resolve(outputs);
			},
			Math.floor(Math.random() * 1000) + 500,
		);
	});
}
