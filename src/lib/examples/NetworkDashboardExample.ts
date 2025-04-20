import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class NetworkDashboardExample extends ExampleFactory {
	constructor() {
		super({
			id: "network-dashboard",
			name: "Network Dashboard Component",
			description: "Interactive dashboard showing network information",
			level: "intermediate",
			categories: ["components", "react", "network"],
		});
	}

	generateCode(network: Network): string {
		return `// Network Dashboard Component
import React, { useState, useEffect } from 'react';

// Mock network info hook for preview
const useNetworkInfo = () => {
  return {
    id: '${network.id}',
    name: '${network.name}',
    tokenSymbol: '${network.tokenSymbol}',
    tokenDecimals: ${network.tokenDecimals},
    isTest: ${network.isTest},
    endpoint: '${network.endpoint}',
    explorer: '${network.explorer}',
    faucet: '${network.faucet}'
  };
};

export default function NetworkDashboard() {
  // Use React hooks for local state
  const [activeTab, setActiveTab] = useState('info');
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Access the selected network information
  const network = useNetworkInfo();
  
  // Effect to increment time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    // Clear interval when component is unmounted
    return () => clearInterval(timer);
  }, []);
  
  // Style for the dashboard container with dark mode support
  const containerStyle = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '100%',
    margin: '0 auto',
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  };
  
  // Style for the header
  const headerStyle = {
    backgroundColor: network.id === 'polkadot' ? '#E6007A' : 
                    network.id === 'westend' ? '#46DDD2' : 
                    network.id === 'paseo' ? '#FF7B00' : 
                    network.id === 'rococo' ? '#7D42BC' : '#8E2FD0',
    color: 'white',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };
  
  // Style for tabs
  const tabsStyle = {
    display: 'flex',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: 'rgb(243, 231, 231)'
  };
  
  const tabStyle = (isActive) => ({
    padding: '12px 20px',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? 
      (network.id === 'polkadot' ? '#E6007A' : 
       network.id === 'westend' ? '#46DDD2' : 
       network.id === 'paseo' ? '#FF7B00' : 
       network.id === 'rococo' ? '#7D42BC' : '#8E2FD0') 
      : '#666',
    cursor: 'pointer',
    borderBottom: isActive ? 
      \`2px solid \${
        network.id === 'polkadot' ? '#E6007A' : 
        network.id === 'westend' ? '#46DDD2' : 
        network.id === 'paseo' ? '#FF7B00' : 
        network.id === 'rococo' ? '#7D42BC' : '#8E2FD0'
      }\` 
      : 'none',
    backgroundColor: isActive ? 'white' : 'transparent'
  });
  
  // Style for content
  const contentStyle = {
    padding: '20px',
    backgroundColor: 'white',
    color: '#000'
  };
  
  // Style for cards
  const cardStyle = {
    padding: '15px',
    marginBottom: '15px',
    border: '1px solid #eee',
    borderRadius: '6px',
    backgroundColor: 'rgb(243, 231, 231)'
  };
  
  // Render different content based on selected tab
  const renderContent = () => {
    switch(activeTab) {
      case 'info':
        return (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Network Details</h3>
              <InfoRow label="Name" value={network.name} />
              <InfoRow label="ID" value={network.id} />
              <InfoRow label="Token" value={network.tokenSymbol} />
              <InfoRow label="Decimals" value={network.tokenDecimals.toString()} />
              <InfoRow label="Testnet" value={network.isTest ? 'Yes' : 'No'} />
            </div>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Endpoint</h3>
              <div style={{ 
                padding: '10px', 
                backgroundColor: 'rgb(243, 231, 231)',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px',
                wordBreak: 'break-all',
                color: '#333'
              }}>
                {network.endpoint}
              </div>
            </div>
          </div>
        );
        
      case 'tools':
        return (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Useful Links</h3>
              <LinkRow label="Explorer" value={network.explorer} />
              <LinkRow label="Faucet" value={network.faucet} />
              <LinkRow label="Documentation" value="https://papi.how" />
              <LinkRow 
                label="Polkadot.js Apps" 
                value={\`https://polkadot.js.org/apps/?rpc=\${encodeURIComponent(network.endpoint)}\`} 
              />
            </div>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Token Converter</h3>
              <TokenCalculator network={network} />
            </div>
          </div>
        );
        
      case 'status':
        return (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Connection Status</h3>
              <StatusIndicator active={true} />
              <div style={{ 
                marginTop: '10px',
                color: '#000'
              }}>
                Active session for {formatTime(timeElapsed)}
              </div>
            </div>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Statistics</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <StatCard label="Average Block Time" value="6s" />
                <StatCard label="Finality" value="2 blocks" />
                <StatCard label="API Response" value="~200ms" />
              </div>
            </div>
          </div>
        );
        
      default:
        return <div style={{ color: '#000' }}>Select a tab</div>;
    }
  };
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'white' }}>
            {network.name} Dashboard
          </h2>
          <div style={{ opacity: 0.8, fontSize: '14px', marginTop: '4px', color: 'white' }}>
            Polkadot API Playground
          </div>
        </div>
        <NetworkLogo network={network} />
      </div>
      
      <div style={tabsStyle}>
        <div 
          style={tabStyle(activeTab === 'info')} 
          onClick={() => setActiveTab('info')}
        >
          Information
        </div>
        <div 
          style={tabStyle(activeTab === 'tools')} 
          onClick={() => setActiveTab('tools')}
        >
          Tools
        </div>
        <div 
          style={tabStyle(activeTab === 'status')} 
          onClick={() => setActiveTab('status')}
        >
          Status
        </div>
      </div>
      
      <div style={contentStyle}>
        {renderContent()}
      </div>
    </div>
  );
}

// Helper Components

function InfoRow({ label, value }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '8px 0',
      borderBottom: '1px solid #eee' 
    }}>
      <span style={{ color: '#666' }}>{label}:</span>
      <span style={{ 
        fontWeight: '500',
        color: '#000'
      }}>{value}</span>
    </div>
  );
}

function LinkRow({ label, value }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '8px 0',
      borderBottom: '1px solid #eee',
      alignItems: 'center'
    }}>
      <span style={{ color: '#666' }}>{label}:</span>
      <a 
        href={value} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          color: '#8E2FD0', 
          textDecoration: 'none',
          fontSize: '14px',
          maxWidth: '240px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {value.replace(/^https?:\\/\\//, '')}
      </a>
    </div>
  );
}

function TokenCalculator({ network }) {
  const [amount, setAmount] = React.useState('1');
  const [displayValue, setDisplayValue] = React.useState('');
  
  React.useEffect(() => {
    if (!amount) {
      setDisplayValue('');
      return;
    }
    
    try {
      const value = parseFloat(amount);
      if (isNaN(value)) {
        setDisplayValue('Invalid value');
        return;
      }
      
      const planckValue = value * Math.pow(10, network.tokenDecimals);
      setDisplayValue(planckValue.toLocaleString() + ' Planck');
    } catch (e) {
      setDisplayValue('Conversion error');
    }
  }, [amount, network.tokenDecimals]);
  
  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '5px', 
          color: '#666'
        }}>
          Value in {network.tokenSymbol}:
        </label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white',
            color: '#000'
          }}
          placeholder={\`Ex: 1.5 \${network.tokenSymbol}\`}
        />
      </div>
      
      <div>
        <div style={{ color: '#666', marginBottom: '5px' }}>Smaller units:</div>
        <div style={{ 
          padding: '8px', 
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          fontFamily: 'monospace',
          color: '#000'
        }}>
          {displayValue || '0 Planck'}
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ active }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      color: '#000'
    }}>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: active ? '#4caf50' : '#f44336',
        marginRight: '8px'
      }} />
      <span>{active ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#f0f0f0',
      borderRadius: '6px',
      textAlign: 'center',
      width: '30%'
    }}>
      <div style={{ 
        fontSize: '12px', 
        color: '#666', 
        marginBottom: '5px' 
      }}>{label}</div>
      <div style={{ 
        fontSize: '16px', 
        fontWeight: 'bold',
        color: '#000'
      }}>{value}</div>
    </div>
  );
}

function NetworkLogo({ network }) { 
  const colors = {
    polkadot: '#E6007A',
    westend: '#46DDD2',
    paseo: '#FF7B00',
    rococo: '#7D42BC',
    default: '#8E2FD0'
  };
  
  const color = colors[network.id] || colors.default;
  
  return (
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'white',
      color: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: color,
        color: '#000',
      }} />
    </div>
  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return \`\${mins}m \${secs}s\`;
}
`;
	}
}
