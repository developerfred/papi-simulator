import { Network } from '../types/network';

export type SimulationGenerator = (network: Network) => string;

function generateRandomHash(length = 32): string {
  const bytes = new Uint8Array(length);
  if (typeof window !== 'undefined') {
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  return Array(length * 2).fill(0).map(() =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export const SIMULATION_OUTPUTS: Record<string, SimulationGenerator> = {

  'simple-transfer': (network) => `Encoded transaction: 0x0400ff8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48e5c0fd77568d694a67dbf7711ef56ae5a9f95cd47c4ed95369791ba28f48c10f6fba3cb5211000004000000

To execute this transfer on ${network.name}:
1. Get testnet tokens from ${network.faucet}
2. Use a wallet like Polkadot.js extension to sign and submit
3. View results in the explorer: ${network.explorer}`,


  'query-balance': (network) => `Account Info: {
  providers: 1n,
  sufficients: 0n,
  consumers: 0n,
  data: {
    free: 1223523269650000n,
    reserved: 0n,
    frozen: 0n
  }
}
Free Balance: 1223523269650000
Reserved Balance: 0
Total Balance: 1223523269650000
Human readable balance: 1223.5233 ${network.tokenSymbol}`,

  // Watch blocks example
  'watch-blocks': (network) => {
    const timestamp = new Date().toISOString();
    const blockNumber = 19043122 + Math.floor(Math.random() * 100);
    const blockHash = generateRandomHash();
    const parentHash = generateRandomHash();

    return `Starting to watch finalized blocks on ${network.name}...
Will unsubscribe after 30 seconds (in a real app, manage subscription lifecycle)
Finalized Block: {
  number: ${blockNumber},
  hash: "${blockHash}",
  parentHash: "${parentHash}",
  timestamp: "${timestamp}"
}
Block explorer link: ${network.explorer}/block/${blockNumber}
Finalized Block: {
  number: ${blockNumber + 1},
  hash: "${generateRandomHash()}",
  parentHash: "${blockHash}",
  timestamp: "${new Date(Date.now() + 6000).toISOString()}"
}
Block explorer link: ${network.explorer}/block/${blockNumber + 1}`;
  },


  'query-storage': (network) => `Runtime Version: {
  specName: "${network.id}",
  implName: "parity-${network.id}",
  authoringVersion: 1,
  specVersion: 9430,
  implVersion: 0,
  apis: [
    ["0xdf6acb689907609b", 4],
    ["0x37e397fc7c91f5e4", 1],
    // ... more APIs ...
  ],
  transactionVersion: 21,
  stateVersion: 0
}`,


  'chain-properties': (network) => `Chain Properties: {
  ss58Format: ${network.id === 'polkadot' ? '0' : network.id === 'kusama' ? '2' : '42'},
  tokenDecimals: [${network.tokenDecimals}],
  tokenSymbol: ["${network.tokenSymbol}"]
}`,


  'extrinsic-lifecycle': () => `Transaction broadcast: 0x${generateRandomHash(32)}
Transaction included in block #${19043122 + Math.floor(Math.random() * 100)}
Transaction status: Ready
Transaction status: Broadcast
Transaction status: InBlock
Transaction status: Finalized
Transaction completed successfully
Events: [
  {
    section: "system",
    method: "ExtrinsicSuccess",
    data: [{ weight: {"refTime": 123456789, "proofSize": 0}, class: "Mandatory", paysFee: "Yes" }]
  },
  {
    section: "balances",
    method: "Transfer",
    data: ["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", 1000000000000]
  }
]`
};