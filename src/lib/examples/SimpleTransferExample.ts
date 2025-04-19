import type { Network } from "../types/network";
import { BaseExampleFactory } from "./baseExampleFactory";

export class SimpleTransferExample extends BaseExampleFactory {
	constructor() {
		super({
			id: "simple-transfer",
			name: "Simple Transfer on Testnet",
			description: "Create a basic balance transfer on a test network",
			level: "beginner",
			categories: ["transactions", "balances"],
		});
	}

	generateCode(network: Network): string {
		return `// Simple transfer example on ${network.name} testnet
${this.generateImports(network)}
import { MultiAddress } from "@polkadot-api/descriptors";

${this.generateClientSetup(network)}

// Create a balance transfer transaction
const transfer = async () => {
  // We'll use the Bob test address 
  const BOB = "${this.getTestAccount("bob")}";
  
  const tx = typedApi.tx.Balances.transfer_keep_alive({
    dest: MultiAddress.Id(BOB),
    value: 1_000_000_000n // 0.1 ${network.tokenSymbol} (10^${network.tokenDecimals} smallest units)
  });
  
  // For this playground, we're just printing the encoded call data
  // In a real application, you would need a signer to submit this transaction
  const callData = await tx.getEncodedData();
  console.log("Encoded transaction:", callData.asHex());
  console.log("");
  console.log("To execute this transfer on ${network.name}:");
  console.log("1. Get testnet tokens from ${network.faucet}");
  console.log("2. Use a wallet like Polkadot.js extension to sign and submit");
  console.log("3. View results in the explorer: ${network.explorer}");
};

// Execute the transfer
transfer().catch(console.error);`;
	}
}
