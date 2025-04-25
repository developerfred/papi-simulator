#!/usr/bin/env node

/**
 * Script to update version and git hash automatically
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');


const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = require(packageJsonPath);


const currentVersion = packageJson.version;


let gitHash = 'unknown';
let gitBranch = 'unknown';
try {
    gitHash = execSync('git rev-parse --short HEAD').toString().trim();
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch (error) {
    console.warn('Unable to get git information:', error.message);
}


const buildTime = new Date().toISOString();


const versionInfo = {
    version: currentVersion,
    gitHash,
    gitBranch,
    buildTime,
    environment: process.env.NODE_ENV || 'development'
};


const versionFilePath = path.join(process.cwd(), 'src/version.json');
fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));

console.log('Version info updated:', versionInfo);


const envFilePath = path.join(process.cwd(), '.env.local');
const envContent = `NEXT_PUBLIC_VERSION=${currentVersion}
NEXT_PUBLIC_GIT_HASH=${gitHash}
NEXT_PUBLIC_BUILD_TIME=${buildTime}
`;


if (fs.existsSync(envFilePath)) {
    let existingContent = fs.readFileSync(envFilePath, 'utf8');

    
    existingContent = existingContent.replace(/NEXT_PUBLIC_VERSION=.*/g, '');
    existingContent = existingContent.replace(/NEXT_PUBLIC_GIT_HASH=.*/g, '');
    existingContent = existingContent.replace(/NEXT_PUBLIC_BUILD_TIME=.*/g, '');


    fs.writeFileSync(envFilePath, existingContent.trim() + '\n' + envContent);
} else {
    fs.writeFileSync(envFilePath, envContent);
}

console.log('Environment variables updated');