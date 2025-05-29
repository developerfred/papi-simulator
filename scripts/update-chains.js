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




const ALL_CHAINS = [
  'polkadot',
  'ksmcc3',
  'westend2',  
  'paseo',

  
  'polkadot_asset_hub',
  'ksmcc3_asset_hub',
  'westend2_asset_hub',    
  'rococo_v2_2_asset_hub', 
  'polkadot_bridge_hub',
  'ksmcc3_bridge_hub',
  'westend2_bridge_hub',   
  'rococo_v2_2_bridge_hub',
  'polkadot_collectives',
  'polkadot_coretime',     
  'polkadot_people',
  'ksmcc3_people',
  'westend2_people',       
  'paseo_asset_hub',       
  'paseo_people',          
  'westend2_collectives',  

  
  'ksmcc3_encointer'
];


const CHAIN_TO_DESCRIPTOR_MAPPING = {  
  'polkadot': 'dot',
  'kusama': 'ksmcc3',
  'ksmcc3': 'ksm',
  'westend2': 'wnd',  
  'paseo': 'paseo',


  'polkadot_asset_hub': 'assethub',
  'ksmcc3_asset_hub': 'ksmassethub',
  'westend2_asset_hub': 'westendassethub',  
  'polkadot_bridge_hub': 'bridgehub',
  'ksmcc3_bridge_hub': 'ksmbridgehub',
  'westend2_bridge_hub': 'westendbridgehub',
  'polkadot_collectives': 'collectives',
  'polkadot_coretime': 'coretime',
  'polkadot_people': 'people',
  'ksmcc3_people': 'ksmpeople',
  'westend2_people': 'wndpeople',
  'paseo_asset_hub': 'paseoassethub',
  'paseo_people': 'paseopeople',
  'westend2_collectives': 'westendcollectives',


  'ksmcc3_encointer': 'encointer'
};


const CHAIN_RPC_ENDPOINTS = {
  'polkadot': 'wss://polkadot-rpc.dwellir.com',
  'ksmcc3': 'wss://kusama-rpc.dwellir.com',
  'westend2': 'wss://westend-rpc.dwellir.com',
  'paseo': 'wss://paseo-rpc.dwellir.com',

  'polkadot_asset_hub': 'wss://statemint-rpc.dwellir.com',
  'polkadot_bridge_hub': 'wss://polkadot-bridge-hub-rpc.dwellir.com',
  'polkadot_collectives': 'wss://polkadot-collectives-rpc.dwellir.com',
  'polkadot_coretime': 'wss://polkadot-coretime-rpc.dwellir.com',
  'ksmcc3_asset_hub': 'wss://kusama-asset-hub-rpc.dwellir.com',
  'ksmcc3_bridge_hub': 'wss://kusama-bridge-hub-rpc.dwellir.com',
  'westend2_asset_hub': 'wss://westend-asset-hub-rpc.dwellir.com',
  'westend2_bridge_hub': 'wss://westend-bridge-hub-rpc.dwellir.com',
  'westend2_collectives': 'wss://westend-collectives-rpc.dwellir.com',
  'paseo_asset_hub': 'wss://paseo-asset-hub-rpc.dwellir.com',

  'polkadot_people': 'wss://polkadot-people-rpc.dwellir.com',
  'ksmcc3_people': 'wss://kusama-people-rpc.dwellir.com',
  'westend2_people': 'wss://westend-people-rpc.dwellir.com',
  'paseo_people': 'wss://paseo-people-rpc.dwellir.com',

  'ksmcc3_encointer': 'wss://kusama.api.onfinality.io/public-ws' // OnFinality still reliable for Encointer
};


const ALTERNATIVE_ENDPOINTS = {
  'polkadot': [
    'wss://rpc.dotters.network/polkadot',
    'wss://polkadot.api.onfinality.io/public-ws',
    'wss://polkadot-rpc.subquery.network/public-ws' // SubQuery decentralized RPC
  ],
  'ksmcc3': [
    'wss://kusama.api.onfinality.io/public-ws',
    'wss://kusama-rpc.subquery.network/public-ws' 
  ],
  'westend2': [
    'wss://westend-rpc.subquery.network/public-ws',
    'wss://westend.api.onfinality.io/public-ws'
  ],
  'paseo': [
    'wss://paseo.api.onfinality.io/public-ws'
  ],
  'polkadot_asset_hub': [
    'wss://polkadot-asset-hub.api.onfinality.io/public-ws',
    'wss://statemint-rpc.polkadot.io', 
    'wss://polkadot-asset-hub-rpc.subquery.network/public-ws' 
  ],
  'ksmcc3_asset_hub': [
    'wss://kusama-asset-hub.api.onfinality.io/public-ws'
  ],
  'westend2_asset_hub': [
    'wss://westend-asset-hub.api.onfinality.io/public-ws'
  ],
  'polkadot_bridge_hub': [
    'wss://polkadot-bridge-hub.api.onfinality.io/public-ws'
  ],
  'ksmcc3_bridge_hub': [
    'wss://kusama-bridge-hub.api.onfinality.io/public-ws'
  ],
  'westend2_bridge_hub': [
    'wss://westend-bridge-hub.api.onfinality.io/public-ws'
  ],
  'polkadot_collectives': [
    'wss://polkadot-collectives.api.onfinality.io/public-ws'
  ],
  'polkadot_coretime': [
    'wss://polkadot-coretime.api.onfinality.io/public-ws'
  ],
  'polkadot_people': [
    'wss://polkadot-people.api.onfinality.io/public-ws'
  ],
  'ksmcc3_people': [
    'wss://kusama-people.api.onfinality.io/public-ws'
  ],
  'westend2_people': [
    'wss://westend-people.api.onfinality.io/public-ws'
  ],
  'paseo_people': [
    'wss://paseo-people.api.onfinality.io/public-ws'
  ],
  'westend2_collectives': [
    'wss://westend-collectives.api.onfinality.io/public-ws'
  ],
  'ksmcc3_encointer': [
    'wss://encointer.api.onfinality.io/public-ws' // Duplicate for consistency
  ]
};


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


const results = {
  success: [],
  failed: []
};


for (const chain of chainsToUpdate) {
  try {

    let descriptorKey = CHAIN_TO_DESCRIPTOR_MAPPING[chain] || chain.replace(/-([a-z])/g, (_, char) => char.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');

    console.log(`\nUpdating chain: ${chain} with descriptor key: ${descriptorKey}`);

    let command;
    let success = false;


    if (!CHAIN_RPC_ENDPOINTS[chain]) {
      console.log('Attempting to use well-known chain name...');
      command = `npx papi add ${descriptorKey} -n ${chain} --skip-codegen`;

      try {
        execSync(command, {
          stdio: 'inherit',
          timeout: 5 * 60 * 1000 
        });
        success = true;
        console.log(`Successfully updated ${chain} using well-known name`);
      } catch (error) {
        console.log(`Well-known name approach failed: ${error.message}`);
      }
    }

    
    if (!success && CHAIN_RPC_ENDPOINTS[chain]) {
      console.log(`Attempting with primary WebSocket endpoint: ${CHAIN_RPC_ENDPOINTS[chain]}`);
      command = `npx papi add ${descriptorKey} -n ${chain} -w ${CHAIN_RPC_ENDPOINTS[chain]} --skip-codegen`;

      try {
        execSync(command, {
          stdio: 'inherit',
          timeout: 5 * 60 * 1000 
        });
        success = true;
        console.log(`Successfully updated ${chain} using primary endpoint`);
      } catch (error) {
        console.log(`Primary endpoint approach failed: ${error.message}`);
      }
    }

    
    if (!success && ALTERNATIVE_ENDPOINTS[chain]) {
      for (const endpoint of ALTERNATIVE_ENDPOINTS[chain]) {
        if (success) break;

        console.log(`Attempting with alternative endpoint: ${endpoint}`);
        command = `npx papi add ${descriptorKey} -n ${chain} -w ${endpoint} --skip-codegen`;

        try {
          execSync(command, {
            stdio: 'inherit',
            timeout: 5 * 60 * 1000 
          });
          success = true;
          console.log(`Successfully updated ${chain} using alternative endpoint: ${endpoint}`);
        } catch (error) {
          console.log(`Alternative endpoint approach failed: ${error.message}`);
        }
      }
    }

    
    if (!success && chain.includes('_')) {
      console.log('Attempting fallback with canonical key...');
      const fallbackKey = chain.replace(/_/g, '');
      command = `npx papi add ${fallbackKey} -n ${chain} --skip-codegen`;

      try {
        execSync(command, {
          stdio: 'inherit',
          timeout: 5 * 60 * 1000 
        });
        success = true;
        console.log(`Successfully updated ${chain} with fallback key: ${fallbackKey}`);
        descriptorKey = fallbackKey; 
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