#!/usr/bin/env node

/**
 * Script to update blockchain descriptors for all supported Polkadot chains
 * 
 * This can be run locally with: node scripts/update-chains.js
 * Or with a specific chain: node scripts/update-chains.js polkadot
 * 
 * Updated: May 2025 - Added support for all active parachains
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// All supported chains - updated list based on current parachains
const ALL_CHAINS = [
  // Relay chains
  'polkadot',
  'ksmcc3',
  'westend2',
  'rococo_v2_2',
  'paseo',

  // System Parachains
  'polkadot_asset_hub',
  'ksmcc3_asset_hub',
  'westend_asset_hub',
  'rococo_asset_hub',
  'polkadot_bridge_hub',
  'ksmcc3_bridge_hub',
  'westend_bridge_hub',
  'rococo_bridge_hub',
  'polkadot_collectives',
  'polkadot_people',
  'ksmcc3_people',
  'westend_people',

  // Major DeFi & Smart Contract Parachains
  'acala',
  'moonbeam',
  'astar',
  'parallel_finance',
  'hydradx',
  'interlay',
  'centrifuge',
  'pendulum',
  'amplitude',
  'manta',
  'bifrost_polkadot',
  'bifrost_kusama',
  'basilisk',
  'mangata',
  'phala',
  'kylin',

  // Other Important Parachains
  'kilt',
  'litentry',
  'unique_network',
  'subsocial',
  'zeitgeist',
  'polkadex',
  'crust',
  'darwinia',
  'efinity',
  'nodle',
  'origin_trail',
  'clover',
  'equilibrium',
  'composable',

  // Kusama Parachains
  'ksmcc3_encointer',
  'calamari',
  'karura',
  'shiden',
  'moonriver',
  'turing',
  'picasso',
  'quartz',
  'kintsugi',
  'robonomics',
  'heiko',
  'crab',
  'altair',
  'genshiro'
];

// Map of chain names to their correct descriptor keys for the papi add command
const CHAIN_TO_DESCRIPTOR_MAPPING = {
  // Relay chains
  'polkadot': 'dot',
  'kusama': 'ksmcc3',
  'ksmcc3': 'ksm',
  'westend2': 'wnd',
  'rococo_v2_2': 'roc',
  'paseo': 'paseo',

  // Asset & Bridge Hubs
  'polkadot_asset_hub': 'assethub',
  'ksmcc3_asset_hub': 'ksmassethub',
  'westend_asset_hub': 'westendassethub',
  'rococo_asset_hub': 'rococoassethub',
  'polkadot_bridge_hub': 'bridgehub',
  'ksmcc3_bridge_hub': 'ksmbridgehub',
  'westend_bridge_hub': 'westendbridgehub',
  'rococo_bridge_hub': 'rococobridgehub',

  // System Parachains
  'polkadot_collectives': 'collectives',
  'polkadot_people': 'people',
  'ksmcc3_people': 'ksmpeople',
  'westend_people': 'wndpeople',

  // Major DeFi & Smart Contract Parachains
  'acala': 'acala',
  'moonbeam': 'moonbeam',
  'astar': 'astar',
  'parallel_finance': 'parallel',
  'hydradx': 'hydradx',
  'interlay': 'interlay',
  'centrifuge': 'centrifuge',
  'pendulum': 'pendulum',
  'amplitude': 'amplitude',
  'manta': 'manta',
  'bifrost_polkadot': 'bifrost',
  'bifrost_kusama': 'bifrostkusama',
  'basilisk': 'basilisk',
  'mangata': 'mangata',
  'phala': 'phala',
  'kylin': 'kylin',

  // Other Important Parachains
  'kilt': 'kilt',
  'litentry': 'litentry',
  'unique_network': 'unique',
  'subsocial': 'subsocial',
  'zeitgeist': 'zeitgeist',
  'polkadex': 'polkadex',
  'crust': 'crust',
  'darwinia': 'darwinia',
  'efinity': 'efinity',
  'nodle': 'nodle',
  'origin_trail': 'origintrail',
  'clover': 'clover',
  'equilibrium': 'equilibrium',
  'composable': 'composable',

  // Kusama Parachains
  'ksmcc3_encointer': 'encointer',
  'calamari': 'calamari',
  'karura': 'karura',
  'shiden': 'shiden',
  'moonriver': 'moonriver',
  'turing': 'turing',
  'picasso': 'picasso',
  'quartz': 'quartz',
  'kintsugi': 'kintsugi',
  'robonomics': 'robonomics',
  'heiko': 'heiko',
  'crab': 'crab',
  'altair': 'altair',
  'genshiro': 'genshiro'
};

// Known RPC endpoints for parachains
const CHAIN_RPC_ENDPOINTS = {
  // Relay Chains
  'polkadot': 'wss://rpc.polkadot.io',
  'ksmcc3': 'wss://kusama-rpc.polkadot.io',
  'westend2': 'wss://westend-rpc.polkadot.io',
  'rococo_v2_2': 'wss://rococo-rpc.polkadot.io',
  'paseo': 'wss://paseo-rpc.polkadot.io',

  // System Parachains
  'polkadot_asset_hub': 'wss://polkadot-asset-hub-rpc.polkadot.io',
  'polkadot_bridge_hub': 'wss://polkadot-bridge-hub-rpc.polkadot.io',
  'polkadot_collectives': 'wss://polkadot-collectives-rpc.polkadot.io',
  'ksmcc3_asset_hub': 'wss://kusama-asset-hub-rpc.polkadot.io',
  'ksmcc3_bridge_hub': 'wss://kusama-bridge-hub-rpc.polkadot.io',

  // Major Parachains
  'acala': 'wss://acala-rpc-0.aca-api.network',
  'moonbeam': 'wss://wss.api.moonbeam.network',
  'astar': 'wss://rpc.astar.network',
  'hydradx': 'wss://rpc.hydradx.io',
  'interlay': 'wss://api.interlay.io/parachain',
  'centrifuge': 'wss://centrifuge-parachain.api.onfinality.io/public-ws',
  'pendulum': 'wss://rpc-pendulum.prd.pendulumchain.tech',
  'amplitude': 'wss://rpc-amplitude.pendulumchain.tech',
  'parallel_finance': 'wss://parallel.api.onfinality.io/public-ws',
  'manta': 'wss://manta.public.curie.radiumblock.co/ws',
  'bifrost_polkadot': 'wss://bifrost-polkadot.api.onfinality.io/public-ws',

  // Kusama Ecosystem
  'moonriver': 'wss://wss.api.moonriver.moonbeam.network',
  'karura': 'wss://karura.api.onfinality.io/public-ws',
  'basilisk': 'wss://rpc.basilisk.cloud',
  'shiden': 'wss://shiden.api.onfinality.io/public-ws',
  'calamari': 'wss://calamari.api.onfinality.io/public-ws',
  'kintsugi': 'wss://api-kusama.interlay.io/parachain',
  'bifrost_kusama': 'wss://bifrost-kusama.api.onfinality.io/public-ws',
  'mangata': 'wss://kusama-archive.mangata.online',

  // Other parachains
  'kilt': 'wss://kilt.api.onfinality.io/public-ws',
  'unique_network': 'wss://ws.unique.network',
  'phala': 'wss://api.phala.network/ws',
  'subsocial': 'wss://para.subsocial.network'
};

// Alternative endpoints in case primary fails
const ALTERNATIVE_ENDPOINTS = {
  'acala': ['wss://acala.polkawallet.io', 'wss://acala-rpc.dwellir.com'],
  'moonbeam': ['wss://moonbeam.api.onfinality.io/public-ws', 'wss://moonbeam-rpc.dwellir.com'],
  'astar': ['wss://astar.api.onfinality.io/public-ws', 'wss://astar-rpc.dwellir.com'],
  'hydradx': ['wss://hydradx.api.onfinality.io/public-ws', 'wss://hydradx-rpc.dwellir.com']
};

// Ensure metadata directory exists
const metadataDir = path.join('.papi', 'metadata');
if (!fs.existsSync(metadataDir)) {
  console.log('Creating metadata directory...');
  fs.mkdirSync(metadataDir, { recursive: true });
}

// Determine which chains to update
const specificChain = process.argv[2];
const chainsToUpdate = specificChain ? [specificChain] : ALL_CHAINS;

console.log(`Updating ${chainsToUpdate.length} chains: ${chainsToUpdate.join(', ')}`);
console.log('This may take some time, especially for chains that need direct RPC connections...');

// Track results
const results = {
  success: [],
  failed: []
};

// Update each chain
for (const chain of chainsToUpdate) {
  try {
    // Get the correct descriptor key for this chain
    let descriptorKey = CHAIN_TO_DESCRIPTOR_MAPPING[chain] || chain.replace(/-([a-z])/g, (_, char) => char.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');

    console.log(`\nUpdating chain: ${chain} with descriptor key: ${descriptorKey}`);

    let command;
    let success = false;

    // First try: Use well-known chain names
    if (!CHAIN_RPC_ENDPOINTS[chain]) {
      console.log('Attempting to use well-known chain name...');
      command = `npx papi add ${descriptorKey} -n ${chain} --skip-codegen`;

      try {
        execSync(command, {
          stdio: 'inherit',
          timeout: 5 * 60 * 1000 // 5 minute timeout
        });
        success = true;
        console.log(`Successfully updated ${chain} using well-known name`);
      } catch (error) {
        console.log(`Well-known name approach failed: ${error.message}`);
      }
    }

    // Second try: Use primary RPC endpoint
    if (!success && CHAIN_RPC_ENDPOINTS[chain]) {
      console.log(`Attempting with primary WebSocket endpoint: ${CHAIN_RPC_ENDPOINTS[chain]}`);
      command = `npx papi add ${descriptorKey} -n ${chain} -w ${CHAIN_RPC_ENDPOINTS[chain]} --skip-codegen`;

      try {
        execSync(command, {
          stdio: 'inherit',
          timeout: 5 * 60 * 1000 // 5 minute timeout
        });
        success = true;
        console.log(`Successfully updated ${chain} using primary endpoint`);
      } catch (error) {
        console.log(`Primary endpoint approach failed: ${error.message}`);
      }
    }

    // Third try: Use alternative endpoints if available
    if (!success && ALTERNATIVE_ENDPOINTS[chain]) {
      for (const endpoint of ALTERNATIVE_ENDPOINTS[chain]) {
        if (success) break;

        console.log(`Attempting with alternative endpoint: ${endpoint}`);
        command = `npx papi add ${descriptorKey} -n ${chain} -w ${endpoint} --skip-codegen`;

        try {
          execSync(command, {
            stdio: 'inherit',
            timeout: 5 * 60 * 1000 // 5 minute timeout
          });
          success = true;
          console.log(`Successfully updated ${chain} using alternative endpoint: ${endpoint}`);
        } catch (error) {
          console.log(`Alternative endpoint approach failed: ${error.message}`);
        }
      }
    }

    // Final try: If the chain includes underscores, try with a canonical key
    if (!success && chain.includes('_')) {
      console.log('Attempting fallback with canonical key...');
      const fallbackKey = chain.replace(/_/g, '');
      command = `npx papi add ${fallbackKey} -n ${chain} --skip-codegen`;

      try {
        execSync(command, {
          stdio: 'inherit',
          timeout: 5 * 60 * 1000 // 5 minute timeout
        });
        success = true;
        console.log(`Successfully updated ${chain} with fallback key: ${fallbackKey}`);
        descriptorKey = fallbackKey; // Update descriptorKey to fallback
      } catch (error) {
        console.log(`Fallback approach failed: ${error.message}`);
      }
    }

    if (success) {
      results.success.push({ chain, descriptorKey });
    } else {
      results.failed.push({ chain, error: 'All approaches failed' });
      console.error(`Failed to update ${chain}: All approaches failed`);
    }
  } catch (error) {
    console.error(`Unexpected error updating ${chain}: ${error.message}`);
    results.failed.push({ chain, error: error.message });
  }
}

// Run codegen once at the end to include all chains
if (results.success.length > 0) {
  try {
    console.log('\nRunning final codegen...');
    execSync('npx papi', { stdio: 'inherit' });
    console.log('Codegen completed successfully');

    // Install the updated descriptors
    console.log('\nInstalling updated descriptors...');
    execSync('npm install --no-save @polkadot-api/descriptors@.papi/descriptors', { stdio: 'inherit' });
    console.log('Installation completed successfully');
  } catch (error) {
    console.error(`Error during final steps: ${error.message}`);
  }
}

// Print summary
console.log('\n=== UPDATE SUMMARY ===');
console.log(`Total chains: ${chainsToUpdate.length}`);
console.log(`Successful: ${results.success.length}`);
console.log(`Failed: ${results.failed.length}`);

if (results.failed.length > 0) {
  console.log('\nFailed chains:');
  results.failed.forEach(({ chain, error }) => {
    console.log(`- ${chain}: ${error}`);
  });
}

console.log('\nSuccessful chains:');
results.success.forEach(({ chain, descriptorKey }) => {
  console.log(`- ${chain} (${descriptorKey})`);
});