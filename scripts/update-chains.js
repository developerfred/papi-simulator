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
  'westend2_asset_hub',    // Corrigido de 'westend_asset_hub'
  'rococo_v2_2_asset_hub', // Corrigido de 'rococo_asset_hub'
  'polkadot_bridge_hub',
  'ksmcc3_bridge_hub',
  'westend2_bridge_hub',   // Corrigido de 'westend_bridge_hub'
  'rococo_v2_2_bridge_hub',// Corrigido de 'rococo_bridge_hub'
  'polkadot_collectives',
  'polkadot_coretime',     // Adicionado
  'polkadot_people',
  'ksmcc3_people',
  'westend2_people',       // Corrigido de 'westend_people'
  'rococo_v2_2_people',    // Adicionado
  'paseo_asset_hub',       // Adicionado
  'paseo_people',          // Adicionado
  'westend2_collectives',  // Adicionado

  // Kusama Ecosystem
  'ksmcc3_encointer'
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



  // System Parachains
  'polkadot_asset_hub': 'assethub',
  'ksmcc3_asset_hub': 'ksmassethub',
  'westend2_asset_hub': 'westendassethub',
  'rococo_v2_2_asset_hub': 'rococoassethub',
  'polkadot_bridge_hub': 'bridgehub',
  'ksmcc3_bridge_hub': 'ksmbridgehub',
  'westend2_bridge_hub': 'westendbridgehub',
  'rococo_v2_2_bridge_hub': 'rococobridgehub',
  'polkadot_collectives': 'collectives',
  'polkadot_coretime': 'coretime',
  'polkadot_people': 'people',
  'ksmcc3_people': 'ksmpeople',
  'westend2_people': 'wndpeople',
  'rococo_v2_2_people': 'rococopeople',
  'paseo_asset_hub': 'paseoassethub',
  'paseo_people': 'paseopeople',
  'westend2_collectives': 'westendcollectives',

  // Kusama Parachains
  'ksmcc3_encointer': 'encointer'
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
  'polkadot_coretime': 'wss://polkadot-coretime-rpc.polkadot.io',
  'ksmcc3_asset_hub': 'wss://kusama-asset-hub-rpc.polkadot.io',
  'ksmcc3_bridge_hub': 'wss://kusama-bridge-hub-rpc.polkadot.io',
  'westend2_asset_hub': 'wss://westend-asset-hub-rpc.polkadot.io',
  'westend2_bridge_hub': 'wss://westend-bridge-hub-rpc.polkadot.io',
  'westend2_collectives': 'wss://westend-collectives-rpc.polkadot.io',
  'rococo_v2_2_asset_hub': 'wss://rococo-asset-hub-rpc.polkadot.io',
  'rococo_v2_2_bridge_hub': 'wss://rococo-bridge-hub-rpc.polkadot.io',
  'paseo_asset_hub': 'wss://paseo-asset-hub-rpc.polkadot.io',

  // People Chains
  'polkadot_people': 'wss://polkadot-people-rpc.polkadot.io',
  'ksmcc3_people': 'wss://kusama-people-rpc.polkadot.io',
  'westend2_people': 'wss://westend-people-rpc.polkadot.io',
  'rococo_v2_2_people': 'wss://rococo-people-rpc.polkadot.io',
  'paseo_people': 'wss://paseo-people-rpc.polkadot.io',

  // Kusama Ecosystem
  'ksmcc3_encointer': 'wss://encointer.api.onfinality.io/public-ws'
};

// Alternative endpoints in case primary fails
const ALTERNATIVE_ENDPOINTS = {
  'polkadot': ['wss://rpc.dotters.network/polkadot'],
  'ksmcc3': ['wss://kusama.api.onfinality.io/public-ws']
};

// Ensure metadata directory exists
const metadataDir = path.join('.papi', 'metadata');
if (!fs.existsSync(metadataDir)) {
  console.log('Creating metadata directory...');
  fs.mkdirSync(metadataDir, { recursive: true });
}



const specificChains = process.argv.slice(2);
const chainsToUpdate = specificChains.length > 0
  ? specificChains.filter(chain => ALL_CHAINS.includes(chain))
  : ALL_CHAINS;

if (specificChains.length > 0 && chainsToUpdate.length === 0) {
  console.error('No valid chains specified. Supported chains:');
  console.error(ALL_CHAINS.join(', '));
  process.exit(1);
}

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