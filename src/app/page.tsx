'use client'

import React, { useState } from 'react';
import {  ChevronDown, ChevronRight, Play,  Copy, CheckCircle2, Info } from 'lucide-react';

const EXAMPLES = [
  {
    name: "Simple Transfer",
    description: "Create a basic balance transfer transaction",
    code: `// Simple transfer example
import { createClient } from "polkadot-api";
import { MultiAddress, dot } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

// Connect to Polkadot using WebSocket
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("wss://rpc.polkadot.io")
  )
);

// Get the typed API using the dot descriptors
const typedApi = client.getTypedApi(dot);

// Create a balance transfer transaction
const transfer = async () => {
  const tx = typedApi.tx.Balances.transfer_keep_alive({
    dest: MultiAddress.Id("14Gjs1TD93gnwEBfDMHoCgsuf1s2TVKUP6Z1qKmAZnZ8cW7mr"),
    value: 1_000_000_000n // 0.1 DOT (10^10 Planck)
  });
  
  // For this playground, we're just printing the encoded call data
  // In a real application, you would sign and submit the transaction
  const callData = await tx.getEncodedData();
  console.log("Encoded transaction:", callData.asHex());
};

// Execute the transfer
transfer().catch(console.error);`
  },
  {
    name: "Query Account Balance",
    description: "Check an account's balance",
    code: `// Query account balance example
import { createClient } from "polkadot-api";
import { dot } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

// Connect to Polkadot
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("wss://rpc.polkadot.io")
  )
);

// Get the typed API
const typedApi = client.getTypedApi(dot);

// Query an account's balance
const checkBalance = async () => {
  // Alice's address (for demonstration)
  const ALICE = "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5";
  
  // Get account information
  const accountInfo = await typedApi.query.System.Account.getValue(ALICE);
  
  console.log("Account Info:", accountInfo);
  console.log("Free Balance:", accountInfo.data.free.toString());
  console.log("Reserved Balance:", accountInfo.data.reserved.toString());
  console.log("Total Balance:", 
    (accountInfo.data.free + accountInfo.data.reserved).toString()
  );
};

checkBalance().catch(console.error);`
  },
  {
    name: "Watch Finalized Blocks",
    description: "Subscribe to finalized blocks",
    code: `// Watch finalized blocks example
import { createClient } from "polkadot-api";
import { dot } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

// Connect to Polkadot
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("wss://rpc.polkadot.io")
  )
);

// Get the typed API
const typedApi = client.getTypedApi(dot);

// Watch finalized blocks
const watchFinalizedBlocks = () => {
  console.log("Starting to watch finalized blocks...");
  
  // Subscribe to finalized blocks
  const subscription = client.finalizedBlock$.subscribe({
    next: (block) => {
      console.log("Finalized Block:", {
        number: block.number,
        hash: block.hash,
        parentHash: block.parent,
        timestamp: new Date().toISOString()
      });
    },
    error: (err) => {
      console.error("Error watching blocks:", err);
    }
  });
  
  // In a real app, you'd need to unsubscribe when done
  // For this playground example, we'll unsubscribe after 5 blocks
  setTimeout(() => {
    console.log("Unsubscribing from finalized blocks");
    subscription.unsubscribe();
  }, 60000);
};

watchFinalizedBlocks();`
  },
  {
    name: "Query Storage Entries",
    description: "Get multiple storage entries at once",
    code: `// Query multiple storage entries example
import { createClient } from "polkadot-api";
import { dot } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

// Connect to Polkadot
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("wss://rpc.polkadot.io")
  )
);

// Get the typed API
const typedApi = client.getTypedApi(dot);

// Query validator list and their preferences
const queryValidators = async () => {
  // Get the active validator set
  const validators = await typedApi.query.Session.Validators.getValue();
  console.log("Active validators:", validators.length);
  
  // Get only the first 5 validators for this example
  const selectedValidators = validators.slice(0, 5);
  
  // Get validator preferences for these validators
  const validatorPreferences = await typedApi.query.Staking.Validators.getValues(
    selectedValidators.map(validator => [validator])
  );
  
  // Display validator data
  selectedValidators.forEach((validator, index) => {
    const prefs = validatorPreferences[index];
    console.log('Validator ' + (index + 1) + ': ' + validator);
    console.log('Commission: ' + (prefs.commission / 10_000_000n) + '%');
    console.log('Blocked: ' + prefs.blocked);
  });
};

queryValidators().catch(console.error);`
  },
{
  name: "Light Client Connection",
    description: "Connect using Smoldot light client",
      code: `// Light client connection example
import { createClient } from "polkadot-api";
import { dot } from "@polkadot-api/descriptors";
import { chainSpec } from "polkadot-api/chains/polkadot";
import { getSmProvider } from "polkadot-api/sm-provider";
import { start } from "polkadot-api/smoldot";

const connectWithLightClient = async () => {
  console.log("Starting Smoldot light client...");
  
  // Start Smoldot
  const smoldot = start();
  
  // Add the Polkadot chain
  const chain = await smoldot.addChain({ chainSpec });
  console.log("Chain added successfully");
  
  // Create client using Smoldot provider
  const client = createClient(getSmProvider(chain));
  console.log("Client created successfully");
  
  // Get the typed API
  const typedApi = client.getTypedApi(dot);
  
  // Get the latest block number
  const blockNumber = await typedApi.query.System.Number.getValue();
  console.log("Current block number:", blockNumber);
  
  // Get chain name
  const chainName = await typedApi.constants.System.Version();
  console.log("Chain name:", chainName.specName);
  
  // Cleanup when done
  console.log("Terminating light client connection");
  client.destroy();
  smoldot.terminate();
};

connectWithLightClient().catch(console.error);`
}
];

const PapiPlayground = () => {
  const [code, setCode] = useState(EXAMPLES[0].code);
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'docs'
  const [expandedSections, setExpandedSections] = useState({
    basics: true,
    transactions: false,
    storage: false,
    events: false,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedExample, setSelectedExample] = useState(0);

  const toggleSection = (section: 'basics' | 'transactions' | 'storage' | 'events') => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput('Running code...\n');

    // Simulate code execution with delayed responses
    setTimeout(() => {
      let simulatedOutput = '';

      // Add different simulated outputs based on selected example
      if (selectedExample === 0) {
        simulatedOutput = 'Encoded transaction: 0x0400ff8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48e5c0fd77568d694a67dbf7711ef56ae5a9f95cd47c4ed95369791ba28f48c10f6fba3cb5211000004000000';
      } else if (selectedExample === 1) {
        simulatedOutput = 'Account Info: {\n  providers: 1n,\n  sufficients: 0n,\n  consumers: 0n,\n  data: {\n    free: 122352326965n,\n    reserved: 0n,\n    frozen: 0n\n  }\n}\nFree Balance: 122352326965\nReserved Balance: 0\nTotal Balance: 122352326965';
      } else if (selectedExample === 2) {
        simulatedOutput = 'Starting to watch finalized blocks...\nFinalized Block: {\n  number: 19043122,\n  hash: "0x3d544c6f372bdc37fab8a27f92a7c9322cf8f3b4267d96e8318dbc3c69ccf812",\n  parentHash: "0x899a5b75567aad7d46627c82cc195ac9a5a553fb49b9d686b0198c1df9c84223",\n  timestamp: "2025-04-07T18:24:32.531Z"\n}\nFinalized Block: {\n  number: 19043123,\n  hash: "0x62cad9f84b0ef0e370f3b297c7d5a254470f0bbe3d72c3d57943b70ad87bc52a",\n  parentHash: "0x3d544c6f372bdc37fab8a27f92a7c9322cf8f3b4267d96e8318dbc3c69ccf812",\n  timestamp: "2025-04-07T18:24:36.721Z"\n}';
      } else if (selectedExample === 3) {
        simulatedOutput = 'Active validators: 297\nValidator 1: 15HUzeugzSA9GC1TMTtxEWi2k7Z4ERMpoRssUHcAdD4UJzGx\n  Commission: 3%\n  Blocked: false\nValidator 2: 1hYiMW8KSKcBPLaAP3FYxM2FPnGHkXQF3NcU23YHJmgRq8\n  Commission: 5%\n  Blocked: false\nValidator 3: 12NkysJLMQJzJLUYwXvYMt7uFEwxvUoFoCNGVpvvxZXYjZxj\n  Commission: 2.5%\n  Blocked: false\nValidator 4: 12HgAHPxdv3rZJGPcqYxYuEozJbLRhijt68Jrp5yjvFJFkdH\n  Commission: 3.5%\n  Blocked: false\nValidator 5: 14GQkK7JG8JLXwTCUZKPkBLm5h8U6pYhFYnT4AefWhx3Ahp5\n  Commission: 1%\n  Blocked: false';
      } else if (selectedExample === 4) {
        simulatedOutput = 'Starting Smoldot light client...\nChain added successfully\nClient created successfully\nCurrent block number: 19043125\nChain name: polkadot\nTerminating light client connection';
      }

      setOutput(simulatedOutput);
      setIsRunning(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const selectExample = (index: number) => {
    setSelectedExample(index);
    setCode(EXAMPLES[index].code);
    setOutput('');
  };

  return (
    <div className="flex flex-col h-screen text-gray-800 bg-gray-50">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-blue-700">Polkadot API Playground</h1>
          <div className="text-sm text-gray-500">Learn by doing - Build with PAPI</div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className={`px-3 py-1 rounded text-sm font-medium ${activeTab === 'editor' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('editor')}
          >
            Editor
          </button>
          <button
            className={`px-3 py-1 rounded text-sm font-medium ${activeTab === 'docs' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('docs')}
          >
            Documentation
          </button>
        </div>
      </header>

      {activeTab === 'editor' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Examples */}
          <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto p-4">
            <h2 className="text-lg font-semibold mb-4">Examples</h2>
            <div className="space-y-1">
              {EXAMPLES.map((example, index) => (
                <div
                  key={index}
                  className={`p-2 rounded cursor-pointer ${selectedExample === index ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                  onClick={() => selectExample(index)}
                >
                  <div className="font-medium">{example.name}</div>
                  <div className="text-xs text-gray-500">{example.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Code editor */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
                <div className="text-sm font-medium">TypeScript Editor</div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700"
                    onClick={copyToClipboard}
                    title="Copy code"
                  >
                    {copySuccess ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                  <button
                    className={`flex items-center space-x-1 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 ${isRunning ? 'opacity-75 cursor-not-allowed' : ''}`}
                    onClick={runCode}
                    disabled={isRunning}
                  >
                    <Play size={14} />
                    <span className="text-sm">Run</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-white">
                <textarea
                  className="w-full h-full resize-none outline-none"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Output console */}
            <div className="h-1/3 border-t border-gray-200">
              <div className="bg-gray-50 border-b border-gray-200 p-2 text-sm font-medium">
                Console Output
              </div>
              <div className="h-full overflow-auto p-4 font-mono text-sm bg-gray-900 text-green-400">
                <pre>{output || 'Run code to see output...'}</pre>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Documentation tab */
        <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Polkadot API Documentation</h2>

          <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded flex items-start">
            <Info size={20} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm">
                Polkadot API (PAPI) is a TypeScript library designed to interact with Polkadot and Substrate-based chains.
                It provides type-safe interfaces generated from on-chain metadata, making it easy to perform storage queries,
                create transactions, subscribe to events, and more.
              </p>
            </div>
          </div>

          {/* Basic Concepts */}
          <div className="mb-6 border border-gray-200 rounded overflow-hidden">
            <div
              className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
              onClick={() => toggleSection('basics')}
            >
              <h3 className="font-semibold">Basic Concepts</h3>
              {expandedSections.basics ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>

            {expandedSections.basics && (
              <div className="p-4">
                <h4 className="font-medium mb-2">Create a Client</h4>
                <pre className="bg-gray-100 p-3 rounded mb-4 text-sm overflow-auto">
                  {`import { createClient } from "polkadot-api";
import { dot } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";

// Connect to a node via WebSocket
const client = createClient(getWsProvider("wss://rpc.polkadot.io"));

// Get the typed API
const typedApi = client.getTypedApi(dot);`}
                </pre>

                <h4 className="font-medium mb-2">Providers</h4>
                <ul className="list-disc ml-6 mb-4 space-y-1 text-sm">
                  <li><strong>WebSocket Provider</strong>: Connect to a remote node</li>
                  <li><strong>Smoldot Provider</strong>: Use the built-in light client</li>
                </ul>

                <h4 className="font-medium mb-2">Descriptors</h4>
                <p className="text-sm mb-4">
                  Descriptors are generated from chain metadata using the PAPI CLI tool, providing
                  type definitions for all chain interactions.
                </p>

                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {`# Generate descriptors for Polkadot
npx papi add dot -n polkadot
npx papi generate`}
                </pre>
              </div>
            )}
          </div>

          {/* Transactions */}
          <div className="mb-6 border border-gray-200 rounded overflow-hidden">
            <div
              className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
              onClick={() => toggleSection('transactions')}
            >
              <h3 className="font-semibold">Transactions</h3>
              {expandedSections.transactions ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>

            {expandedSections.transactions && (
              <div className="p-4">
                <h4 className="font-medium mb-2">Create a Transaction</h4>
                <pre className="bg-gray-100 p-3 rounded mb-4 text-sm overflow-auto">
                  {`import { MultiAddress } from "@polkadot-api/descriptors";

// Create a balance transfer transaction
const tx = typedApi.tx.Balances.transfer_keep_alive({
  dest: MultiAddress.Id("14Gjs...W7mr"), // Address
  value: 1_000_000_000n // 0.1 DOT
});`}
                </pre>

                <h4 className="font-medium mb-2">Sign and Submit</h4>
                <pre className="bg-gray-100 p-3 rounded mb-4 text-sm overflow-auto">
                  {`// Using Promise-based API
const result = await tx.signAndSubmit(signer);
console.log("Transaction hash:", result.txHash);
console.log("Success:", result.ok);

// Using Observable-based API
tx.signSubmitAndWatch(signer).subscribe({
  next: (event) => {
    if (event.type === "finalized") {
      console.log("Transaction finalized!");
    }
  },
  error: console.error,
  complete: () => console.log("Subscription completed")
});`}
                </pre>

                <h4 className="font-medium mb-2">Transaction Options</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {`// Add transaction options
tx.signAndSubmit(signer, {
  tip: 10_000_000n, // Tip amount
  mortality: { mortal: true, period: 100 }, // Transaction mortality
  nonce: 5 // Custom nonce
});`}
                </pre>
              </div>
            )}
          </div>

          {/* Storage Queries */}
          <div className="mb-6 border border-gray-200 rounded overflow-hidden">
            <div
              className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
              onClick={() => toggleSection('storage')}
            >
              <h3 className="font-semibold">Storage Queries</h3>
              {expandedSections.storage ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>

            {expandedSections.storage && (
              <div className="p-4">
                <h4 className="font-medium mb-2">Query Single Value</h4>
                <pre className="bg-gray-100 p-3 rounded mb-4 text-sm overflow-auto">
                  {`// Get current block number
const blockNumber = await typedApi.query.System.Number.getValue();

// Query account information
const account = await typedApi.query.System.Account.getValue("5GrwvaEF...");`}
                </pre>

                <h4 className="font-medium mb-2">Query Multiple Values</h4>
                <pre className="bg-gray-100 p-3 rounded mb-4 text-sm overflow-auto">
                  {`// Get multiple accounts at once
const addresses = ["5GrwvaEF...", "5FHneW46..."];
const accounts = await typedApi.query.System.Account.getValues(
  addresses.map(addr => [addr])
);`}
                </pre>

                <h4 className="font-medium mb-2">Query Storage Entries</h4>
                <pre className="bg-gray-100 p-3 rounded mb-4 text-sm overflow-auto">
                  {`// Get all validators
const validators = await typedApi.query.Session.Validators.getEntries();

// For each validator
validators.forEach(({ args, value }) => {
  console.log("Validator:", args);
});`}
                </pre>

                <h4 className="font-medium mb-2">Watch Value Changes</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {`// Subscribe to block number changes
typedApi.query.System.Number.watchValue().subscribe(blockNumber => {
  console.log("New block:", blockNumber);
});`}
                </pre>
              </div>
            )}
          </div>

          {/* Events */}
          <div className="mb-6 border border-gray-200 rounded overflow-hidden">
            <div
              className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
              onClick={() => toggleSection('events')}
            >
              <h3 className="font-semibold">Events</h3>
              {expandedSections.events ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>

            {expandedSections.events && (
              <div className="p-4">
                <h4 className="font-medium mb-2">Watch Chain Events</h4>
                <pre className="bg-gray-100 p-3 rounded mb-4 text-sm overflow-auto">
                  {`// Subscribe to Balance.Transfer events
typedApi.event.Balances.Transfer.watch().subscribe(event => {
  console.log("Transfer from:", event.payload.from);
  console.log("Transfer to:", event.payload.to);
  console.log("Amount:", event.payload.amount);
});`}
                </pre>

                <h4 className="font-medium mb-2">Filter Events</h4>
                <pre className="bg-gray-100 p-3 rounded mb-4 text-sm overflow-auto">
                  {`// Filter for large transfers
typedApi.event.Balances.Transfer.watch(
  payload => payload.amount > 1_000_000_000_000n
).subscribe(event => {
  console.log("Large transfer detected!");
});`}
                </pre>

                <h4 className="font-medium mb-2">Extract Events from Transaction</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {`// Get the transaction result
const result = await tx.signAndSubmit(signer);

// Filter specific events
const transfers = typedApi.event.Balances.Transfer.filter(result.events);`}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PapiPlayground;