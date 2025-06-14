import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { Network } from '@/lib/types/network';
import { Example } from '@/lib/types/example';
import { findExampleById } from '@/lib/constants/examples';
import { TEST_ACCOUNTS } from '@/lib/constants/accounts';

// Define all documentation sections

{/*
const SECTIONS = [
  'basics',
  'transactions',
  'storage',
  'events',
  'testnets',
];
*/}

interface DocumentationProps {
  selectedNetwork: Network;
  onSelectExample: (example: Example) => void;
}

/**
 * Documentation component with expandable sections
 */
const Documentation: React.FC<DocumentationProps> = ({ selectedNetwork, onSelectExample }) => {
  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basics: true,
    testnets: true,
  });

  // Toggle a section's expanded state
  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Run a specific example from the documentation
  const runExample = (exampleId: string) => {
    const example = findExampleById(exampleId);
    if (example) {
      onSelectExample(example);
    }
  };

  return (
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
      <DocumentSection
        title="Basic Concepts"
        section="basics"
        isExpanded={expandedSections.basics}
        onToggle={() => toggleSection('basics')}
      >
        <DocumentContent
          title="Create a Client"
          code={`import { createClient } from "polkadot-api";
import { ${selectedNetwork.descriptorKey} } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";

// Connect to a node via WebSocket
const client = createClient(getWsProvider("${selectedNetwork.endpoint}"));

// Get the typed API for ${selectedNetwork.name}
const typedApi = client.getTypedApi(${selectedNetwork.descriptorKey});`}
        />

        <DocumentList
          title="Providers"
          items={[
            "<strong>WebSocket Provider</strong>: Connect to a remote node - ideal for dApps",
            "<strong>Smoldot Provider</strong>: Use the built-in light client - runs directly in the browser",
            "<strong>WsProvider with compatibility</strong>: For older Polkadot SDK versions<br><code>withPolkadotSdkCompat(getWsProvider(\"wss://rpc.node.url\"))</code>"
          ]}
        />

        <DocumentContent
          title="Descriptors"
          text="Descriptors are generated from chain metadata using the PAPI CLI tool, providing type definitions for all chain interactions."
          code={`# Generate descriptors for ${selectedNetwork.name}
npx papi add ${selectedNetwork.descriptorKey} -n ${selectedNetwork.chainSpecPath}
npx papi generate`}
        />

        <div className="mt-4">
          <button
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded"
            onClick={() => runExample('simple-transfer')}
          >
            Try Basic Example
          </button>
        </div>
      </DocumentSection>

      {/* Transactions */}
      <DocumentSection
        title="Transactions"
        section="transactions"
        isExpanded={expandedSections.transactions}
        onToggle={() => toggleSection('transactions')}
      >
        <DocumentContent
          title="Create a Transaction"
          code={`import { MultiAddress } from "@polkadot-api/descriptors";

// Create a balance transfer transaction
const tx = typedApi.tx.Balances.transfer_keep_alive({
  dest: MultiAddress.Id("${TEST_ACCOUNTS.bob}"), // Bob
  value: 1_000_000_000n // 0.1 ${selectedNetwork.tokenSymbol} (10^${selectedNetwork.tokenDecimals} smallest units)
});`}
        />

        <DocumentContent
          title="Sign and Submit"
          code={`// Using Promise-based API
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
        />

        <DocumentContent
          title="Transaction Options"
          code={`// Add transaction options
tx.signAndSubmit(signer, {
  tip: 10_000_000n, // Tip amount
  mortality: { mortal: true, period: 100 }, // Transaction mortality (blocks)
  nonce: 5 // Custom nonce (usually handled automatically)
});`}
        />

        <div className="mt-4">
          <button
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded"
            onClick={() => runExample('simple-transfer')}
          >
            Try Transfer Example
          </button>
        </div>
      </DocumentSection>

      {/* Storage Queries */}
      <DocumentSection
        title="Storage Queries"
        section="storage"
        isExpanded={expandedSections.storage}
        onToggle={() => toggleSection('storage')}
      >
        <DocumentContent
          title="Query Single Value"
          code={`// Get current block number
const blockNumber = await typedApi.query.System.Number.getValue();

// Query account information
const account = await typedApi.query.System.Account.getValue("${TEST_ACCOUNTS.alice}");`}
        />

        <DocumentContent
          title="Query Multiple Values"
          code={`// Get multiple accounts at once
const addresses = ["${TEST_ACCOUNTS.alice}", "${TEST_ACCOUNTS.bob}"];
const accounts = await typedApi.query.System.Account.getValues(
  addresses.map(addr => [addr])
);`}
        />

        <DocumentContent
          title="Query Storage Entries"
          code={`// Get all validators
const validators = await typedApi.query.Session.Validators.getEntries();

// For each validator
validators.forEach(({ args, value }) => {
  console.log("Validator:", args);
});`}
        />

        <DocumentContent
          title="Watch Value Changes"
          code={`// Subscribe to block number changes
typedApi.query.System.Number.watchValue().subscribe(blockNumber => {
  console.log("New block:", blockNumber);
});`}
        />

        <div className="mt-4">
          <button
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded"
            onClick={() => runExample('query-balance')}
          >
            Try Query Example
          </button>
        </div>
      </DocumentSection>

      {/* Events */}
      <DocumentSection
        title="Events"
        section="events"
        isExpanded={expandedSections.events}
        onToggle={() => toggleSection('events')}
      >
        <DocumentContent
          title="Watch Chain Events"
          code={`// Subscribe to Balance.Transfer events
typedApi.event.Balances.Transfer.watch().subscribe(event => {
  console.log("Transfer from:", event.payload.from);
  console.log("Transfer to:", event.payload.to);
  console.log("Amount:", event.payload.amount);
});`}
        />

        <DocumentContent
          title="Filter Events"
          code={`// Filter for large transfers
typedApi.event.Balances.Transfer.watch(
  payload => payload.amount > 1_000_000_000_000n
).subscribe(event => {
  console.log("Large transfer detected!");
});`}
        />

        <DocumentContent
          title="Extract Events from Transaction"
          code={`// Get the transaction result
const result = await tx.signAndSubmit(signer);

// Filter specific events
const transfers = typedApi.event.Balances.Transfer.filter(result.events);`}
        />

        <div className="mt-4">
          <button
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded"
            onClick={() => runExample('watch-blocks')}
          >
            Try Events Example
          </button>
        </div>
      </DocumentSection>

      {/* Testnet Resources */}
      <DocumentSection
        title="Testnet Resources"
        section="testnets"
        isExpanded={expandedSections.testnets}
        onToggle={() => toggleSection('testnets')}
      >
        <DocumentList
          title="Getting Testnet Tokens"
          items={[
            `<strong>Westend</strong>: <a href="https://faucet.polkadot.io/?tab=westend" target="_blank" class="text-blue-600 hover:underline">https://faucet.polkadot.io/?tab=westend</a>`,
            `<strong>Paseo</strong>: <a href="https://faucet.polkadot.io/?tab=paseo" target="_blank" class="text-blue-600 hover:underline">https://faucet.polkadot.io/?tab=paseo</a>`,            
          ]}
        />

        <DocumentList
          title="Explorer Links"
          items={[
            `<strong>Westend</strong>: <a href="https://westend.subscan.io/" target="_blank" class="text-blue-600 hover:underline">https://westend.subscan.io/</a>`,
            `<strong>Paseo</strong>: <a href="https://paseo.subscan.io/" target="_blank" class="text-blue-600 hover:underline">https://paseo.subscan.io/</a>`,            
          ]}
        />

        <DocumentContent
          title="Test Addresses"
          text="These addresses have funds on testnets and can be imported using their well-known mnemonics:"
          code={`// Alice
${TEST_ACCOUNTS.alice}

// Bob
${TEST_ACCOUNTS.bob}

// Charlie
${TEST_ACCOUNTS.charlie}`}
        />
      </DocumentSection>
    </div>
  );
};

// Helper component for document sections
interface DocumentSectionProps {
  title: string;
  section: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div className="mb-6 border border-gray-200 rounded overflow-hidden">
      <div
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="font-semibold">{title}</h3>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </div>

      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  );
};

// Helper component for document content with code snippets
interface DocumentContentProps {
  title: string;
  text?: string;
  code: string;
}

const DocumentContent: React.FC<DocumentContentProps> = ({ title, text, code }) => {
  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">{title}</h4>
      {text && <p className="text-sm mb-2">{text}</p>}
      <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{code}</pre>
    </div>
  );
};

// Helper component for document lists
interface DocumentListProps {
  title: string;
  items: string[];
}

const DocumentList: React.FC<DocumentListProps> = ({ title, items }) => {
  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">{title}</h4>
      <ul className="list-disc ml-6 mb-4 space-y-1 text-sm">
        {items.map((item, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>
    </div>
  );
};

export default Documentation;