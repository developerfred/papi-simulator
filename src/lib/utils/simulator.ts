import { Network } from '../types/network';
import { Example } from '../types/example';
import { ConsoleOutput } from '../types/example';

/**
 * Simulated output content for each example
 */
const SIMULATED_OUTPUTS: Record<string, (network: Network) => string> = {
    'simple-transfer': (network) => `Encoded transaction: 0x0400ff8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48e5c0fd77568d694a67dbf7711ef56ae5a9f95cd47c4ed95369791ba28f48c10f6fba3cb5211000004000000

To execute this transfer on ${network.name}:
1. Get testnet tokens from ${network.faucet}
2. Use a wallet like Polkadot.js extension to sign and submit
3. View results in the explorer: ${network.explorer}`,

    'query-balance': (network) => `Account Info: {
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

    'watch-blocks': (network) => `Starting to watch finalized blocks on ${network.name}...
Will unsubscribe after 30 seconds (in a real app, manage subscription lifecycle)
Finalized Block: {
  number: 19043122,
  hash: "0x3d544c6f372bdc37fab8a27f92a7c9322cf8f3b4267d96e8318dbc3c69ccf812",
  parentHash: "0x899a5b75567aad7d46627c82cc195ac9a5a553fb49b9d686b0198c1df9c84223",
  timestamp: "2025-04-07T18:24:32.531Z"
}
Block explorer link: ${network.explorer}/block/19043122
Finalized Block: {
  number: 19043123,
  hash: "0x62cad9f84b0ef0e370f3b297c7d5a254470f0bbe3d72c3d57943b70ad87bc52a",
  parentHash: "0x3d544c6f372bdc37fab8a27f92a7c9322cf8f3b4267d96e8318dbc3c69ccf812",
  timestamp: "2025-04-07T18:24:36.721Z"
}
Block explorer link: ${network.explorer}/block/19043123`,

    // Add other examples' outputs here
};

/**
 * Runs a simulated code execution and returns the output
 * 
 * @param example The example to simulate
 * @param network The selected network
 * @returns Array of console outputs
 */
export async function simulateCodeExecution(
    example: Example,
    network: Network
): Promise<ConsoleOutput[]> {
    return new Promise((resolve) => {
        // Create initial "running" output
        const outputs: ConsoleOutput[] = [
            {
                type: 'log',
                content: `Running code on ${network.name}...`,
                timestamp: Date.now(),
            }
        ];

        // Simulate execution delay
        setTimeout(() => {
            // Get the simulated output for this example, or use a default message
            const outputContent = SIMULATED_OUTPUTS[example.id]?.(network) ||
                `No simulated output available for this example on ${network.name}.`;

            // Add the simulated output
            outputs.push({
                type: 'log',
                content: outputContent,
                timestamp: Date.now(),
            });

            resolve(outputs);
        }, 1500);
    });
}

/**
 * Creates a random delay to simulate real network latency
 * @returns Promise that resolves after a random delay
 */
{/*
function randomDelay(min = 500, max = 2000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
} 
*/}