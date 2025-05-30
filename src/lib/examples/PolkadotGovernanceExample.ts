/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

// @ts-ignore
export class PolkadotGovernanceExample extends ExampleFactory {
  constructor() {
    super({
      id: "polkadot-governance",
      name: "Polkadot Governance Hub",
      description: "Participate in governance - referenda, voting, delegation, and treasury proposals",
      level: "advanced",
      categories: ["governance", "polkadot", "voting", "treasury", "democracy"],
    });
  }

  generateCode(network: Network): string {
    return `// Polkadot Governance Hub - Complete Governance Operations
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getInjectedExtensions, connectInjectedExtension } from "polkadot-api/pjs-signer";
${this.getImports(network)}

export default function PolkadotGovernanceHub() {
  const { status: connectionStatus, activeAccount, connect, availableWallets } = useWallet();
  
  const [api, setApi] = useState(null);
  const [papiSigner, setPapiSigner] = useState(null);
  const [activeTab, setActiveTab] = useState('referenda');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Governance State
  const [referenda, setReferenda] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [treasuryProposals, setTreasuryProposals] = useState([]);

  // Form States
  const [voteForm, setVoteForm] = useState({
    referendumId: '',
    conviction: '1',
    vote: 'aye',
    amount: '1'
  });

  const [delegateForm, setDelegateForm] = useState({
    target: '${this.getTestAccount("alice")}',
    conviction: '1',
    amount: '10'
  });

  const [proposalForm, setProposalForm] = useState({
    value: '100',
    beneficiary: '${this.getTestAccount("bob")}',
    description: 'Test treasury proposal'
  });

  const network = {
    name: "${network.name}",
    tokenSymbol: "${network.tokenSymbol}",
    tokenDecimals: ${network.tokenDecimals},
    endpoint: "${network.endpoint}",
    explorer: "${network.explorer}"
  };

  const isConnected = connectionStatus === "connected";

  // Initialize API
  useEffect(() => {
    let mounted = true;
    let client = null;
    
    const initApi = async () => {
      if (!isConnected) return;
      
      try {
        setError('');
        const provider = getWsProvider(network.endpoint);
        client = createClient(withPolkadotSdkCompat(provider));
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const apiInstance = ${this.getApiCall(network)};
        await apiInstance.query.System.Number.getValue();
        
        if (mounted) {
          setApi(apiInstance);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to connect to ${network.name}');
        }
      }
    };

    initApi();
    return () => {
      mounted = false;
      if (client) {
        setTimeout(() => client.destroy().catch(() => {}), 100);
      }
    };
  }, [isConnected]);

  // Initialize PAPI signer
  useEffect(() => {
    const initSigner = async () => {
      if (!isConnected || !activeAccount) return;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const extensions = getInjectedExtensions();
        if (extensions.length === 0) return;
        
        const extension = await connectInjectedExtension(extensions[0]);
        const accounts = extension.getAccounts();
        
        const account = accounts.find(acc => acc.address === activeAccount.address);
        if (account?.polkadotSigner) {
          setPapiSigner(account.polkadotSigner);
        }
      } catch (err) {
        console.error('Failed to initialize PAPI signer:', err);
      }
    };

    initSigner();
  }, [isConnected, activeAccount]);

  // Fetch governance data
  useEffect(() => {
    const fetchGovernanceData = async () => {
      if (!api || !activeAccount) return;

      try {
        // Fetch active referenda (try different query paths)
        let activeReferenda = [];
        try {
          if (api.query.Referenda?.ReferendumInfoFor) {
            const entries = await api.query.Referenda.ReferendumInfoFor.getEntries();
            activeReferenda = entries.slice(0, 5); // Limit to 5 for demo
          } else if (api.query.Democracy?.ReferendumInfoOf) {
            const entries = await api.query.Democracy.ReferendumInfoOf.getEntries();
            activeReferenda = entries.slice(0, 5);
          }
        } catch (err) {
          console.log('No referenda data available');
        }
        
        const formattedReferenda = activeReferenda.map(([key, value], index) => ({
          id: key?.args?.[0] || index,
          info: value,
          status: value?.type || 'Active',
          proposal: 'Governance Proposal',
          end: 'TBD'
        }));
        setReferenda(formattedReferenda);

        // Fetch treasury proposals
        try {
          if (api.query.Treasury?.Proposals) {
            const proposals = await api.query.Treasury.Proposals.getEntries();
            const formattedProposals = proposals.slice(0, 3).map(([key, value], index) => ({
              id: key?.args?.[0] || index,
              value: value?.value || '1000000000000',
              beneficiary: value?.beneficiary || 'Unknown',
              bond: value?.bond || '100000000000'
            }));
            setTreasuryProposals(formattedProposals);
          }
        } catch (err) {
          console.log('No treasury data available');
        }

      } catch (err) {
        console.error('Failed to fetch governance data:', err);
      }
    };

    fetchGovernanceData();
  }, [api, activeAccount]);

  // Vote on referendum
  const handleVote = async () => {
    if (!api || !activeAccount || !papiSigner) {
      setError('API or signer not ready');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const amount = BigInt(Math.floor(parseFloat(voteForm.amount) * Math.pow(10, network.tokenDecimals)));
      const referendumId = parseInt(voteForm.referendumId);

      if (isNaN(referendumId) || referendumId < 0) {
        throw new Error('Please enter a valid referendum ID');
      }

      let tx;
      
      // Try different vote formats based on network
      try {
        if (api.tx.Referenda?.vote) {
          // OpenGov format
          tx = api.tx.Referenda.vote({
            poll_index: referendumId,
            vote: {
              Standard: {
                vote: voteForm.vote === 'aye' ? { Aye: amount } : { Nay: amount },
                balance: amount
              }
            }
          });
        } else if (api.tx.Democracy?.vote) {
          // Legacy Democracy format
          const conviction = parseInt(voteForm.conviction);
          tx = api.tx.Democracy.vote({
            ref_index: referendumId,
            vote: {
              Standard: {
                vote: voteForm.vote === 'aye' ? 
                  { Aye: conviction } : 
                  { Nay: conviction },
                balance: amount
              }
            }
          });
        } else {
          throw new Error('Voting not available on this network');
        }
      } catch (formatError) {
        // Fallback to simpler format
        if (api.tx.Democracy?.vote) {
          tx = api.tx.Democracy.vote({
            ref_index: referendumId,
            vote: voteForm.vote === 'aye' ? 
              { Aye: parseInt(voteForm.conviction) } : 
              { Nay: parseInt(voteForm.conviction) }
          });
        } else {
          throw new Error('Voting not supported on this network');
        }
      }

      console.log('Submitting vote...');
      const result = await tx.signAndSubmit(papiSigner);
      
      setResult({
        type: 'vote',
        txHash: result?.toString() || 'Success',
        message: \`Voted \${voteForm.vote.toUpperCase()} on referendum #\${referendumId}\`
      });
      
      setVoteForm({ referendumId: '', conviction: '1', vote: 'aye', amount: '1' });

    } catch (err) {
      console.error('Vote failed:', err);
      setError(\`Vote failed: \${err.message}\`);
    } finally {
      setLoading(false);
    }
  };

  // Delegate votes
  const handleDelegate = async () => {
    if (!api || !activeAccount || !papiSigner) {
      setError('API or signer not ready');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const amount = BigInt(Math.floor(parseFloat(delegateForm.amount) * Math.pow(10, network.tokenDecimals)));
      const conviction = parseInt(delegateForm.conviction);

      if (delegateForm.target.length < 47) {
        throw new Error('Please enter a valid target address');
      }

      let tx;
      
      try {
        if (api.tx.Referenda?.delegate) {
          tx = api.tx.Referenda.delegate({
            class: 0,
            to: delegateForm.target,
            conviction,
            balance: amount
          });
        } else if (api.tx.Democracy?.delegate) {
          tx = api.tx.Democracy.delegate({
            to: delegateForm.target,
            conviction,
            balance: amount
          });
        } else {
          throw new Error('Delegation not available on this network');
        }
      } catch (formatError) {
        // Fallback format
        if (api.tx.Democracy?.delegate) {
          tx = api.tx.Democracy.delegate({
            to: delegateForm.target,
            conviction,
            balance: amount
          });
        } else {
          throw new Error('Delegation not supported on this network');
        }
      }

      console.log('Submitting delegation...');
      const result = await tx.signAndSubmit(papiSigner);
      
      setResult({
        type: 'delegate',
        txHash: result?.toString() || 'Success',
        message: \`Delegated \${delegateForm.amount} ${network.tokenSymbol} to \${delegateForm.target.slice(0, 12)}...\`
      });
      
      setDelegateForm({ target: '${this.getTestAccount("alice")}', conviction: '1', amount: '10' });

    } catch (err) {
      console.error('Delegation failed:', err);
      setError(\`Delegation failed: \${err.message}\`);
    } finally {
      setLoading(false);
    }
  };

  // Submit treasury proposal
  const handleTreasuryProposal = async () => {
    if (!api || !activeAccount || !papiSigner) {
      setError('API or signer not ready');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const value = BigInt(Math.floor(parseFloat(proposalForm.value) * Math.pow(10, network.tokenDecimals)));

      if (proposalForm.beneficiary.length < 47) {
        throw new Error('Please enter a valid beneficiary address');
      }

      let tx;
      
      try {
        if (api.tx.Treasury?.proposeSpend) {
          tx = api.tx.Treasury.proposeSpend({
            value,
            beneficiary: proposalForm.beneficiary
          });
        } else {
          throw new Error('Treasury proposals not available on this network');
        }
      } catch (formatError) {
        throw new Error('Treasury proposals not supported on this network');
      }

      console.log('Submitting treasury proposal...');
      const result = await tx.signAndSubmit(papiSigner);
      
      setResult({
        type: 'proposal',
        txHash: result?.toString() || 'Success',
        message: \`Submitted treasury proposal for \${proposalForm.value} ${network.tokenSymbol}\`
      });
      
      setProposalForm({ value: '100', beneficiary: '${this.getTestAccount("bob")}', description: 'Test treasury proposal' });

    } catch (err) {
      console.error('Treasury proposal failed:', err);
      setError(\`Treasury proposal failed: \${err.message}\`);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setError('');
      if (!availableWallets?.length) {
        throw new Error('No wallet found. Please install a Polkadot wallet.');
      }
      await connect(availableWallets[0].id);
    } catch (err) {
      setError(err.message);
    }
  };

  // Styles
  const containerStyle = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #E6007A, #C8017B)',
    color: 'white',
    padding: '24px',
    textAlign: 'center'
  };

  const tabStyle = (active) => ({
    padding: '12px 24px',
    border: 'none',
    backgroundColor: active ? '#E6007A' : 'transparent',
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
    fontSize: '14px',
    backgroundColor: '#fff',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    backgroundColor: '#E6007A',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s ease',
    width: '100%'
  };

  if (!isConnected) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '28px' }}>🏛️ ${network.name} Governance</h2>
          <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
            Participate in on-chain governance
          </p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗳️</div>
          <h3>Connect Wallet to Participate</h3>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Connect your wallet to vote, delegate, and propose
          </p>
          <button onClick={handleConnect} style={buttonStyle}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: '28px' }}>🏛️ ${network.name} Governance</h2>
        <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
          Connected: {activeAccount?.name || \`\${activeAccount?.address.slice(0, 8)}...\`}
        </p>
      </div>

      {/* Status */}
      <div style={{ padding: '20px' }}>
        <div style={{
          padding: '12px',
          backgroundColor: api && papiSigner ? '#e8f5e8' : '#fff3e0',
          borderRadius: '8px',
          border: \`1px solid \${api && papiSigner ? '#4caf50' : '#ff9800'}\`,
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {api && papiSigner ? '✅ Ready for governance operations' : '⏳ Initializing...'}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ padding: '0 20px', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {['referenda', 'voting', 'delegation', 'treasury'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={tabStyle(activeTab === tab)}
            >
              {tab === 'referenda' && '📋 Referenda'}
              {tab === 'voting' && '🗳️ Vote'}
              {tab === 'delegation' && '🤝 Delegate'}
              {tab === 'treasury' && '💰 Treasury'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Referenda Tab */}
        {activeTab === 'referenda' && (
          <div>
            <h3 style={{ marginBottom: '24px', color: '#E6007A' }}>📋 Active Referenda</h3>
            
            {referenda.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {referenda.map((ref, index) => (
                  <div key={index} style={{
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                          Referendum #{ref.id?.toString() || index}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          Status: {ref.status}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {ref.proposal}
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        backgroundColor: ref.status === 'Active' ? '#4caf50' : '#ff9800',
                        color: 'white',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {ref.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <p>No active referenda found</p>
              </div>
            )}
          </div>
        )}

        {/* Voting Tab */}
        {activeTab === 'voting' && (
          <div>
            <h3 style={{ marginBottom: '24px', color: '#E6007A' }}>🗳️ Vote on Referendum</h3>
            <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Referendum ID:
                </label>
                <input
                  type="text"
                  value={voteForm.referendumId}
                  onChange={(e) => setVoteForm({...voteForm, referendumId: e.target.value})}
                  style={inputStyle}
                  placeholder="Enter referendum ID (e.g., 0)"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Vote:
                </label>
                <select
                  value={voteForm.vote}
                  onChange={(e) => setVoteForm({...voteForm, vote: e.target.value})}
                  style={inputStyle}
                >
                  <option value="aye">Aye (Support)</option>
                  <option value="nay">Nay (Against)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Amount ({network.tokenSymbol}):
                </label>
                <input
                  type="text"
                  value={voteForm.amount}
                  onChange={(e) => setVoteForm({...voteForm, amount: e.target.value})}
                  style={inputStyle}
                  placeholder="Amount to vote with"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Conviction:
                </label>
                <select
                  value={voteForm.conviction}
                  onChange={(e) => setVoteForm({...voteForm, conviction: e.target.value})}
                  style={inputStyle}
                >
                  <option value="0">0.1x (No lock)</option>
                  <option value="1">1x (1 day lock)</option>
                  <option value="2">2x (2 day lock)</option>
                  <option value="3">3x (4 day lock)</option>
                  <option value="4">4x (8 day lock)</option>
                  <option value="5">5x (16 day lock)</option>
                  <option value="6">6x (32 day lock)</option>
                </select>
              </div>

              <button 
                onClick={handleVote} 
                style={buttonStyle} 
                disabled={loading || !api || !papiSigner}
              >
                {loading ? '⏳ Submitting Vote...' : '🗳️ Submit Vote'}
              </button>
            </div>
          </div>
        )}

        {/* Delegation Tab */}
        {activeTab === 'delegation' && (
          <div>
            <h3 style={{ marginBottom: '24px', color: '#E6007A' }}>🤝 Delegate Voting Power</h3>
            <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Delegate To:
                </label>
                <input
                  type="text"
                  value={delegateForm.target}
                  onChange={(e) => setDelegateForm({...delegateForm, target: e.target.value})}
                  style={inputStyle}
                  placeholder="Address to delegate to"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Amount ({network.tokenSymbol}):
                </label>
                <input
                  type="text"
                  value={delegateForm.amount}
                  onChange={(e) => setDelegateForm({...delegateForm, amount: e.target.value})}
                  style={inputStyle}
                  placeholder="Amount to delegate"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Conviction:
                </label>
                <select
                  value={delegateForm.conviction}
                  onChange={(e) => setDelegateForm({...delegateForm, conviction: e.target.value})}
                  style={inputStyle}
                >
                  <option value="0">0.1x (No lock)</option>
                  <option value="1">1x (1 day lock)</option>
                  <option value="2">2x (2 day lock)</option>
                  <option value="3">3x (4 day lock)</option>
                  <option value="4">4x (8 day lock)</option>
                  <option value="5">5x (16 day lock)</option>
                  <option value="6">6x (32 day lock)</option>
                </select>
              </div>

              <button 
                onClick={handleDelegate} 
                style={buttonStyle} 
                disabled={loading || !api || !papiSigner}
              >
                {loading ? '⏳ Delegating...' : '🤝 Delegate Votes'}
              </button>
            </div>
          </div>
        )}

        {/* Treasury Tab */}
        {activeTab === 'treasury' && (
          <div>
            <h3 style={{ marginBottom: '24px', color: '#E6007A' }}>💰 Treasury Proposals</h3>
            
            {/* Active Proposals */}
            {treasuryProposals.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ marginBottom: '16px' }}>Active Proposals</h4>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {treasuryProposals.map((proposal, index) => (
                    <div key={index} style={{
                      padding: '16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                        Proposal #{proposal.id?.toString() || index}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Value: {(Number(proposal.value) / Math.pow(10, network.tokenDecimals)).toFixed(2)} ${network.tokenSymbol}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Beneficiary: {proposal.beneficiary?.slice?.(0, 12) || 'Unknown'}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit New Proposal */}
            <div>
              <h4 style={{ marginBottom: '16px' }}>Submit New Proposal</h4>
              <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Value ({network.tokenSymbol}):
                  </label>
                  <input
                    type="text"
                    value={proposalForm.value}
                    onChange={(e) => setProposalForm({...proposalForm, value: e.target.value})}
                    style={inputStyle}
                    placeholder="Requested amount"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Beneficiary:
                  </label>
                  <input
                    type="text"
                    value={proposalForm.beneficiary}
                    onChange={(e) => setProposalForm({...proposalForm, beneficiary: e.target.value})}
                    style={inputStyle}
                    placeholder="Beneficiary address"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Description:
                  </label>
                  <textarea
                    value={proposalForm.description}
                    onChange={(e) => setProposalForm({...proposalForm, description: e.target.value})}
                    style={{...inputStyle, height: '80px', resize: 'vertical'}}
                    placeholder="Proposal description"
                  />
                </div>

                <button 
                  onClick={handleTreasuryProposal} 
                  style={buttonStyle} 
                  disabled={loading || !api || !papiSigner}
                >
                  {loading ? '⏳ Submitting...' : '💰 Submit Proposal'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: '#e8f5e8',
            borderRadius: '12px',
            border: '1px solid #4caf50'
          }}>
            <h4 style={{ margin: '0 0 12px', color: '#2e7d32' }}>✅ Success</h4>
            <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
              TX: {result.txHash}
            </div>
            <a
              href={\`\${network.explorer}/extrinsic/\${result.txHash}\`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#1976d2',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '8px',
                display: 'inline-block'
              }}
            >
              View in Explorer →
            </a>
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

        {/* Info Box */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#f0f8ff',
          borderRadius: '12px',
          borderLeft: '4px solid #2196f3',
          fontSize: '14px'
        }}>
          <h4 style={{ margin: '0 0 12px', color: '#1976d2' }}>💡 Governance Info</h4>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Voting:</strong> Use your tokens to vote on referenda with conviction multipliers
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Delegation:</strong> Delegate your voting power to trusted community members
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Treasury:</strong> Propose funding for projects that benefit the ecosystem
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Conviction:</strong> Higher conviction = more voting power but longer token lock
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}`;
  }

  private getImports(network: Network): string {
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

  private getTestAccount(name: string): string {
    const accounts = {
      alice: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      bob: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      charlie: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y'
    };
    return accounts[name as keyof typeof accounts] || accounts.alice;
  }
}