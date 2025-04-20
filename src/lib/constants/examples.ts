/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Example } from "../types/example";
import type { Network } from "../types/network";
import { TEST_ACCOUNTS } from "./accounts";

/**
 * Collection of code examples for the playground
 */
export const EXAMPLES: Example[] = [
	{
		id: "simple-transfer",
		name: "Simple Transfer on Testnet",
		description: "Create a basic balance transfer on a test network",
		level: "beginner",
		categories: ["transactions", "balances"],
		getCode: (
			network: Network,
		) => `// Simple transfer example on ${network.name} testnet
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
transfer().catch(console.error);`,
	},

	{
		id: "query-balance",
		name: "Query Account Balance",
		description: "Check an account's balance on testnet",
		level: "beginner",
		categories: ["queries", "balances"],
		getCode: (
			network: Network,
		) => `// Query account balance example on ${network.name}
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

checkBalance().catch(console.error);`,
	},

	{
		id: "watch-blocks",
		name: "Watch Finalized Blocks",
		description: "Subscribe to finalized blocks on testnet",
		level: "beginner",
		categories: ["subscriptions", "blocks"],
		getCode: (
			network: Network,
		) => `// Watch finalized blocks on ${network.name} testnet
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

watchFinalizedBlocks();`,
	},

	{
		id: "test-component",
		name: "Test Live Preview",
		description: "Componente teste para validar a renderização em tempo real",
		level: "beginner",
		categories: ["test"],
		getCode: (network: Network) => `
function TestComponent() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
      <h2>Test Component</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}
`,
	},
	{
		id: "network-dashboard",
		name: "Network Dashboard Component",
		description: "Interactive dashboard showing network information",
		level: "intermediate",
		categories: ["components", "react", "network"],
		getCode: (network: Network) => `
// Network Dashboard Component
// Este componente demonstra como criar uma visualização interativa
// das informações da rede Polkadot/Substrate

export default function NetworkDashboard() {
  // Use React hooks para estado local
  const [activeTab, setActiveTab] = React.useState('info');
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  
  // Acesse as informações da rede selecionada
  const network = useNetworkInfo();
  
  // Efeito para incrementar o contador de tempo
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    // Limpar o intervalo quando o componente é desmontado
    return () => clearInterval(timer);
  }, []);
  
  // Estilo para o container do dashboard
  const containerStyle = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '100%',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  };
  
  // Estilo para o cabeçalho
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
  
  // Estilo para tabs
  const tabsStyle = {
    display: 'flex',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#f9f9f9'
  };
  
  const tabStyle = (isActive) => ({
    padding: '12px 20px',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? network.id === 'polkadot' ? '#E6007A' : 
                      network.id === 'westend' ? '#46DDD2' : 
                      network.id === 'paseo' ? '#FF7B00' : 
                      network.id === 'rococo' ? '#7D42BC' : '#8E2FD0' : '#666',
    cursor: 'pointer',
    borderBottom: isActive ? \`2px solid \${network.id === 'polkadot' ? '#E6007A' : 
                                            network.id === 'westend' ? '#46DDD2' : 
                                            network.id === 'paseo' ? '#FF7B00' : 
                                            network.id === 'rococo' ? '#7D42BC' : '#8E2FD0'}\` : 'none',
    backgroundColor: isActive ? 'white' : 'transparent'
  });
  
  // Estilo para o conteúdo
  const contentStyle = {
    padding: '20px'
  };
  
  // Estilo para cards
  const cardStyle = {
    padding: '15px',
    marginBottom: '15px',
    border: '1px solid #eee',
    borderRadius: '6px',
    backgroundColor: '#fafafa'
  };
  
  // Renderizar diferentes conteúdos com base na tab selecionada
  const renderContent = () => {
    switch(activeTab) {
      case 'info':
        return (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Network Details</h3>
              <InfoRow label="Nome" value={network.name} />
              <InfoRow label="ID" value={network.id} />
              <InfoRow label="Token" value={network.tokenSymbol} />
              <InfoRow label="Decimais" value={network.tokenDecimals.toString()} />
              <InfoRow label="Testnet" value={network.isTest ? 'Sim' : 'Não'} />
            </div>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Endpoint</h3>
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px',
                wordBreak: 'break-all'
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
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Links Úteis</h3>
              <LinkRow label="Explorador" value={network.explorer} />
              <LinkRow label="Faucet" value={network.faucet} />
              <LinkRow label="Documentação" value="https://papi.how" />
              <LinkRow label="Polkadot.js Apps" value={\`https://polkadot.js.org/apps/?rpc=\${encodeURIComponent(network.endpoint)}\`} />
            </div>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Conversor de Tokens</h3>
              <TokenCalculator network={network} />
            </div>
          </div>
        );
        
      case 'status':
        return (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Status da Conexão</h3>
              <StatusIndicator active={true} />
              <div style={{ marginTop: '10px' }}>
                Sessão ativa há {formatTime(timeElapsed)}
              </div>
            </div>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px', color: '#333' }}>Estatísticas</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <StatCard label="Tempo Médio de Bloco" value="6s" />
                <StatCard label="Finalidade" value="2 blocos" />
                <StatCard label="Resposta API" value="~200ms" />
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Selecione uma tab</div>;
    }
  };
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>
            {network.name} Dashboard
          </h2>
          <div style={{ opacity: 0.8, fontSize: '14px', marginTop: '4px' }}>
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
          Informações
        </div>
        <div 
          style={tabStyle(activeTab === 'tools')} 
          onClick={() => setActiveTab('tools')}
        >
          Ferramentas
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

// Componentes auxiliares

function InfoRow({ label, value }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '8px 0',
      borderBottom: '1px solid #eee' 
    }}>
      <span style={{ color: '#666' }}>{label}:</span>
      <span style={{ fontWeight: '500' }}>{value}</span>
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
        setDisplayValue('Valor inválido');
        return;
      }
      
      const planckValue = value * Math.pow(10, network.tokenDecimals);
      setDisplayValue(planckValue.toLocaleString() + ' Planck');
    } catch (e) {
      setDisplayValue('Erro na conversão');
    }
  }, [amount, network.tokenDecimals]);
  
  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
          Valor em {network.tokenSymbol}:
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
            fontSize: '14px'
          }}
          placeholder={\`Ex: 1.5 \${network.tokenSymbol}\`}
        />
      </div>
      
      <div>
        <div style={{ color: '#666', marginBottom: '5px' }}>Unidades menores:</div>
        <div style={{ 
          padding: '8px', 
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          {displayValue || '0 Planck'}
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: active ? '#4caf50' : '#f44336',
        marginRight: '8px'
      }} />
      <span>{active ? 'Conectado' : 'Desconectado'}</span>
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
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}

function NetworkLogo({ network }) {
  // Simulação simples de logos das redes
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: color
      }} />
    </div>
  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return \`\${mins}m \${secs}s\`;
}
`,
	},
];

/**
 * Find an example by its ID
 */
export function findExampleById(id: string): Example | undefined {
	return EXAMPLES.find((example) => example.id === id);
}

/**
 * Filter examples by category
 */
export function getExamplesByCategory(category: string): Example[] {
	return EXAMPLES.filter((example) => example.categories.includes(category));
}

/**
 * Filter examples by difficulty level
 */
export function getExamplesByLevel(level: Example["level"]): Example[] {
	return EXAMPLES.filter((example) => example.level === level);
}

/**
 * Default example to show when the playground loads
 */
export const DEFAULT_EXAMPLE =
	EXAMPLES.find((e) => e.id === "test-component") || EXAMPLES[0];
