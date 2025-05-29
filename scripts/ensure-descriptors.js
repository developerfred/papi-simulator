#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');


const MINIMAL_CHAINS = ['polkadot', 'westend2', 'paseo', 'rococo_v2_2'];


function checkMinimalDescriptors() {
  return MINIMAL_CHAINS.every(chain => {
    const descriptorFile = path.join('.papi', 'descriptors', `${chain}.ts`);
    return fs.existsSync(descriptorFile);
  });
}


function updateMinimalDescriptors() {
  try {
    console.log('Atualizando descritores mínimos...');
    execSync(`node scripts/update-chains.js ${MINIMAL_CHAINS.join(' ')}`, {
      stdio: 'inherit'
    });
    
    console.log('Gerando código...');
    execSync('npx papi', { stdio: 'inherit' });
    
    console.log('Instalando descritores...');
    execSync('pnpm install --no-save @polkadot-api/descriptors@.papi/descriptors', {
      stdio: 'inherit'
    });
    
    return true;
  } catch (error) {
    console.error('Falha ao atualizar descritores mínimos:', error.message);
    return false;
  }
}


if (!checkMinimalDescriptors()) {
  console.log('Descritores mínimos não encontrados. Iniciando atualização...');
  const success = updateMinimalDescriptors();
  
  if (!success) {
    console.error('❌ Falha crítica na inicialização. Verifique os logs.');
    process.exit(1);
  }
} else {
  console.log('✅ Descritores mínimos já estão instalados.');
}