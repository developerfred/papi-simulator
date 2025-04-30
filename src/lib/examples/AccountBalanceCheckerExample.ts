import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class AccountBalanceCheckerExample extends ExampleFactory {
    constructor() {
        super({
            id: "account-balance",
            name: "Account Balance Checker",
            description: "Query and display an account's balance from a live Polkadot network",
            level: "beginner",
            categories: ["queries", "balances", "components", "react"],
        });
    }

    generateCode(network: Network): string {
        return `// Account Balance Checker on ${network.name}
import React, { useState, useEffect } from 'react';
${this.getImports(network)}

// Account Balance Checker Component
export default function AccountBalanceChecker() {
  // State variables
  const [address, setAddress] = useState("${this.getTestAccount("alice")}");
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [client, setClient] = useState(null);
  const [api, setApi] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Network information
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
  
  // Initialize connection to blockchain
  useEffect(() => {
    let mounted = true;
    
    const initConnection = async () => {
      try {
        // Initialize the provider based on the network endpoint
        const provider = getWsProvider(networkInfo.endpoint);
        
        // Create client with the Polkadot SDK compatibility wrapper
        const newClient = createClient(
          withPolkadotSdkCompat(provider)
        );
        
        // Get the API for the connection
        const unsafeApi = newClient.getUnsafeApi();
        
        if (mounted) {
          setClient(newClient);
          setApi(unsafeApi);
          setIsConnected(true);
        }
      } catch (err) {
        console.error("Failed to connect:", err);
        if (mounted) {
          setError(\`Connection failed: \${err.message}\`);
          setIsConnected(false);
        }
      }
    };
    
    initConnection();
    
    // Cleanup function
    return () => {
      mounted = false;
      if (client) {
        client.destroy();
      }
    };
  }, [networkInfo.endpoint]);
  
  // Function to query balance
  const queryBalance = async () => {
    if (!api || !address) {
      setError("Please enter an address or wait for connection to be established");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setBalance(null);
    
    try {
      // Get account information from the blockchain
      const accountInfo = await api.query.System.Account.getValue(address);
      
      if (!accountInfo) {
        throw new Error("Account not found");
      }
      
      // Calculate balances
      const freeBalance = accountInfo.data.free;
      const reservedBalance = accountInfo.data.reserved;
      const totalBalance = freeBalance + reservedBalance;
      
      // Format the balances in a readable way
      const divisor = 10n ** BigInt(networkInfo.tokenDecimals);
      const formattedFree = Number(freeBalance) / Number(divisor);
      const formattedReserved = Number(reservedBalance) / Number(divisor);
      const formattedTotal = Number(totalBalance) / Number(divisor);
      
      setBalance({
        free: freeBalance,
        reserved: reservedBalance,
        total: totalBalance,
        formattedFree,
        formattedReserved,
        formattedTotal
      });
    } catch (err) {
      console.error("Error querying balance:", err);
      setError(\`Error querying balance: \${err.message || "Unknown error"}\`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Network color for styling
  const getNetworkColor = () => {
    switch (networkInfo.id) {
      case 'polkadot': return '#E6007A';
      case 'westend': return '#46DDD2';
      case 'paseo': return '#FF7B00';
      case 'rococo': return '#7D42BC';
      default: return '#8E2FD0';
    }
  };
  
  // Styles
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
    cursor: isLoading ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    width: '100%',
    opacity: isLoading ? '0.7' : '1',
  };
  
  const resultCardStyle = {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: 'rgb(243, 231, 231)',
    borderRadius: '4px',
    display: balance ? 'block' : 'none',
  };
  
  const balanceRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  };
  
  const statusStyle = {
    padding: '10px',
    marginTop: '15px',
    backgroundColor: error ? '#ffebee' : '#f5f5f5',
    color: error ? '#c62828' : '#333',
    borderRadius: '4px',
    fontSize: '14px',
    display: (error || isLoading) ? 'block' : 'none',
  };
  
  const connectionStatusStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 0',
    color: '#333',
  };
  
  const connectionIndicatorStyle = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: isConnected ? '#4caf50' : '#f44336',
    marginRight: '8px',
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
          {networkInfo.name} Balance Checker
        </h2>
        <div style={{ opacity: 0.8, fontSize: '14px', marginTop: '4px' }}>
          Query account balances on {networkInfo.isTest ? 'testnet' : 'mainnet'}
        </div>
      </div>
      
      <div style={formStyle}>
        <div style={connectionStatusStyle}>
          <div style={connectionIndicatorStyle}></div>
          <span>{isConnected ? 'Connected to blockchain' : 'Connecting to blockchain...'}</span>
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Account Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={inputStyle}
            placeholder="Enter an account address"
            disabled={isLoading || !isConnected}
          />
        </div>
        
        <button 
          onClick={queryBalance} 
          style={buttonStyle}
          disabled={isLoading || !isConnected}
        >
          {isLoading ? 'Querying...' : 'Check Balance'}
        </button>
        
        <div style={statusStyle}>
          {error || (isLoading && 'Fetching balance information...')}
        </div>
        
        {balance && (
          <div style={resultCardStyle}>
            <h3 style={{ margin: '0 0 10px', color: '#333' }}>Balance Information</h3>
            
            <div style={balanceRowStyle}>
              <span style={{ color: '#666' }}>Free Balance:</span>
              <span style={{ fontWeight: '500' }}>
                {balance.formattedFree.toFixed(4)} {networkInfo.tokenSymbol}
              </span>
            </div>
            
            <div style={balanceRowStyle}>
              <span style={{ color: '#666' }}>Reserved Balance:</span>
              <span style={{ fontWeight: '500' }}>
                {balance.formattedReserved.toFixed(4)} {networkInfo.tokenSymbol}
              </span>
            </div>
            
            <div style={balanceRowStyle}>
              <span style={{ color: '#666', fontWeight: 'bold' }}>Total Balance:</span>
              <span style={{ fontWeight: 'bold' }}>
                {balance.formattedTotal.toFixed(4)} {networkInfo.tokenSymbol}
              </span>
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
              <div>Raw Values (Planck):</div>
              <div style={{ fontFamily: 'monospace', marginTop: '5px' }}>
                <div>Free: {balance.free.toString()}</div>
                <div>Reserved: {balance.reserved.toString()}</div>
                <div>Total: {balance.total.toString()}</div>
              </div>
            </div>
          </div>
        )}
        
        <div style={infoBoxStyle}>
          <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#1976d2' }}>
            About Account Balances
          </h3>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Free Balance:</strong> Tokens available for transfers and transactions
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Reserved Balance:</strong> Tokens locked for staking, voting, or other operations
            </li>
            <li style={{ marginBottom: '8px' }}>
              View details in the explorer: <a 
                href={\`\${networkInfo.explorer}/account/\${address}\`}
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#1976d2' }}
              >
                {networkInfo.explorer.replace(/^https?:\\/\\//, '')}
              </a>
            </li>
            {networkInfo.isTest && (
              <li>
                Need test tokens? Get them from <a 
                  href={networkInfo.faucet} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: '#1976d2' }}
                >
                  the faucet
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// For standalone usage outside of the component
const executeBalanceQuery = async () => {
  // Client setup when running standalone
  ${this.getClientSetup(network)}

  // Alice's address (for demonstration)
  const ALICE = "${this.getTestAccount("alice")}";
  
  try {
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
    
    // Cleanup
    client.destroy();
  } catch (error) {
    console.error("Error querying balance:", error);
  }
};

// Only run standalone version if not in component environment
if (typeof window === 'undefined' || !window.React) {
  executeBalanceQuery().catch(console.error);
}`;
    }

    // Method to get imports based on the network
    getImports(network: Network): string {
        let imports = "";

        // Add standard API imports
        imports += `import { createClient } from "polkadot-api";\n`;
        imports += `import { getWsProvider } from "polkadot-api/ws-provider/web";\n`;
        imports += `import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";\n`;

        // Network-specific imports
        if (network.id === 'westend') {
            imports += `import { wnd } from "@polkadot-api/descriptors";\n`;
        } else if (network.id === 'rococo') {
            imports += `import { roc } from "@polkadot-api/descriptors";\n`;
        } else if (network.id === 'paseo') {
            imports += `import { paseo } from "@polkadot-api/descriptors";\n`;
        } else if (network.id === 'polkadot') {
            imports += `import { dot } from "@polkadot-api/descriptors";\n`;
        }

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
        } else if (network.id === 'polkadot') {
            networkDescriptor = 'dot';
        } else {
            return `// No predefined descriptor for ${network.id}, using unsafe API\nconst provider = getWsProvider("${network.endpoint}");\nconst client = createClient(withPolkadotSdkCompat(provider));\nconst typedApi = client.getUnsafeApi();\n`;
        }

        return `// Set up client for ${network.name}\nconst provider = getWsProvider("${network.endpoint}");\nconst client = createClient(withPolkadotSdkCompat(provider));\nconst typedApi = client.getTypedApi(${networkDescriptor});\n`;
    }

    
    getTestAccount(name: string): string {
        const accounts = {
            codingsh: '5Ei1XfC53EZr7DEhYTk7KRAzneiVppyxz7mr3upQgQw58u7G',
            alice: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            bob: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
            charlie: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
            dave: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
            eve: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
        };

        return accounts[name.toLowerCase()] || accounts.alice;
    }
}