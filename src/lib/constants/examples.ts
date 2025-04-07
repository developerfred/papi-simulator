import { Example } from '../types/example';
import { Network } from '../types/network';
import { TEST_ACCOUNTS } from './accounts';

/**
 * Collection of code examples for the playground
 */
export const EXAMPLES: Example[] = [
    {
        id: 'simple-transfer',
        name: "Simple Transfer on Testnet",
        description: "Create a basic balance transfer on a test network",
        level: 'beginner',
        categories: ['transactions', 'balances'],
        getCode: (network: Network) => `// Simple transfer example on ${network.name} testnet
import { createClient } from "polkadot-api";
import { MultiAddress, ${network.descriptorKey} } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

// Connect to ${network.name} testnet using WebSocket
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("${network.endpoint}")
  )
);

// Get the typed API using the descriptors
const typedApi = client.getTypedApi(${network.descriptorKey});

// Create a balance transfer transaction
const transfer = async () => {
  // We'll use the Bob test address 
  const BOB = "${TEST_ACCOUNTS.bob}";
  
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
transfer().catch(console.error);`
    },

    {
        id: 'query-balance',
        name: "Query Account Balance",
        description: "Check an account's balance on testnet",
        level: 'beginner',
        categories: ['queries', 'balances'],
        getCode: (network: Network) => `// Query account balance example on ${network.name}
import { createClient } from "polkadot-api";
import { ${network.descriptorKey} } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

// Connect to ${network.name} testnet
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("${network.endpoint}")
  )
);

// Get the typed API
const typedApi = client.getTypedApi(${network.descriptorKey});

// Query an account's balance
const checkBalance = async () => {
  // Alice's address (for demonstration)
  const ALICE = "${TEST_ACCOUNTS.alice}";
  
  // Get account information
  const accountInfo = await typedApi.query.System.Account.getValue(ALICE);
  
  console.log("Account Info:", accountInfo);
  console.log("Free Balance:", accountInfo.data.free.toString());
  console.log("Reserved Balance:", accountInfo.data.reserved.toString());
  console.log("Total Balance:", 
    (accountInfo.data.free + accountInfo.data.reserved).toString()
  );
  
  // Format the balance in a human-readable way
  const divisor = 10n ** ${BigInt(network.tokenDecimals)}n;
  const formattedBalance = Number(accountInfo.data.free) / Number(divisor);
  console.log("Human readable balance:", formattedBalance.toFixed(4), "${network.tokenSymbol}");
};

checkBalance().catch(console.error);`
    },

    {
        id: 'watch-blocks',
        name: "Watch Finalized Blocks",
        description: "Subscribe to finalized blocks on testnet",
        level: 'beginner',
        categories: ['subscriptions', 'blocks'],
        getCode: (network: Network) => `// Watch finalized blocks on ${network.name} testnet
import { createClient } from "polkadot-api";
import { ${network.descriptorKey} } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

// Connect to ${network.name} testnet
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("${network.endpoint}")
  )
);

// Get the typed API
const typedApi = client.getTypedApi(${network.descriptorKey});

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

watchFinalizedBlocks();`
    },

    // Additional examples would continue here...
];

/**
 * Find an example by its ID
 */
export function findExampleById(id: string): Example | undefined {
    return EXAMPLES.find(example => example.id === id);
}

/**
 * Filter examples by category
 */
export function getExamplesByCategory(category: string): Example[] {
    return EXAMPLES.filter(example => example.categories.includes(category));
}

/**
 * Filter examples by difficulty level
 */
export function getExamplesByLevel(level: Example['level']): Example[] {
    return EXAMPLES.filter(example => example.level === level);
}

/**
 * Default example to show when the playground loads
 */
export const DEFAULT_EXAMPLE = EXAMPLES[0];