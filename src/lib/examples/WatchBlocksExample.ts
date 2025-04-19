import type { Network } from "../types/network";
import { BaseExampleFactory } from "./baseExampleFactory";

export class WatchBlocksExample extends BaseExampleFactory {
	constructor() {
		super({
			id: "watch-blocks",
			name: "Watch Finalized Blocks",
			description: "Subscribe to finalized blocks on testnet",
			level: "beginner",
			categories: ["subscriptions", "blocks"],
		});
	}

	generateCode(network: Network): string {
		return `// Watch finalized blocks on ${network.name} testnet
${this.generateImports(network)}

${this.generateClientSetup(network)}

// Watch finalized blocks
const watchFinalizedBlocks = () => {
  console.log("Starting to watch finalized blocks on ${network.name}...");
  
  // Subscribe to finalized blocks
  const subscription = client.finalizedBlock$.subscribe({
    next: (block) => {
      console.log("Finalized Block:", {
        number: block.number,
        hash: block.hash,
        parentHash: block.parent,
        timestamp: new Date().toISOString()
      });
      console.log("Block explorer link: ${network.explorer}/block/" + block.number);
    },
    error: (err) => {
      console.error("Error watching blocks:", err);
    }
  });
  
  // In a real app, you'd need to unsubscribe when done
  // For this playground example, we'll unsubscribe after 30 seconds
  console.log("Will unsubscribe after 30 seconds (in a real app, manage subscription lifecycle)");
  setTimeout(() => {
    console.log("Unsubscribing from finalized blocks");
    subscription.unsubscribe();
  }, 30000);
};

watchFinalizedBlocks();`;
	}
}
