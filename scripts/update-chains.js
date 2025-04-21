#!/usr/bin/env node

/**
 * Script to update blockchain descriptors for all supported chains
 * 
 * This can be run locally with: node scripts/update-chains.js
 * Or with a specific chain: node scripts/update-chains.js polkadot
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// All supported chains - keep in sync with the GitHub Action
const ALL_CHAINS = [
  // Relay chains
  'polkadot',
  'kusama',
  'westend2',
  'rococo_v2_2',
  'paseo',
  
  // Asset Hubs
  'polkadot_asset_hub',
  'kusama_asset_hub',
  'westend_asset_hub',
  'rococo_asset_hub',
  
  // Bridge Hubs
  'polkadot_bridge_hub',
  'kusama_bridge_hub',
  'westend_bridge_hub',
  'rococo_bridge_hub',
  
  // Other parachains
  'polkadot_collectives',
  'pendulum',
  'amplitude',
  'hydradx',
  'basilisk',
  'mangata'
];

// Map of special chain names to descriptor keys
const CHAIN_TO_DESCRIPTOR_MAPPING = {
  'polkadot': 'dot',
  'kusama': 'ksm',
  'westend2': 'wnd',
  'rococo_v2_2': 'roc',
  'paseo': 'paseo'
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

// Track results
const results = {
  success: [],
  failed: []
};

// Update each chain
for (const chain of chainsToUpdate) {
  try {
    // Convert chain name to descriptor key
    let descriptorKey = chain.replace(/-([a-z])/g, (_, char) => char.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
    
    // Check if we have a special mapping for this chain
    if (CHAIN_TO_DESCRIPTOR_MAPPING[chain]) {
      descriptorKey = CHAIN_TO_DESCRIPTOR_MAPPING[chain];
    }
    
    console.log(`\nUpdating chain: ${chain} with descriptor key: ${descriptorKey}`);
    
    // Run papi add command
    execSync(`npx papi add ${descriptorKey} -n ${chain} --skip-codegen`, { 
      stdio: 'inherit',
      timeout: 5 * 60 * 1000 // 5 minute timeout
    });
    
    results.success.push({ chain, descriptorKey });
    console.log(`Successfully updated ${chain}`);
  } catch (error) {
    console.error(`Error updating ${chain}: ${error.message}`);
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