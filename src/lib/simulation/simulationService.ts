import type { Example } from "../types/example";
import type { ConsoleOutput } from "../types/example";
import type { Network } from "../types/network";
import { SIMULATION_OUTPUTS } from "./simulationMapping";


function generateRandomHash(length = 32): string {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function generateFallbackOutput(example: Example, network: Network): string {
	const categories = example.categories;

	if (categories.includes("transactions")) {
		return `Transaction simulation for "${example.name}" on ${network.name}:
- Created transaction with random nonce
- Gas estimation: ${Math.floor(Math.random() * 1000000) + 100000}
- Encoded call data: 0x${generateRandomHash(16)}

To run this transaction for real:
1. Get test tokens from ${network.faucet}
2. Connect a wallet like Polkadot.js extension
3. Execute the transaction`;
	}

	if (categories.includes("queries")) {
		return `Query simulation for "${example.name}" on ${network.name}:
Successfully connected to ${network.endpoint}
Retrieved data at block #${19043122 + Math.floor(Math.random() * 100)}
Result: { ... simulated data would appear here ... }`;
	}

	if (categories.includes("subscriptions")) {
		return `Subscription simulation for "${example.name}" on ${network.name}:
Connected to ${network.endpoint}
Started subscription...
[First event received] - Block #${19043122 + Math.floor(Math.random() * 100)}
[Second event received] - Block #${19043122 + Math.floor(Math.random() * 100) + 1}

Subscription would continue in a real environment until unsubscribed.`;
	}

	return `Simulated output for "${example.name}" on ${network.name}.

This is a placeholder result. In a real environment, you would see actual data from the ${network.name} network.
Try running this code with a real connection to ${network.endpoint}.`;
}

/**
 * Simulates running a code example with realistic outputs
 */
export async function simulateCodeExecution(
	example: Example,
	network: Network,
): Promise<ConsoleOutput[]> {
	return new Promise((resolve) => {
		
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