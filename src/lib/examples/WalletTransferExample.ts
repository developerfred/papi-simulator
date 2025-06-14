/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

// @ts-ignore
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
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getInjectedExtensions, connectInjectedExtension } from "polkadot-api/pjs-signer";
${this.getDescriptorImport(network)}

export default function RealWalletTransfer() {  
  const { status, activeAccount, connect, availableWallets } = useWallet();
  const [recipient, setRecipient] = useState('${this.getTestAccount("bob")}');
  const [amount, setAmount] = useState('0.01');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [error, setError] = useState('');
  const [api, setApi] = useState(null);
  const [balance, setBalance] = useState(null);
  const [papiSigner, setPapiSigner] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const network = {
    name: "${network.name}",
    tokenSymbol: "${network.tokenSymbol}",
    tokenDecimals: ${network.tokenDecimals},
    endpoint: "${network.endpoint}",
    explorer: "${network.explorer}",
    isTest: ${network.isTest || false}, 
  }


  const handleReset = () => {
    setApi(null);
    setPapiSigner(null);
    setError('');
    setTxResult(null);
    setIsInitializing(false);
  };

  const isConnected = status === "connected";

  // Initialize API with better lifecycle management
  useEffect(() => {
    let mounted = true;
    let client = null;
    let isDestroying = false;
    
    const initApi = async () => {
      if (!isConnected || isInitializing) {
        setApi(null);
        return;
      }
      
      setIsInitializing(true);
      
      try {
        setError('');
        
        // Clean up any existing client first
        if (client && !isDestroying) {
          isDestroying = true;
          try {
            await client.destroy();
          } catch (e) {
            console.warn('Previous client cleanup:', e);
          }
          isDestroying = false;
        }
        
        const provider = getWsProvider(network.endpoint);
        client = createClient(withPolkadotSdkCompat(provider));
        
        // Give provider time to connect
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const apiInstance = ${this.getApiCall(network)};
        
        // Test connection with a simple query
        await apiInstance.query.System.Number.getValue();
        
        if (mounted) {
          setApi(apiInstance);
        }
      } catch (err) {
        console.error('API init failed:', err);
        if (mounted) {
          setError('Failed to connect to blockchain');
          setApi(null);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    // Debounce initialization to prevent rapid reconnections
    const timeoutId = setTimeout(initApi, 500);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      setIsInitializing(false);
      
      if (client && !isDestroying) {
        isDestroying = true;
        // Use a longer delay for cleanup to avoid subscription conflicts
        setTimeout(async () => {
          try {
            await client.destroy();
          } catch (e) {
            console.warn('Client cleanup error:', e);
          }
        }, 1000);
      }
    };
  }, [isConnected, network.endpoint]);

  // Initialize PAPI signer with better error handling
  useEffect(() => {
    let mounted = true;
    
    const initSigner = async () => {
      if (!isConnected || !activeAccount) {
        setPapiSigner(null);
        return;
      }
      
      try {
        // Add a small delay to ensure wallet is fully loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const extensions = getInjectedExtensions();
        if (extensions.length === 0) {
          console.warn('No PAPI extensions found');
          return;
        }
        
        const extension = await connectInjectedExtension(extensions[0]);
        const accounts = extension.getAccounts();
        
        const account = accounts.find(acc => acc.address === activeAccount.address);
        if (account && account.polkadotSigner && mounted) {
          setPapiSigner(account.polkadotSigner);
          console.log('PAPI signer initialized successfully');
        }
      } catch (err) {
        console.error('Failed to initialize PAPI signer:', err);
        if (mounted) {
          setPapiSigner(null);
        }
      }
    };

    initSigner();
    
    return () => {
      mounted = false;
    };
  }, [isConnected, activeAccount]);

  // Fetch balance with better error handling
  useEffect(() => {
    if (!api || !activeAccount) {
      setBalance(null);
      return;
    }
    
    let mounted = true;
    
    const fetchBalance = async () => {
      try {
        const accountInfo = await api.query.System.Account.getValue(activeAccount.address);
        const freeBalance = accountInfo?.data?.free || 0n;
        const formatted = (Number(freeBalance) / Math.pow(10, network.tokenDecimals)).toFixed(6);
        
        if (mounted) {
          setBalance(formatted);
        }
      } catch (err) {
        console.error('Balance fetch failed:', err);
        if (mounted) {
          setBalance('Error');
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [api, activeAccount, network.tokenDecimals]);

  const handleConnect = async () => {
    try {
      setError('');
      if (!availableWallets?.length) {
        throw new Error('No wallet found. Please install Polkadot.js, Talisman, or SubWallet.');
      }
      await connect(availableWallets[0].id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!activeAccount || !papiSigner || !api) {
      setError('Wallet or API not ready');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (recipient.length < 47 || recipient.length > 48) {
      setError('Invalid recipient address format');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setTxResult(null);

    try {
      const chainAmount = BigInt(Math.floor(numAmount * Math.pow(10, network.tokenDecimals)));
      
      let tx;
      try {
        ${this.getTransactionCall(network)}
      } catch {
        tx = api.tx.Balances.transfer_keep_alive({ dest: recipient, value: chainAmount });
      }

      console.log('Submitting transaction with PAPI signer...');
      
      // Create a timeout for the transaction
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction timeout after 60 seconds')), 60000);
      });
      
      // Race between transaction and timeout
      const result = await Promise.race([
        tx.signAndSubmit(papiSigner),
        timeoutPromise
      ]);
      
      console.log('Transaction result:', result);
      
      setTxResult({
        txHash: result?.txHash || result,
        status: 'Submitted',
        message: 'Transaction submitted successfully'
      });

      // Refresh balance after successful submission
      setTimeout(() => {
        if (api && activeAccount) {
          api.query.System.Account.getValue(activeAccount.address)
            .then(accountInfo => {
              const freeBalance = accountInfo?.data?.free || 0n;
              const formatted = (Number(freeBalance) / Math.pow(10, network.tokenDecimals)).toFixed(6);
              setBalance(formatted);
            })
            .catch(err => console.warn('Balance refresh failed:', err));
        }
      }, 5000);

    } catch (err) {
      console.error('Transaction failed:', err);
      let errorMessage = err.message || 'Transaction failed';
      
      if (errorMessage.includes('Cancelled')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (errorMessage.includes('insufficient')) {
        errorMessage = 'Insufficient balance for this transaction';
      } else if (errorMessage.includes('ExistentialDeposit')) {
        errorMessage = 'Recipient needs minimum balance to receive funds';
      } else if (errorMessage.includes('BadOrigin')) {
        errorMessage = 'Invalid transaction origin. Please reconnect wallet';
      }
      
      setError(errorMessage);
    }
    
    setIsSubmitting(false);
  };

  const getNetworkColor = () => {
    const colors = { polkadot: '#E6007A', westend: '#46DDD2', paseo: '#FF7B00', rococo: '#7D42BC' };
    return colors[network.name.toLowerCase()] || '#8E2FD0';
  };

  const containerStyle = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    border: '1px solid #e0e0e0'
  };

  const headerStyle = {
    background: \`linear-gradient(135deg, \${getNetworkColor()}, \${getNetworkColor()}dd)\`,
    color: 'white',
    padding: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    color: '#000'
  };

  const buttonStyle = {
    backgroundColor: isConnected && !isSubmitting && papiSigner ? getNetworkColor() : '#ccc',
    color: 'white',
    border: 'none',
    padding: '14px 20px',
    borderRadius: '8px',
    cursor: isConnected && !isSubmitting && papiSigner ? 'pointer' : 'not-allowed',
    fontSize: '16px',
    fontWeight: '600',
    width: '100%',
    opacity: isSubmitting ? '0.7' : '1'
  };

  if (!isConnected) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Connect Wallet</h2>
          <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '14px' }}>
            Connect to submit transactions on ${network.name}
          </p>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔗</div>
            <h3 style={{ margin: '0 0 12px', color: '#333' }}>Wallet Required</h3>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
              Connect your wallet to submit real transactions
            </p>
          </div>

          <button onClick={handleConnect} style={buttonStyle}>
            Connect Wallet
          </button>
          
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Transfer - ${network.name}</h2>
        <div style={{ opacity: 0.9, fontSize: '14px', marginTop: '8px' }}>
          {activeAccount?.name || \`\${activeAccount?.address.slice(0, 8)}...\`}
          {balance && \` | \${balance} \${network.tokenSymbol}\`}
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: api && papiSigner ? '#e8f5e8' : error ? '#ffebee' : '#fff3e0',
          borderRadius: '8px',
          border: \`1px solid \${api && papiSigner ? '#4caf50' : error ? '#f44336' : '#ff9800'}\`,
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {api && papiSigner ? '✅ Ready to transact' : 
               isInitializing ? '⏳ Initializing...' :
               error ? '❌ Failed' : '⏳ Connecting'}
            </span>
            {(error || (!api && !isInitializing)) && (
              <button
                onClick={handleReset}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            )}
          </div>
          {error && (
            <div style={{ marginTop: '8px', color: '#d32f2f' }}>{error}</div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              From:
            </label>
            <div style={{
              padding: '12px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: '#666',
              wordBreak: 'break-all'
            }}>
              {activeAccount?.address}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              To:
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={inputStyle}
              disabled={isSubmitting}
              placeholder="Recipient address"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Amount ({network.tokenSymbol}):
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
              disabled={isSubmitting}
              placeholder="0.01"
            />
          </div>

          <button type="submit" style={buttonStyle} disabled={!api || !papiSigner || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Send Transaction'}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {txResult && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: '#e8f5e8',
            borderRadius: '12px',
            border: '1px solid #4caf50'
          }}>
            <h3 style={{ 
              margin: '0 0 16px', 
              color: '#2e7d32',
              fontSize: '18px'
            }}>
              ✅ {txResult.status}
            </h3>
            
            <div style={{ fontSize: '14px', color: '#333', marginBottom: '12px' }}>
              <strong>Transaction Hash:</strong>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '12px', 
                marginTop: '4px',
                padding: '8px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                wordBreak: 'break-all'
              }}>
                {txResult.txHash?.toString() || 'Pending...'}
              </div>
            </div>

            {txResult.message && (
              <div style={{ fontSize: '14px', color: '#2e7d32', marginBottom: '12px' }}>
                {txResult.message}
              </div>
            )}

            {txResult.txHash && (
              <a
                href={\`\${network.explorer}/extrinsic/\${txResult.txHash}\`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                View in Explorer →
              </a>
            )}
          </div>
        )}

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: network.isTest ? '#e8f5e8' : '#fff3e0',
          borderRadius: '8px',
          borderLeft: \`4px solid \${network.isTest ? '#4caf50' : '#ff9800'}\`,
          fontSize: '14px',
          color: '#333'
        }}>
          <strong>{network.isTest ? '🧪 Test Network' : '⚠️ Real Network'}</strong>
          <div style={{ marginTop: '8px' }}>
            {network.isTest 
              ? 'Safe testing environment with test tokens' 
              : 'Real transactions with real tokens - double-check everything!'
            }
          </div>
        </div>
      </div>
    </div>
  );
}`;
  }

  private getDescriptorImport(network: Network): string {
    const descriptors = {
      westend: 'import { wnd, MultiAddress } from "@polkadot-api/descriptors";',
      rococo: 'import { roc, MultiAddress } from "@polkadot-api/descriptors";',
      paseo: 'import { paseo, MultiAddress } from "@polkadot-api/descriptors";',
      polkadot: 'import { dot, MultiAddress } from "@polkadot-api/descriptors";'
    };
    return descriptors[network.id] || '';
  }

  private getApiCall(network: Network): string {
    const descriptors = { westend: 'wnd', rococo: 'roc', paseo: 'paseo', polkadot: 'dot' };
    const descriptor = descriptors[network.id];
    return descriptor ? `client.getTypedApi(${descriptor})` : 'client.getUnsafeApi()';
  }

  private getTransactionCall(network: Network): string {
    const descriptors = { westend: 'wnd', rococo: 'roc', paseo: 'paseo', polkadot: 'dot' };
    const descriptor = descriptors[network.id];

    if (descriptor) {
      return `tx = api.tx.Balances.transfer_keep_alive({
        dest: MultiAddress.Id(recipient),
        value: chainAmount
      });`;
    } else {
      return `tx = api.tx.Balances.transfer_keep_alive({
        dest: recipient,
        value: chainAmount
      });`;
    }
  }

  private getTestAccount(name: string): string {
    const accounts = {
      bob: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      alice: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      charlie: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y'
    };
    return accounts[name as keyof typeof accounts] || accounts.alice;
  }
}