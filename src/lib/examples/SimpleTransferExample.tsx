import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class SimpleTransferExample extends ExampleFactory {
    constructor() {
        super({
            id: "simple-transfer",
            name: "Simple Transfer on Testnet",
            description: "Create a basic balance transfer on a test network",
            level: "beginner",
            categories: ["transactions", "balances", "components", "react"],
        });
    }

    generateCode(network: Network): string {
        // This version safely handles the component rendering without needing direct API access
        return `// Simple transfer example on ${network.name} testnet with React Component
import React, { useState, useEffect } from 'react';

// Define component for transfer UI
export default function TransferComponent() {
  // Bob's test address
  const BOB = "${this.getTestAccount("bob")}";
  
  // State variables for the form
  const [recipient, setRecipient] = useState(BOB);
  const [amount, setAmount] = useState('0.1');
  const [encodedTx, setEncodedTx] = useState('');
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  
  // Access network information - this will be provided by the LivePreview environment
  const networkInfo = window.networkData || {
    id: "${network.id}",
    name: "${network.name}",
    tokenSymbol: "${network.tokenSymbol}",
    tokenDecimals: ${network.tokenDecimals},
    isTest: ${network.isTest},
    endpoint: "${network.endpoint}",
    explorer: "${network.explorer}",
    faucet: "${network.faucet}"
  };
  
  // Mock function to simulate creating a transfer transaction
  const createTransfer = async (recipient, amount) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Convert amount to smallest units
      const decimalAmount = parseFloat(amount);
      const tokenDecimals = networkInfo.tokenDecimals;
      const rawAmount = Math.floor(decimalAmount * Math.pow(10, tokenDecimals));
      
      // Return a mock encoded transaction
      return "0x" + 
        networkInfo.id.padEnd(10, '0').substring(0, 10) + 
        rawAmount.toString(16).padStart(16, '0') + 
        recipient.replace('0x', '').substring(0, 40).padEnd(40, '0');
    } catch (error) {
      console.error("Error creating transfer:", error);
      throw new Error("Failed to create transaction: " + error.message);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setStatus('Creating transaction...');
    
    try {
      // Validate inputs
      if (!recipient || !amount) {
        throw new Error('Recipient and amount are required');
      }
      
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Amount must be a positive number');
      }
      
      // Create the transfer
      const callData = await createTransfer(recipient, parsedAmount);
      setEncodedTx(callData);
      setStatus('Transaction created successfully!');
    } catch (error) {
      setStatus(\`Error: \${error.message}\`);
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };
  
  // Determine network color for styling
  const getNetworkColor = () => {
    switch (networkInfo.id) {
      case 'polkadot': return '#E6007A';
      case 'westend': return '#46DDD2';
      case 'paseo': return '#FF7B00';
      case 'rococo': return '#7D42BC';
      default: return '#8E2FD0';
    }
  };
  
  // Style definitions
  const containerStyle = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  };
  
  const headerStyle = {
    backgroundColor: getNetworkColor(),
    color: 'white',
    padding: '16px 20px',
  };
  
  const formStyle = {
    padding: '20px',
  };
  
  const inputGroupStyle = {
    marginBottom: '15px',
  };
  
  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#333',
  };
  
  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    color: '#000',
  };
  
  const buttonStyle = {
    backgroundColor: getNetworkColor(),
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '4px',
    cursor: isBusy ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    width: '100%',
    opacity: isBusy ? '0.7' : '1',
  };
  
  const resultCardStyle = {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: 'rgb(243, 231, 231)',
    borderRadius: '4px',
    display: encodedTx ? 'block' : 'none',
  };
  
  const codeBlockStyle = {
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '13px',
    overflowX: 'auto',
    marginTop: '10px',
    color: '#333',
    wordBreak: 'break-all',
  };
  
  const statusStyle = {
    padding: '10px',
    marginTop: '15px',
    backgroundColor: status.includes('Error') 
      ? '#ffebee' 
      : status.includes('successfully') 
        ? '#e8f5e9' 
        : '#f5f5f5',
    color: status.includes('Error') 
      ? '#c62828' 
      : status.includes('successfully') 
        ? '#2e7d32' 
        : '#333',
    borderRadius: '4px',
    fontSize: '14px',
    display: status ? 'block' : 'none',
  };
  
  const infoBoxStyle = {
    backgroundColor: '#f0f7ff',
    padding: '15px',
    borderRadius: '4px',
    marginTop: '20px',
    fontSize: '14px',
    color: '#333',
    borderLeft: '4px solid #2196f3',
  };
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>
          {networkInfo.name} Transfer Tool
        </h2>
        <div style={{ opacity: 0.8, fontSize: '14px', marginTop: '4px' }}>
          Create a balance transfer transaction on testnet
        </div>
      </div>
      
      <div style={formStyle}>
        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Recipient Address:</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={inputStyle}
              placeholder="Enter recipient's address"
              disabled={isBusy}
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              Amount ({networkInfo.tokenSymbol}):
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
              placeholder="Enter amount to transfer"
              disabled={isBusy}
            />
          </div>
          
          <button 
            type="submit" 
            style={buttonStyle}
            disabled={isBusy}
          >
            {isBusy ? 'Creating Transaction...' : 'Create Transfer Transaction'}
          </button>
        </form>
        
        <div style={statusStyle}>
          {status}
        </div>
        
        <div style={resultCardStyle}>
          <h3 style={{ margin: '0 0 10px', color: '#333' }}>Encoded Transaction</h3>
          <div style={codeBlockStyle}>
            {encodedTx}
          </div>
        </div>
        
        <div style={infoBoxStyle}>
          <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#1976d2' }}>
            How to use this transaction
          </h3>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              Get testnet tokens from <a 
                href={networkInfo.faucet} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#1976d2' }}
              >
                {networkInfo.faucet.replace(/^https?:\\/\\//, '')}
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              Copy the encoded transaction and use it with a wallet like Polkadot.js extension
            </li>
            <li>
              View results in the explorer: <a 
                href={networkInfo.explorer} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#1976d2' }}
              >
                {networkInfo.explorer.replace(/^https?:\\/\\//, '')}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// For standalone usage outside of the component
const executeTransferExample = async () => {
  // In the non-component version, we would import the actual API
  console.log("Simple transfer example - standalone mode");
  console.log(\`Network: ${network.name} (${network.id})\`);
  console.log(\`Endpoint: ${network.endpoint}\`);
  console.log(\`Token: ${network.tokenSymbol} (${network.tokenDecimals} decimals)\`);
  console.log("To execute this transfer:");
  console.log("1. Get testnet tokens from ${network.faucet}");
  console.log("2. Use a wallet like Polkadot.js extension to sign and submit");
  console.log("3. View results in the explorer: ${network.explorer}");
};

// Only run standalone version if not in component environment
if (typeof window === 'undefined' || !window.React) {
  executeTransferExample().catch(console.error);
}`;
    }

    
    getImports(network: Network, useComponents: boolean = false): string {
        let imports = '';

        if (useComponents) {
            imports += `import React from 'react';\n`;
        }

        
        imports += `import { MultiAddress } from "@polkadot-api/descriptors";\n`;

        
        if (network.id === 'westend') {
            imports += `import { wnd } from "@polkadot-api/descriptors";\n`;
        } else if (network.id === 'rococo') {
            imports += `import { roc } from "@polkadot-api/descriptors";\n`;
        } else if (network.id === 'paseo') {
            imports += `import { paseo } from "@polkadot-api/descriptors";\n`;
        }

        
        imports += `import { getWsProvider } from "polkadot-api/ws-provider/web";\n`;
        imports += `import { createClient } from "polkadot-api";\n`;
        imports += `import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";\n`;

        return imports;
    }

    
    getClientSetup(network: Network): string {
        let networkDescriptor = '';
        if (network.id === 'westend') {
            networkDescriptor = 'wnd';
        } else if (network.id === 'rococo') {
            networkDescriptor = 'roc';
        } else if (network.id === 'paseo') {
            networkDescriptor = 'paseo';
        } else {
            return `// No predefined descriptor for ${network.id}, using custom endpoint\nconst provider = getWsProvider("${network.endpoint}");\nconst client = createClient(provider);\nconst { typedApi } = withPolkadotSdkCompat(client);\n`;
        }

        return `// Set up client for ${network.name}\nconst provider = getWsProvider("${network.endpoint}");\nconst client = createClient(provider, ${networkDescriptor});\nconst { typedApi } = withPolkadotSdkCompat(client);\n`;
    }

    
    getTestAccount(name: string): string {    
        const accounts: Record<string, string> = {
            alice: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            bob: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
            charlie: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
            dave: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
            eve: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
        };
        
        const lowercaseName = name.toLowerCase();
        return (lowercaseName in accounts) ? accounts[lowercaseName] : accounts.bob;
    }
}