import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class AcalaDeFiExample extends ExampleFactory {
  constructor() {
    super({
      id: "acala-defi",
      name: "Acala DeFi Hub",
      description: "Complete DeFi operations on Acala - swaps, lending, staking, and liquidity provision",
      level: "advanced",
      categories: ["defi", "acala", "swaps", "lending", "staking"],
    });
  }

  generateCode(network: Network): string {
    return `// Acala DeFi Hub - Complete DeFi Operations
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { createClient } from "polkadot-api";
import { acala } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function AcalaDeFiHub() {
  const { status: connectionStatus, activeAccount, extension } = useWallet();
  const { getColor } = useTheme();
  
  const [client, setClient] = useState(null);
  const [typedApi, setTypedApi] = useState(null);
  const [activeTab, setActiveTab] = useState('swap');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // DeFi State
  const [swapState, setSwapState] = useState({
    fromToken: 'ACA',
    toToken: 'AUSD',
    amount: '1',
    slippage: '1'
  });

  const [lendingState, setLendingState] = useState({
    asset: 'DOT',
    amount: '5',
    action: 'supply'
  });

  const [stakingState, setStakingState] = useState({
    asset: 'LDOT',
    amount: '10',
    action: 'stake'
  });

  const [poolData, setPoolData] = useState([]);
  const [userPositions, setUserPositions] = useState([]);

  const acalaEndpoint = "wss://acala-rpc-0.aca-api.network";
  const isConnected = connectionStatus === "connected";

  // Initialize Acala API
  useEffect(() => {
    const initApi = async () => {
      try {
        console.log('Connecting to Acala...');
        const provider = withPolkadotSdkCompat(getWsProvider(acalaEndpoint));
        const newClient = createClient(provider);
        const api = newClient.getTypedApi(acala);
        
        setClient(newClient);
        setTypedApi(api);
        console.log('Acala API connected');
      } catch (err) {
        setError('Failed to connect to Acala: ' + err.message);
      }
    };

    if (isConnected) {
      initApi();
    }

    return () => {
      if (client) {
        client.destroy();
      }
    };
  }, [isConnected]);

  // Fetch DeFi data
  useEffect(() => {
    const fetchDeFiData = async () => {
      if (!typedApi || !activeAccount) return;

      try {
        // Fetch trading pairs and pools
        const pools = await typedApi.query.Dex.TradingPairStatuses.getEntries();
        const poolsData = pools.map(([key, value]) => ({
          pair: key.args,
          status: value,
          liquidity: '0' // Would fetch from liquidity pools
        }));
        setPoolData(poolsData);

        // Fetch user positions
        const positions = await Promise.all([
          typedApi.query.Loans.Positions.getValue(activeAccount.address),
          typedApi.query.Dex.LiquidityPool.getEntries(),
          typedApi.query.Homa.StakingLedgers.getValue(activeAccount.address)
        ]);

        setUserPositions({
          loans: positions[0] || {},
          liquidity: positions[1] || [],
          staking: positions[2] || {}
        });

      } catch (err) {
        console.error('Failed to fetch DeFi data:', err);
      }
    };

    fetchDeFiData();
  }, [typedApi, activeAccount]);

  // Token Swap
  const handleSwap = async () => {
    if (!typedApi || !activeAccount || !extension) return;

    setLoading(true);
    setError('');
    
    try {
      const amount = BigInt(Math.floor(parseFloat(swapState.amount) * 1e12));
      const path = [
        { Token: swapState.fromToken },
        { Token: swapState.toToken }
      ];

      const tx = typedApi.tx.Dex.swap_with_exact_supply({
        path,
        supply_amount: amount,
        min_target_amount: amount * BigInt(98) / BigInt(100) // 2% slippage
      });

      const signer = extension.signer;
      await tx.signSubmitAndWatch(signer, activeAccount.address)
        .subscribe({
          next: (result) => {
            if (result.type === "finalized") {
              setResult({
                type: 'swap',
                txHash: result.txHash,
                message: \`Swapped \${swapState.amount} \${swapState.fromToken} for \${swapState.toToken}\`
              });
            }
          },
          error: (err) => setError('Swap failed: ' + err.message),
          complete: () => setLoading(false)
        });

    } catch (err) {
      setError('Swap failed: ' + err.message);
      setLoading(false);
    }
  };

  // Lending Operations
  const handleLending = async () => {
    if (!typedApi || !activeAccount || !extension) return;

    setLoading(true);
    setError('');

    try {
      const amount = BigInt(Math.floor(parseFloat(lendingState.amount) * 1e10));
      const currencyId = { Token: lendingState.asset };

      let tx;
      if (lendingState.action === 'supply') {
        tx = typedApi.tx.Honzon.adjust_loan({
          currency_id: currencyId,
          collateral_adjustment: amount,
          debit_adjustment: 0n
        });
      } else {
        tx = typedApi.tx.Honzon.adjust_loan({
          currency_id: currencyId,
          collateral_adjustment: -amount,
          debit_adjustment: 0n
        });
      }

      const signer = extension.signer;
      await tx.signSubmitAndWatch(signer, activeAccount.address)
        .subscribe({
          next: (result) => {
            if (result.type === "finalized") {
              setResult({
                type: 'lending',
                txHash: result.txHash,
                message: \`\${lendingState.action === 'supply' ? 'Supplied' : 'Withdrew'} \${lendingState.amount} \${lendingState.asset}\`
              });
            }
          },
          error: (err) => setError('Lending operation failed: ' + err.message),
          complete: () => setLoading(false)
        });

    } catch (err) {
      setError('Lending operation failed: ' + err.message);
      setLoading(false);
    }
  };

  // Liquid Staking
  const handleStaking = async () => {
    if (!typedApi || !activeAccount || !extension) return;

    setLoading(true);
    setError('');

    try {
      const amount = BigInt(Math.floor(parseFloat(stakingState.amount) * 1e10));

      let tx;
      if (stakingState.action === 'stake') {
        tx = typedApi.tx.Homa.mint({ value: amount });
      } else {
        tx = typedApi.tx.Homa.redeem({ value: amount });
      }

      const signer = extension.signer;
      await tx.signSubmitAndWatch(signer, activeAccount.address)
        .subscribe({
          next: (result) => {
            if (result.type === "finalized") {
              setResult({
                type: 'staking',
                txHash: result.txHash,
                message: \`\${stakingState.action === 'stake' ? 'Staked' : 'Unstaked'} \${stakingState.amount} DOT\`
              });
            }
          },
          error: (err) => setError('Staking operation failed: ' + err.message),
          complete: () => setLoading(false)
        });

    } catch (err) {
      setError('Staking operation failed: ' + err.message);
      setLoading(false);
    }
  };

  // Styles
  const containerStyle = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: 'var(--surface, #fff)',
    color: 'var(--text-primary, #000)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: 'white',
    padding: '24px',
    textAlign: 'center'
  };

  const tabStyle = (active) => ({
    padding: '12px 24px',
    border: 'none',
    backgroundColor: active ? '#FF6B35' : 'transparent',
    color: active ? 'white' : '#666',
    cursor: 'pointer',
    borderRadius: '8px',
    margin: '0 4px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  });

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '16px',
    backgroundColor: 'var(--surface, #fff)'
  };

  const buttonStyle = {
    backgroundColor: '#FF6B35',
    color: 'white',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s ease'
  };

  if (!isConnected) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '28px' }}>🏦 Acala DeFi Hub</h2>
          <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
            Complete DeFi operations on Acala Network
          </p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔗</div>
          <h3>Connect Wallet to Access DeFi</h3>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Connect your wallet to start trading, lending, and staking on Acala
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: '28px' }}>🏦 Acala DeFi Hub</h2>
        <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
          Connected: {activeAccount?.name || \`\${activeAccount?.address.slice(0, 8)}...\`}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {['swap', 'lending', 'staking', 'pools'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={tabStyle(activeTab === tab)}
            >
              {tab === 'swap' && '🔄 Swap'}
              {tab === 'lending' && '🏛️ Lending'}
              {tab === 'staking' && '🥩 Staking'}
              {tab === 'pools' && '💧 Pools'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Swap Tab */}
        {activeTab === 'swap' && (
          <div>
            <h3 style={{ marginBottom: '24px', color: '#FF6B35' }}>🔄 Token Swap</h3>
            <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  From Token:
                </label>
                <select
                  value={swapState.fromToken}
                  onChange={(e) => setSwapState({...swapState, fromToken: e.target.value})}
                  style={inputStyle}
                >
                  <option value="ACA">ACA</option>
                  <option value="DOT">DOT</option>
                  <option value="LDOT">LDOT</option>
                  <option value="AUSD">aUSD</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  To Token:
                </label>
                <select
                  value={swapState.toToken}
                  onChange={(e) => setSwapState({...swapState, toToken: e.target.value})}
                  style={inputStyle}
                >
                  <option value="AUSD">aUSD</option>
                  <option value="ACA">ACA</option>
                  <option value="DOT">DOT</option>
                  <option value="LDOT">LDOT</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Amount:
                </label>
                <input
                  type="text"
                  value={swapState.amount}
                  onChange={(e) => setSwapState({...swapState, amount: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter amount"
                />
              </div>

              <button onClick={handleSwap} style={buttonStyle} disabled={loading}>
                {loading ? '⏳ Swapping...' : '🔄 Execute Swap'}
              </button>
            </div>
          </div>
        )}

        {/* Lending Tab */}
        {activeTab === 'lending' && (
          <div>
            <h3 style={{ marginBottom: '24px', color: '#FF6B35' }}>🏛️ Lending & Borrowing</h3>
            <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Asset:
                </label>
                <select
                  value={lendingState.asset}
                  onChange={(e) => setLendingState({...lendingState, asset: e.target.value})}
                  style={inputStyle}
                >
                  <option value="DOT">DOT</option>
                  <option value="ACA">ACA</option>
                  <option value="LDOT">LDOT</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Action:
                </label>
                <select
                  value={lendingState.action}
                  onChange={(e) => setLendingState({...lendingState, action: e.target.value})}
                  style={inputStyle}
                >
                  <option value="supply">Supply Collateral</option>
                  <option value="withdraw">Withdraw Collateral</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Amount:
                </label>
                <input
                  type="text"
                  value={lendingState.amount}
                  onChange={(e) => setLendingState({...lendingState, amount: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter amount"
                />
              </div>

              <button onClick={handleLending} style={buttonStyle} disabled={loading}>
                {loading ? '⏳ Processing...' : '🏛️ Execute Lending Operation'}
              </button>
            </div>
          </div>
        )}

        {/* Staking Tab */}
        {activeTab === 'staking' && (
          <div>
            <h3 style={{ marginBottom: '24px', color: '#FF6B35' }}>🥩 Liquid Staking</h3>
            <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Action:
                </label>
                <select
                  value={stakingState.action}
                  onChange={(e) => setStakingState({...stakingState, action: e.target.value})}
                  style={inputStyle}
                >
                  <option value="stake">Stake DOT → LDOT</option>
                  <option value="unstake">Unstake LDOT → DOT</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Amount (DOT):
                </label>
                <input
                  type="text"
                  value={stakingState.amount}
                  onChange={(e) => setStakingState({...stakingState, amount: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter DOT amount"
                />
              </div>

              <button onClick={handleStaking} style={buttonStyle} disabled={loading}>
                {loading ? '⏳ Processing...' : '🥩 Execute Staking Operation'}
              </button>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f0f8ff',
              borderRadius: '8px',
              borderLeft: '4px solid #2196f3'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#1976d2' }}>💡 Liquid Staking Benefits</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                <li>Earn staking rewards while maintaining liquidity</li>
                <li>LDOT can be used in other DeFi protocols</li>
                <li>No unbonding period - instant liquidity</li>
                <li>Automatic reward compounding</li>
              </ul>
            </div>
          </div>
        )}

        {/* Pools Tab */}
        {activeTab === 'pools' && (
          <div>
            <h3 style={{ marginBottom: '24px', color: '#FF6B35' }}>💧 Liquidity Pools</h3>
            
            {/* User Positions */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ marginBottom: '16px' }}>Your Positions</h4>
              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#FF6B35' }}>$0.00</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Total Liquidity</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#4caf50' }}>$0.00</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Total Earned</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#2196f3' }}>0</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Active Pools</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Pools */}
            <div>
              <h4 style={{ marginBottom: '16px' }}>Available Pools</h4>
              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  { pair: 'DOT/AUSD', apy: '12.5%', tvl: '$2.1M' },
                  { pair: 'ACA/AUSD', apy: '18.2%', tvl: '$850K' },
                  { pair: 'LDOT/DOT', apy: '8.7%', tvl: '$1.3M' }
                ].map((pool, index) => (
                  <div key={index} style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '2px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        {pool.pair}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        TVL: {pool.tvl}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: '#4caf50', marginBottom: '4px' }}>
                        {pool.apy}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        APY
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: '#f0f8ff',
            borderRadius: '12px',
            border: '1px solid #2196f3'
          }}>
            <h4 style={{ margin: '0 0 12px', color: '#1976d2' }}>✅ Transaction Successful</h4>
            <p style={{ margin: '0 0 8px', fontSize: '14px' }}>{result.message}</p>
            <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
              TX: {result.txHash}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  );
}`;
  }
}