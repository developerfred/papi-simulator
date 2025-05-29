import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class WalletTransferExample extends ExampleFactory {
  constructor() {
    super({
      id: "wallet-transfer",
      name: "Wallet Transfer (Real)",
      description: "Create and submit real transactions using connected wallet",
      level: "intermediate",
      categories: ["transactions", "wallets", "components", "react"],
    });
  }

  generateCode(network: Network): string {
    return `// Real Wallet Transfer on ${network.name} 
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { createClient } from "polkadot-api";
import { ${network.descriptorKey} } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function RealWalletTransfer() {  
  const { 
    status: connectionStatus, 
    activeAccount, 
    accounts, 
    extension,
    connect,
    disconnect 
  } = useWallet();

  const { getColor, getNetworkColor } = useTheme();
  
  const [recipient, setRecipient] = useState('${this.getTestAccount("papi")}');
  const [amount, setAmount] = useState('0.1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [error, setError] = useState('');
  const [client, setClient] = useState(null);
  const [typedApi, setTypedApi] = useState(null);
  const [balance, setBalance] = useState(null);

  const network = {
    name: "${network.name}",
    tokenSymbol: "${network.tokenSymbol}",
    tokenDecimals: ${network.tokenDecimals},
    endpoint: "${network.endpoint}",
    explorer: "${network.explorer}",
    isTest: ${network.isTest || false}
  };

  const isConnected = connectionStatus === "connected";
  const isConnecting = connectionStatus === "connecting";

  // Initialize API connection
  useEffect(() => {
    const initApi = async () => {
      try {
        console.log('Initializing API connection to:', network.endpoint);
        
        const provider = withPolkadotSdkCompat(
          getWsProvider(network.endpoint)
        );
        const newClient = createClient(provider);
        const api = newClient.getTypedApi(${network.descriptorKey});
        
        setClient(newClient);
        setTypedApi(api);
        
        console.log('API connection established');
      } catch (err) {
        console.error('API initialization failed:', err);
        setError('Failed to connect to blockchain: ' + err.message);
      }
    };

    if (isConnected) {
      initApi();
    }

    return () => {
      if (client) {
        client.destroy();
        setClient(null);
        setTypedApi(null);
      }
    };
  }, [isConnected, network.endpoint]);

  // Fetch balance when account or API changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!typedApi || !activeAccount) return;
      
      try {
        const accountInfo = await typedApi.query.System.Account.getValue(activeAccount.address);
        const freeBalance = accountInfo?.data?.free || 0n;
        const balanceFormatted = (Number(freeBalance) / Math.pow(10, network.tokenDecimals)).toFixed(4);
        setBalance(balanceFormatted);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      }
    };

    fetchBalance();
  }, [typedApi, activeAccount, network.tokenDecimals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!activeAccount || !extension || !typedApi) {
      setError('Wallet or API not ready');
      return;
    }

    if (!recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setTxResult(null);

    try {
      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Convert amount to chain units
      const chainAmount = BigInt(
        Math.floor(numAmount * Math.pow(10, network.tokenDecimals))
      );

      console.log(\`Preparing transfer of \${amount} \${network.tokenSymbol} to \${recipient}\`);
      console.log(\`Chain amount: \${chainAmount}\`);

      // Create transaction
      const tx = typedApi.tx.Balances.transfer_keep_alive({
        dest: { type: "Id", value: recipient },
        value: chainAmount,
      });

      console.log('Transaction created, waiting for signature...');

      // Get signer from extension
      const injector = await extension.accounts.get();
      const signer = extension.signer;

      if (!signer) {
        throw new Error('Wallet signer not available');
      }

      // Sign and submit transaction
      const unsubscribe = await tx.signSubmitAndWatch(signer, activeAccount.address)
        .subscribe({
          next: (result) => {
            console.log('Transaction status:', result);
            
            if (result.type === "txBestBlocksState") {
              if (result.txHash) {
                setTxResult({
                  txHash: result.txHash,
                  status: 'Pending',
                  blockHash: result.found?.[0]?.block?.hash
                });
              }
            } else if (result.type === "finalized") {
              setTxResult(prev => ({
                ...prev,
                status: 'Finalized',
                blockHash: result.block.hash,
                events: result.events?.map(e => e.type) || []
              }));
              unsubscribe();
            }
          },
          error: (err) => {
            console.error('Transaction failed:', err);
            setError(err.message || 'Transaction failed');
            setIsSubmitting(false);
            unsubscribe();
          },
          complete: () => {
            console.log('Transaction completed');
            setIsSubmitting(false);
          }
        });

    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err.message || 'Transaction failed');
      setIsSubmitting(false);
    }
  };

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
    }
  };

  // Styles
  const containerStyle = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'var(--surface, #fff)',
    color: 'var(--text-primary, #000)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    border: '1px solid var(--border, #e0e0e0)'
  };

  const headerStyle = {
    background: \`linear-gradient(135deg, \${getNetworkColor(network)}, \${getNetworkColor(network)}dd)\`,
    color: 'white',
    padding: '20px'
  };

  const formStyle = {
    padding: '24px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border, #ddd)',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: 'var(--surface, #fff)',
    color: 'var(--text-primary, #000)',
    transition: 'border-color 0.2s ease'
  };

  const buttonStyle = {
    backgroundColor: isConnected && !isSubmitting ? getNetworkColor(network) : 'var(--border, #ccc)',
    color: 'white',
    border: 'none',
    padding: '14px 20px',
    borderRadius: '8px',
    cursor: isConnected && !isSubmitting ? 'pointer' : 'not-allowed',
    fontSize: '16px',
    fontWeight: '600',
    width: '100%',
    opacity: isSubmitting ? '0.7' : '1',
    transition: 'all 0.2s ease'
  };

  // Wallet connection prompt
  if (!isConnected) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Connect Wallet Required</h2>
          <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '14px' }}>
            Real transactions on ${network.name}
          </p>
        </div>
        <div style={formStyle}>
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: 'var(--surface-variant, #f8f9fa)',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
            <h3 style={{ margin: '0 0 12px', color: 'var(--text-primary, #333)' }}>
              Wallet Connection Required
            </h3>
            <p style={{ margin: '0', color: 'var(--text-secondary, #666)', fontSize: '14px' }}>
              This example requires a connected wallet to sign real transactions on ${network.name}.
            </p>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            style={{
              ...buttonStyle,
              backgroundColor: isConnecting ? 'var(--border, #ccc)' : getNetworkColor(network),
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          <div style={{
            padding: '16px',
            backgroundColor: 'color-mix(in srgb, var(--info, #2196f3) 10%, var(--surface, #fff))',
            borderRadius: '8px',
            borderLeft: '4px solid var(--info, #2196f3)',
            fontSize: '14px',
            color: 'var(--text-primary, #333)'
          }}>
            <strong>How to connect:</strong>
            <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Install a Polkadot wallet (Polkadot.js, Talisman, SubWallet)</li>
              <li>Click "Connect Wallet" above or use the wallet icon in navigation</li>
              <li>Select your wallet and account</li>
              <li>Return here to submit real transactions</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>
          Real Wallet Transfer - ${network.name}
        </h2>
        <div style={{ opacity: 0.9, fontSize: '14px', marginTop: '8px' }}>
          Connected: {activeAccount?.name || \`\${activeAccount?.address.slice(0, 8)}...\`}
          {balance && \` | Balance: \${balance} \${network.tokenSymbol}\`}
        </div>
      </div>

      <div style={formStyle}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: 'var(--text-primary, #333)' 
            }}>
              From Account:
            </label>
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--surface-variant, #f5f5f5)',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: 'var(--text-secondary, #666)',
              wordBreak: 'break-all'
            }}>
              {activeAccount?.address}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: 'var(--text-primary, #333)' 
            }}>
              Recipient Address:
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={inputStyle}
              disabled={isSubmitting}
              placeholder="Enter recipient address (e.g., 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY)"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: 'var(--text-primary, #333)' 
            }}>
              Amount ({network.tokenSymbol}):
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
              disabled={isSubmitting}
              placeholder={\`Amount in \${network.tokenSymbol} (e.g., 0.1)\`}
            />
          </div>

          <button 
            type="submit" 
            style={buttonStyle} 
            disabled={!typedApi || isSubmitting}
          >
            {isSubmitting ? '⏳ Submitting Transaction...' : \`🚀 Submit Real Transaction\`}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: 'color-mix(in srgb, var(--error, #f44336) 10%, var(--surface, #fff))',
            color: 'var(--error, #c62828)',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid color-mix(in srgb, var(--error, #f44336) 30%, transparent)'
          }}>
            ❌ {error}
          </div>
        )}

        {txResult && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: txResult.status === 'Finalized' 
              ? 'color-mix(in srgb, var(--success, #4caf50) 10%, var(--surface, #fff))'
              : 'color-mix(in srgb, var(--info, #2196f3) 10%, var(--surface, #fff))',
            borderRadius: '12px',
            border: \`1px solid \${txResult.status === 'Finalized' 
              ? 'color-mix(in srgb, var(--success, #4caf50) 30%, transparent)'
              : 'color-mix(in srgb, var(--info, #2196f3) 30%, transparent)'}\`
          }}>
            <h3 style={{ 
              margin: '0 0 16px', 
              color: txResult.status === 'Finalized' ? 'var(--success, #2e7d32)' : 'var(--info, #1976d2)',
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px'
            }}>
              {txResult.status === 'Finalized' ? '✅' : '⏳'} Transaction {txResult.status}
            </h3>
            
            <div style={{ fontSize: '14px', color: 'var(--text-primary, #333)' }}>
              <div style={{ marginBottom: '12px', wordBreak: 'break-all' }}>
                <strong>Transaction Hash:</strong>
                <div style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '12px', 
                  marginTop: '4px',
                  padding: '8px',
                  backgroundColor: 'var(--surface-variant, #f5f5f5)',
                  borderRadius: '4px'
                }}>
                  {txResult.txHash}
                </div>
              </div>
              
              {txResult.blockHash && (
                <div style={{ marginBottom: '12px', wordBreak: 'break-all' }}>
                  <strong>Block Hash:</strong>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '12px', 
                    marginTop: '4px',
                    padding: '8px',
                    backgroundColor: 'var(--surface-variant, #f5f5f5)',
                    borderRadius: '4px'
                  }}>
                    {txResult.blockHash}
                  </div>
                </div>
              )}
              
              {txResult.events && txResult.events.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <strong>Events:</strong> {txResult.events.join(', ')}
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px' }}>
              <a
                href={\`\${network.explorer}/extrinsic/\${txResult.txHash}\`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--network-primary, #1976d2)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                🔗 View in Block Explorer →
              </a>
            </div>
          </div>
        )}

        <div style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: network.isTest 
            ? 'color-mix(in srgb, var(--success, #4caf50) 10%, var(--surface, #fff))'
            : 'color-mix(in srgb, var(--warning, #ff9800) 10%, var(--surface, #fff))',
          borderRadius: '12px',
          borderLeft: \`4px solid var(\${network.isTest ? '--success, #4caf50' : '--warning, #ff9800'})\`,
          fontSize: '14px',
          color: 'var(--text-primary, #333)'
        }}>
          <h4 style={{ 
            margin: '0 0 12px', 
            fontSize: '16px', 
            color: network.isTest ? 'var(--success, #2e7d32)' : 'var(--warning, #f57c00)'
          }}>
            {network.isTest ? '🧪 Test Network' : '⚠️ Real Network Warning'}
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              This submits REAL transactions on ${network.name}
            </li>
            <li style={{ marginBottom: '8px' }}>
              ${network.isTest ? 'Uses test tokens - safe for experimentation' : 'Uses real tokens - be careful with amounts!'}
            </li>
            <li style={{ marginBottom: '8px' }}>
              Your wallet will prompt you to confirm the transaction
            </li>
            <li style={{ marginBottom: '8px' }}>
              Transaction fees will be deducted from your account
            </li>
            <li>
              Always double-check the recipient address before submitting
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}`;
  }

  private getNetworkColor(network: Network): string {
    const colors = {
      polkadot: '#E6007A',
      westend: '#46DDD2',
      paseo: '#FF7B00',
      rococo: '#7D42BC',
    };
    return colors[network.id as keyof typeof colors] || '#8E2FD0';
  }

  protected getTestAccount(name: string): string {
    const accounts = {
      papi: '5Gq3Z2KdQvKiZj1rvJ57eSkABKGTYfx8DigokpDvQ2jtvkAJ',
      alice: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      bob: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      charlie: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y'
    };
    return accounts[name as keyof typeof accounts] || accounts.alice;
  }
}