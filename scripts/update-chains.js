#!/usr/bin/env node

/**
 * Script to update blockchain descriptors for all supported Polkadot chains
 * This can be run locally with: node scripts/update-chains.js
 * Or with a specific chain: node scripts/update-chains.js kusama
 *
 * Updated: June 2025 - Refined to prioritize PAPI's well-known names
 * for supported chains, with RPC fallback for all other chains.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// =============================================================================
// CENTRALIZED CHAIN CONFIGURATION
// =============================================================================
// Each object contains:
// - id: The unique identifier for the chain (used for command-line selection).
// - descriptor: The key used by 'papi' to name the metadata file.
// - wellknownName: The official 'well-known name' for chains directly supported by PAPI's '-n' flag.
// - rpcs: An array of WebSocket RPC endpoints, ordered by priority, used as a fallback or for non-supported chains.
// =============================================================================

const CHAINS_CONFIG = [
  // --- Chains with Native PAPI Support (Well-Known Names) ---
  { id: 'polkadot', descriptor: 'dot', wellknownName: 'polkadot', rpcs: ['wss://polkadot-rpc.dwellir.com', 'wss://rpc.dotters.network/polkadot'] },
  { id: 'polkadot_asset_hub', descriptor: 'assethub', wellknownName: 'statemint', rpcs: ['wss://statemint-rpc.dwellir.com', 'wss://polkadot-asset-hub.api.onfinality.io/public-ws'] },
  { id: 'polkadot_bridge_hub', descriptor: 'bridgehub', wellknownName: 'bridge_hub_polkadot', rpcs: ['wss://polkadot-bridge-hub-rpc.dwellir.com'] },
  { id: 'polkadot_collectives', descriptor: 'collectives', wellknownName: 'collectives_polkadot', rpcs: ['wss://polkadot-collectives-rpc.dwellir.com'] },
  { id: 'polkadot_coretime', descriptor: 'coretime', wellknownName: 'coretime_polkadot', rpcs: ['wss://polkadot-coretime-rpc.dwellir.com'] },
  { id: 'polkadot_people', descriptor: 'people', wellknownName: 'people_polkadot', rpcs: ['wss://polkadot-people-rpc.dwellir.com'] },
  { id: 'kusama', descriptor: 'ksm', wellknownName: 'kusama', rpcs: ['wss://kusama-rpc.dwellir.com', 'wss://kusama.api.onfinality.io/public-ws'] },
  { id: 'kusama_asset_hub', descriptor: 'ksmassethub', wellknownName: 'statemine', rpcs: ['wss://kusama-asset-hub-rpc.polkadot.io'] },
  { id: 'kusama_bridge_hub', descriptor: 'ksmbridgehub', wellknownName: 'bridge_hub_kusama', rpcs: ['wss://kusama-bridge-hub-rpc.dwellir.com'] },
  { id: 'kusama_people', descriptor: 'ksmpeople', wellknownName: 'people_kusama', rpcs: ['wss://kusama-people-rpc.polkadot.io'] },
  { id: 'kusama_encointer', descriptor: 'encointer', wellknownName: 'encointer_kusama', rpcs: ['wss://kusama.api.onfinality.io/public-ws'] },
  { id: 'westend', descriptor: 'wnd', wellknownName: 'westend', rpcs: ['wss://westend-rpc.dwellir.com', 'wss://westend.api.onfinality.io/public-ws'] },
  { id: 'westend_asset_hub', descriptor: 'westendassethub', wellknownName: 'asset_hub_westend', rpcs: ['wss://westend-asset-hub-rpc.polkadot.io'] },
  { id: 'westend_bridge_hub', descriptor: 'westendbridgehub', wellknownName: 'bridge_hub_westend', rpcs: ['wss://westend-bridge-hub-rpc.polkadot.io'] },
  { id: 'westend_collectives', descriptor: 'westendcollectives', wellknownName: 'collectives_westend', rpcs: ['wss://westend-collectives-rpc.polkadot.io'] },
  { id: 'paseo', descriptor: 'paseo', wellknownName: 'paseo', rpcs: ['wss://pas-rpc.stakeworld.io', 'wss://paseo.dotters.network'] },
  
  // --- Other Ecosystem Chains (updated via RPC endpoint) ---
  { id: 'paseo_asset_hub', descriptor: 'paseoassethub', rpcs: ['wss://asset-hub-paseo-rpc.dwellir.com', 'wss://asset-hub-paseo.dotters.network', 'wss://sys.turboflakes.io/asset-hub-paseo'] },
  { id: 'paseo_bridge_hub', descriptor: 'paseobridgehub', rpcs: ['wss://bridge-hub-paseo.dotters.network'] },
  { id: 'paseo_coretime', descriptor: 'paseocoretime', rpcs: ['wss://coretime-paseo.dotters.network', 'wss://paseo-coretime.paranodes.io'] },
  { id: 'paseo_people', descriptor: 'paseopeople', rpcs: ['wss://people-paseo.dotters.network', 'wss://people-paseo.rpc.amforc.com'] },
  { id: 'ajuna_paseo', descriptor: 'ajunapaseo', rpcs: ['wss://rpc-paseo.ajuna.network'] },
  { id: 'amplitude_paseo', descriptor: 'amplitudepaseo', rpcs: ['wss://rpc-foucoco.pendulumchain.tech'] },
  { id: 'aventus_paseo', descriptor: 'aventuspaseo', rpcs: ['wss://public-rpc.testnet.aventus.network'] },
  { id: 'bifrost_paseo', descriptor: 'bifrostpaseo', rpcs: ['wss://bifrost-rpc.paseo.liebi.com/ws'] },
  { id: 'darwinia_koi', descriptor: 'darwiniakoi', rpcs: ['wss://koi-rpc.darwinia.network'] },
  { id: 'frequency_paseo', descriptor: 'frequencypaseo', rpcs: ['wss://0.rpc.testnet.amplica.io'] },
  { id: 'hyperbridge_paseo', descriptor: 'hyperbridgepaseo', rpcs: ['wss://hyperbridge-paseo-rpc.blockops.network'] },
  { id: 'integritee_paseo', descriptor: 'integriteepaseo', rpcs: ['wss://paseo.api.integritee.network'] },
  { id: 'kilt_peregrine', descriptor: 'kiltperegrine', rpcs: ['wss://peregrine.kilt.io/parachain-public-ws/'] },
  { id: 'laos_sigma', descriptor: 'laossigma', rpcs: ['wss://rpc.laossigma.laosfoundation.io'] },
  { id: 'muse_paseo', descriptor: 'musepaseo', rpcs: ['wss://paseo-muse-rpc.polkadot.io'] },
  { id: 'myriad_paseo', descriptor: 'myriadpaseo', rpcs: ['wss://ws-rpc.paseo.myriad.social'] },
  { id: 'niskala_paseo', descriptor: 'niskalapaseo', rpcs: ['wss://mlg2.mandalachain.io', 'wss://mlg1.mandalachain.io'] },
  { id: 'nodle_paradis', descriptor: 'nodleparadis', rpcs: ['wss://node-6957502816543653888.lh.onfinality.io/ws?apikey=09b04494-3139-4b57-a5d1-e1c4c18748ce'] },
  { id: 'pop_network_paseo', descriptor: 'popnetworkpaseo', rpcs: ['wss://rpc1.paseo.popnetwork.xyz', 'wss://rpc2.paseo.popnetwork.xyz'] },
  { id: 'xcavate_paseo', descriptor: 'xcavatepaseo', rpcs: ['wss://rpc-paseo.xcavate.io:443'] },
  { id: 'zeitgeist_batterystation', descriptor: 'zeitgeistbatterystation', rpcs: ['wss://bsr.zeitgeist.pm'] },
];



const metadataDir = path.join('.papi', 'metadata');
if (!fs.existsSync(metadataDir)) {
  console.log('Creating metadata directory...');
  fs.mkdirSync(metadataDir, { recursive: true });
}

const ALL_CHAIN_IDS = CHAINS_CONFIG.map(c => c.id);
const specificChains = process.argv.slice(2);

const chainsToUpdate = specificChains.length > 0
  ? CHAINS_CONFIG.filter(c => specificChains.includes(c.id))
  : CHAINS_CONFIG;

if (specificChains.length > 0 && chainsToUpdate.length === 0) {
  console.error('No valid chains specified. Supported chains:');
  console.error(ALL_CHAIN_IDS.join(', '));
  process.exit(1);
}

console.log(`Updating ${ chainsToUpdate.length } chains: ${ chainsToUpdate.map(c => c.id).join(', ') } `);
console.log('This may take some time...');

const results = {
  success: [],
  failed: []
};

for (const chainConfig of chainsToUpdate) {
  const { id, descriptor, rpcs = [], wellknownName } = chainConfig;
  console.log(`\n-- - Updating chain: ${ id } (descriptor: ${ descriptor }) --- `);
  let success = false;
  
  if (wellknownName) {
    console.log(`Attempting with PAPI's well-known name: '${ wellknownName } '`);
const command = `npx papi add ${descriptor} -n ${wellknownName} --skip-codegen`;
try {
  execSync(command, { stdio: 'inherit', timeout: 5 * 60 * 1000 });
  success = true;
  console.log(`Successfully updated ${id} using well-known name.`);
} catch (error) {
  console.log(`Well-known name approach failed for ${id}. Trying RPC fallback...`);
}
  }

if (!success) {
  if (rpcs.length === 0) {
    console.log('No RPC endpoints configured for this chain.');
  } else {
    console.log('Attempting update via RPC endpoint(s)...');
  }

  for (const endpoint of rpcs) {
    if (success) break;
    console.log(`> Trying endpoint: ${endpoint}`);
    const command = `npx papi add ${descriptor} -w ${endpoint} --skip-codegen`;
    try {
      execSync(command, { stdio: 'inherit', timeout: 5 * 60 * 1000 });
      success = true;
      console.log(`Successfully updated ${id} using endpoint: ${endpoint}`);
    } catch (error) {      
      console.log(`-> Endpoint failed: ${error.message.split('\n')[0]}`);
    }
  }
}

if (success) {
  results.success.push({ chain: id, descriptor });
} else {
  results.failed.push({ chain: id, error: 'All update approaches failed' });
  console.error(`❌ Failed to update ${id}: All update approaches failed.`);
}
}

console.log('\n=== UPDATE SUMMARY ===');
console.log(`Total chains processed: ${chainsToUpdate.length}`);
console.log(`✅ Successful: ${results.success.length}`);
console.log(`❌ Failed: ${results.failed.length}`);

if (results.failed.length > 0) {
  console.log('\n--- Failed chains ---');
  results.failed.forEach(({ chain, error }) => {
    console.log(`- ${chain}: ${error}`);
  });
}

if (results.success.length > 0) {
  console.log('\n--- Successful chains ---');
  results.success.forEach(({ chain, descriptor }) => {
    console.log(`- ${chain} (saved as ${descriptor}.json)`);
  });
}
