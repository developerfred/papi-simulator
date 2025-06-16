/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any,  @typescript-eslint/no-require-imports */
// @ts-nocheck
"use client";

import React, { useCallback, useMemo, useEffect, useRef } from "react";
import type { ApiPromise } from "@polkadot/api";
import { formatBalance } from "@polkadot/util";
import { Card, Button } from "@/components/ui";
import { ChevronLeft, X, Info, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';

import { useTransactionState } from "../builder/hooks/useTransactionState";
import { ProgressSteps } from "../builder/components/ProgressSteps";
import { PresetSelector } from "../builder/components/PresetSelector";
import { TransactionConfig } from "../builder/components/TransactionConfig";
import { TransactionReview } from "../builder/components/TransactionReview";
import { TransactionStatus } from "../builder/components/TransactionStatus";
import { XcmNetworkStatus } from "../builder/components/XcmNetworkStatus";

import {
  type TransactionStep,
  Network,
  WalletAccount,
  type TransactionBuilderProps,
} from "../builder/types/transaction.types";

import { TRANSACTION_PRESETS, XCM_DESTINATIONS, detectNetworkType } from "../builder/constants/presets";

class XcmTypeDetector {
  private api: ApiPromise;
  private networkType: string;
  private trustedRelationships: Map<string, Set<string>> = new Map();
  private barrierConfig: any;
  private isTestnet: boolean;

  constructor(api: ApiPromise, network: any) {
    this.api = api;
    this.networkType = this.detectNetworkType(network);
    this.isTestnet = ['paseo', 'westend'].includes(this.networkType);
    this.initializeTrustRelationships();
    this.initializeBarrierConfig();
    this.detectXcmCapabilities();
    this.validateNetworkCapabilities();
  }

  private detectNetworkType(network: any): string {
    const name = network?.name?.toLowerCase() || '';
    const symbol = network?.symbol?.toLowerCase() || '';

    if (name.includes('paseo') || symbol === 'pas') return 'paseo';
    if (name.includes('westend') || symbol === 'wnd') return 'westend';
    if (name.includes('kusama') || symbol === 'ksm') return 'kusama';
    if (name.includes('polkadot') || symbol === 'dot') return 'polkadot';

    return 'unknown';
  }


  private validateNetworkCapabilities(): void {    
    const xcmPallets = ['polkadotXcm', 'xcmPallet'];
    const availablePallet = xcmPallets.find(name => Boolean(this.api.tx[name]));

    if (!availablePallet) {
      throw new Error(`No XCM pallet found on ${this.networkType}. Available pallets: ${Object.keys(this.api.tx).slice(0, 10).join(', ')}`);
    }

    console.log(`✅ CRITICAL: Using XCM pallet: ${availablePallet}`);
  }


  private initializeTrustRelationships(): void {
    
    const relationships = {
      polkadot: {    
        'polkadot': new Set(['polkadot_asset_hub', 'polkadot_bridge_hub', 'polkadot_collectives']),
        'polkadot_asset_hub': new Set(['polkadot', 'polkadot_bridge_hub']),
        'polkadot_bridge_hub': new Set(['polkadot', 'polkadot_asset_hub']),
        'polkadot_collectives': new Set(['polkadot']),
      },
      kusama: {
        'kusama': new Set(['kusama_asset_hub', 'kusama_bridge_hub', 'encointer']),
        'kusama_asset_hub': new Set(['kusama', 'kusama_bridge_hub']),
        'kusama_bridge_hub': new Set(['kusama', 'kusama_asset_hub']),
        'encointer': new Set(['kusama']),
      },
      paseo: {        
        'paseo': new Set(['paseo_asset_hub']),
        'paseo_asset_hub': new Set(['paseo']),        
      },
      westend: {
        'westend': new Set(['westend_asset_hub', 'westend_bridge_hub', 'westend_collectives']),
        'westend_asset_hub': new Set(['westend', 'westend_bridge_hub']),
        'westend_bridge_hub': new Set(['westend', 'westend_asset_hub']),
        'westend_collectives': new Set(['westend']),
      }
    };

    this.trustedRelationships = new Map(Object.entries(relationships[this.networkType] || {}));
    console.log(`🔗 Initialized trust relationships for ${this.networkType}:`,
      Object.fromEntries(this.trustedRelationships));
  }


  private initializeBarrierConfig(): void {
    this.barrierConfig = {
      polkadot: {
        allowUnpaidFrom: ['polkadot_asset_hub', 'polkadot_bridge_hub', 'polkadot_collectives'],
        requirePayment: true,
        maxInstructionWeight: 1000000000000,
        supportedVersions: ['V4', 'V3'],
        strictFiltering: false,
      },
      kusama: {
        allowUnpaidFrom: ['kusama_asset_hub', 'kusama_bridge_hub', 'encointer'],
        requirePayment: true,
        maxInstructionWeight: 1000000000000,
        supportedVersions: ['V4', 'V3'],
        strictFiltering: false,
      },
      paseo: {
        allowUnpaidFrom: ['paseo_asset_hub'], 
        requirePayment: true,
        maxInstructionWeight: 500000000000, 
        supportedVersions: ['V4', 'V3'],
        strictFiltering: true, 
        knownIssues: ['paseo_people', 'paseo_coretime'], 
      },
      westend: {
        allowUnpaidFrom: ['westend_asset_hub', 'westend_bridge_hub'],
        requirePayment: true,
        maxInstructionWeight: 500000000000,
        supportedVersions: ['V4', 'V3'],
        strictFiltering: true,
      }
    };

    console.log(`⚙️ Barrier config for ${this.networkType}:`, this.barrierConfig[this.networkType]);
  }

  private detectXcmCapabilities(): void {
    try {
      // Check available XCM pallets
      const xcmPallets = ['polkadotXcm', 'xcmPallet', 'xTokens', 'xtokens'];
      const availablePallets = xcmPallets.filter(name => Boolean(this.api.tx[name]));

      console.log(`✅ Available XCM pallets on ${this.networkType}:`, availablePallets);

      if (availablePallets.length === 0) {
        console.warn(`❌ No XCM pallets found on ${this.networkType}`);
      }
    } catch (error) {
      console.warn('XCM capability detection failed:', error);
    }
  }

  /**
   * Check if teleport is allowed between source and destination
   * Based on trust relationships from Polkadot runtime
   */
  private isTeleportAllowed(sourceKey: string, destKey: string): boolean {
    const sourceTrusted = this.trustedRelationships.get(sourceKey);
    const isTrusted = sourceTrusted?.has(destKey) || false;

    console.log(`🔗 Teleport allowed ${sourceKey} -> ${destKey}: ${isTrusted}`);
    return isTrusted;
  }

  /**
   * Check if destination has known issues
   */
  private hasKnownIssues(destKey: string): boolean {
    const config = this.barrierConfig[this.networkType];
    const hasIssues = config?.knownIssues?.includes(destKey) || false;

    if (hasIssues) {
      console.warn(`⚠️ Destination ${destKey} has known connectivity issues`);
    }

    return hasIssues;
  }

  /**
   * Get filtered destinations based on trust and barrier configuration
   */
  getValidDestinations(): Record<string, any> {
    const allDestinations = {
      paseo: {        
        'paseo': { paraId: 0, name: 'Paseo Relay Chain', network: 'paseo', working: true },
        'paseo_asset_hub': { paraId: 1000, name: 'Paseo Asset Hub', network: 'paseo', working: true },
        
      },
      westend: {
        'westend': { paraId: 0, name: 'Westend Relay Chain', network: 'westend', working: true },
        'westend_asset_hub': { paraId: 1000, name: 'Westend Asset Hub', network: 'westend', working: true },
        'westend_bridge_hub': { paraId: 1002, name: 'Westend Bridge Hub', network: 'westend', working: true },
      },
      polkadot: {
        'polkadot': { paraId: 0, name: 'Polkadot Relay Chain', network: 'polkadot', working: true },
        'polkadot_asset_hub': { paraId: 1000, name: 'Polkadot Asset Hub', network: 'polkadot', working: true },
        'polkadot_bridge_hub': { paraId: 1002, name: 'Polkadot Bridge Hub', network: 'polkadot', working: true },
      },
      kusama: {
        'kusama': { paraId: 0, name: 'Kusama Relay Chain', network: 'kusama', working: true },
        'kusama_asset_hub': { paraId: 1000, name: 'Kusama Asset Hub', network: 'kusama', working: true },
        'kusama_bridge_hub': { paraId: 1002, name: 'Kusama Bridge Hub', network: 'kusama', working: true },
      }
    };

    const networkDestinations = allDestinations[this.networkType] || {};

    if (this.networkType === 'paseo') {
      const safeDestinations = {
        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        'paseo': networkDestinations['paseo'],
        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        'paseo_asset_hub': networkDestinations['paseo_asset_hub']
      };

      // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
      console.log(`🔧 CRITICAL: Paseo limited to safe destinations:`, Object.keys(safeDestinations));
      return safeDestinations;
    }

    
    const validDestinations = Object.fromEntries(
      Object.entries(allDestinations).filter(([key, dest]) => {    
        if (dest.network !== this.networkType) return false;        
        if (this.barrierConfig[this.networkType]?.strictFiltering) {
          if (this.hasKnownIssues(key)) return false;
        }

        return true;
      })
    );

    console.log(`📍 Valid destinations for ${this.networkType}:`, Object.keys(validDestinations));
    return validDestinations;
  }

  /**
   * Create XCM location with proper barrier compliance
   */
  createXcmLocation(destination: string, isForBeneficiary: boolean = false): any {
    if (isForBeneficiary) {
      return this.createBeneficiaryLocation(destination);
    }

    const validDestinations = this.getValidDestinations();
    const dest = validDestinations[destination];

    if (!dest) {
      throw new Error(
        `Invalid destination: ${destination}. ` +
        `Valid destinations for ${this.networkType}: ${Object.keys(validDestinations).join(', ')}`
      );
    }

    let location;
    if (dest.paraId === 0) {
      // Relay chain destination
      location = {
        parents: 1,
        interior: 'Here'
      };
    } else {
      // Parachain destination
      location = {
        parents: 1,
        interior: {
          X1: {
            Parachain: dest.paraId
          }
        }
      };
    }

    console.log(`🎯 Created location for ${destination}:`, location);

    // Create versioned location using V3 format (matching Polkadot-js)
    return {
      V3: location
    };
  }

  private createBeneficiaryLocation(address: string): any {
    try {
      const { decodeAddress } = require('@polkadot/util-crypto');
      const publicKey = decodeAddress(address);

      if (publicKey.length !== 32) {
        throw new Error(`Invalid AccountId32: expected 32 bytes, got ${publicKey.length}`);
      }

      // Create beneficiary location in V3 format (matching Polkadot-js)
      const location = {
        parents: 0,
        interior: {
          X1: {
            AccountId32: {
              id: this.api.createType('AccountId32', address).toHex(),
              network: null
            }
          }
        }
      };

      console.log(`👤 Created beneficiary location for ${address.slice(0, 10)}...`);

      return {
        V3: location
      };
    } catch (error) {
      throw new Error(`Failed to create beneficiary location: ${error.message}`);
    }
  }

  createXcmAssets(assetString: string): any {
    const [assetKey, amount] = assetString.split('|');
    if (!assetKey || !amount) {
      throw new Error('Assets must be in format: asset|amount (e.g., "native|1.0")');
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    // Validate minimum amount for XCM execution
    const minAmount = this.networkType === 'paseo' || this.networkType === 'westend' ? 0.1 : 1.0;
    if (numAmount < minAmount) {
      throw new Error(
        `Amount too small for XCM execution. Minimum: ${minAmount} ${this.networkType.toUpperCase()}`
      );
    }

    const decimals = this.api.registry.chainDecimals?.[0] || 12;
    const planckAmount = BigInt(Math.floor(numAmount * Math.pow(10, decimals)));

    // Create asset in V3 format (matching Polkadot-js)
    const asset = {
      fun: {
        Fungible: planckAmount
      },
      id: {
        Concrete: {
          interior: 'Here',
          parents: this.isTestnet ? 1 : 0  // Adjusted for relay chain assets
        }
      }
    };

    console.log(`💰 Created asset: ${numAmount} ${assetKey.toUpperCase()} (${planckAmount.toString()} Planck)`);

    // Return V3 formatted assets array
    return {
      V3: [asset]
    };
  }


  private createVersionedLocation(location: any): any {
    const versions = this.isTestnet ? ['V4', 'V3'] : ['V4', 'V3', 'V2'];

    for (const version of versions) {
      for (const locationType of ['XcmVersionedLocation', 'XcmVersionedMultiLocation']) {
        try {
          const versionedLocation = { [version]: location };
          const result = this.api.createType(locationType, versionedLocation);
          console.log(`✅ Created ${locationType} with ${version}`);
          return result;
        } catch (error) {
          console.warn(`❌ Failed ${locationType} ${version}:`, error.message);
          continue;
        }
      }
    }
    
    try {
      const result = this.api.createType('MultiLocation', location);
      console.log(`✅ CRITICAL: Using direct MultiLocation`);
      return result
    } catch (error) {
      console.warn('All location creation strategies failed, using raw object');
      return location;
    }
  }


  private createVersionedAssets(assets: any[]): any {
    const versions = this.isTestnet ? ['V4', 'V3'] : ['V4', 'V3', 'V2'];

    for (const version of versions) {
      for (const assetType of ['XcmVersionedAssets', 'XcmVersionedMultiAssets']) {
        try {
          const versionedAssets = { [version]: assets };
          const result = this.api.createType(assetType, versionedAssets);
          console.log(`✅ Created ${assetType} with ${version}`);
          return result;
        } catch (error) {
          console.warn(`❌ Failed ${assetType} ${version}:`, error.message);
          continue;
        }
      }
    }

    // Fallback to direct MultiAssets
    try {
      const result = this.api.createType('MultiAssets', assets);
      console.log(`✅ CRITICAL: Using direct MultiAssets`);
      return result;
    } catch (error) {
      console.warn('All assets creation strategies failed, using raw array');
      return assets;
    }
  }


  createWeightLimit(limit: string): any {
    if (limit === 'Unlimited') {
      return { Unlimited: null };
    }

    // For testnet, use conservative weight limits
    if (this.isTestnet) {
      return { Unlimited: null }; // Testnets often work better with unlimited
    }

    const maxWeight = this.barrierConfig[this.networkType]?.maxInstructionWeight || 1000000000000;
    const weightValue = Math.min(parseInt(limit) || maxWeight, maxWeight);

    // Return weight limit matching Polkadot-js format
    return {
      Limited: {
        refTime: weightValue,
        proofSize: 65536
      }
    };
  }


  suggestOptimalMethod(sourceKey: string, destKey: string): string {
    if (this.networkType === 'paseo') {      
      if (destKey === 'paseo_asset_hub' || sourceKey === 'paseo_asset_hub') {
        return 'limitedTeleportAssets';
      }
      
      if (destKey === 'paseo' || sourceKey === 'paseo') {
        return 'teleportAssets';
      }
    }

    if (destKey.includes('asset_hub') || sourceKey.includes('asset_hub')) {
      return 'limitedTeleportAssets';
    }

    
    if (this.isTeleportAllowed(sourceKey, destKey)) {
      return 'limitedTeleportAssets';
    }


    return 'limitedReserveTransferAssets';
  }


  validateXcmTransaction(sourceKey: string, destKey: string, method: string): {
    valid: boolean;
    warnings: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let valid = true;

    const validDestinations = this.getValidDestinations();

    
    if (!validDestinations[destKey]) {
      valid = false;
      warnings.push(`Destination ${destKey} not available on ${this.networkType}`);
      suggestions.push(`Available destinations: ${Object.keys(validDestinations).join(', ')}`);
      return { valid, warnings, suggestions };
    }

    
    if (this.hasKnownIssues(destKey)) {
      warnings.push(`Destination ${destKey} has known connectivity issues`);
      suggestions.push('Consider using Asset Hub which is more reliable');
    }

    // Check method compatibility
    if (method.includes('teleport')) {
      if (!this.isTeleportAllowed(sourceKey, destKey)) {
        warnings.push(`Teleport not allowed between ${sourceKey} and ${destKey}`);
        suggestions.push('Use Reserve Transfer instead of Teleport');
      }
    }

    
    if (this.networkType === 'paseo') {
      const workingRoutes = [
        ['paseo', 'paseo_asset_hub'],
        ['paseo_asset_hub', 'paseo']
      ];

      const isWorkingRoute = workingRoutes.some(([source, dest]) =>
        (sourceKey === source && destKey === dest) ||
        (sourceKey === dest && destKey === source)
      );

      if (!isWorkingRoute) {
        warnings.push(`CRITICAL: Route ${sourceKey} -> ${destKey} may not work reliably on Paseo`);
        suggestions.push('Use paseo <-> paseo_asset_hub route which is verified to work');
      }

      // Method-specific validations for Paseo
      if (method.includes('reserve') && !method.includes('limited')) {
        warnings.push('CRITICAL: Unlimited reserve transfers often fail on Paseo');
        suggestions.push('Use limitedReserveTransferAssets or switch to teleport');
      }

      if (!method.includes('limited') && method !== 'teleportAssets') {
        warnings.push('CRITICAL: Non-limited methods may hit Paseo weight barriers');
        suggestions.push('Use limited variants for better reliability on Paseo');
      }
    }

    return { valid, warnings, suggestions };
  }

  getNetworkDiagnostics() {
    return {
      networkType: this.networkType,
      barrierConfig: this.barrierConfig[this.networkType],
      trustedRelationships: Object.fromEntries(this.trustedRelationships),
      validDestinations: Object.keys(this.getValidDestinations()),
      recommendedMethods: this.isTestnet ?
        ['limitedTeleportAssets', 'teleportAssets'] :
        ['limitedReserveTransferAssets', 'limitedTeleportAssets']
    };
  }
}


class SubstrateTypeHandler {
  private api: ApiPromise;
  private xcmDetector: XcmTypeDetector;

  constructor(api: ApiPromise, network: any) {
    this.api = api;
    this.xcmDetector = new XcmTypeDetector(api, network);
  }

  createType(typeName: string, value: any): any {
    try {
      if (this.isXcmType(typeName)) {
        const result = this.createXcmType(typeName, value);
        
        if (result && typeof result === 'object' && result._enum && !result.toHex && !result.toU8a) {
          throw new Error(`Type definition object detected for ${typeName}. This will cause transaction failure.`);
        }

        return result;
      }  

      return this.createStandardType(typeName, value);

    } catch (error) {
      console.error(`Type creation failed for ${typeName}:`, error);
      throw new Error(`Type creation failed for ${typeName}: ${error.message}`);
    }
  }

  createXcmLocation(destination: string, isForBeneficiary: boolean = false): any {
    return this.xcmDetector.createXcmLocation(destination, isForBeneficiary);
  }

  createXcmAssets(assetString: string): any {
    return this.xcmDetector.createXcmAssets(assetString);
  }

  createWeightLimit(limit: string): any {
    return this.xcmDetector.createWeightLimit(limit);
  }


  private isXcmType(typeName: string): boolean {
    return typeName.startsWith('Xcm') ||
          typeName.includes('MultiLocation') ||
          typeName.includes('MultiAsset') ||
          typeName.includes('WeightLimit');
  }

  private createXcmType(typeName: string, value: any): any {
    switch (typeName) {
      case 'XcmDestination':
        return this.xcmDetector.createXcmLocation(value, false);
      case 'XcmBeneficiary':
        return this.xcmDetector.createXcmLocation(value, true);
      case 'XcmAssets':
        return this.xcmDetector.createXcmAssets(value);
      case 'XcmWeightLimit':
        return this.xcmDetector.createWeightLimit(value);
      default:
        return this.api.createType(typeName, value);
    }
  }

  private createStandardType(typeName: string, value: any): any {
    if (this.isPrimitiveType(typeName)) {
      return this.createPrimitiveType(typeName, value);
    }
    
    if (this.isAccountType(typeName)) {
      return this.createAccountType(typeName, value);
    }

    
    if (this.isBalanceType(typeName)) {
      return this.createBalanceType(typeName, value);
    }
    
    return this.api.createType(typeName, value);
  }

  private isPrimitiveType(typeName: string): boolean {
    return ['u8', 'u16', 'u32', 'u64', 'u128', 'bool'].includes(typeName);
  }

  private createPrimitiveType(typeName: string, value: any): any {
    if (typeName.startsWith('u')) {
      const numValue = parseInt(value);
      if (isNaN(numValue)) {
        throw new Error(`Invalid numeric value for ${typeName}: ${value}`);
      }
      return this.api.createType(typeName, numValue);
    }

    if (typeName === 'bool') {
      return this.api.createType('bool', Boolean(value));
    }

    return this.api.createType(typeName, value);
  }

  private isAccountType(typeName: string): boolean {
    return ['AccountId', 'AccountId32', 'Address', 'LookupSource'].includes(typeName);
  }

  private createAccountType(typeName: string, value: any): any {
    try {
      const { isAddress } = require('@polkadot/util-crypto');
      if (!isAddress(value)) {
        throw new Error(`Invalid address format: ${value}`);
      }
      return this.api.createType(typeName, value);
    } catch (error) {
      throw new Error(`Failed to create account type: ${error.message}`);
    }
  }

  private isBalanceType(typeName: string): boolean {
    return ['Balance', 'Compact<Balance>', 'BalanceOf'].includes(typeName);
  }

  private createBalanceType(typeName: string, value: any): any {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      throw new Error(`Invalid balance value: ${value}`);
    }

    const decimals = this.api.registry.chainDecimals?.[0] || 12;
    const planckValue = BigInt(Math.floor(numValue * Math.pow(10, decimals)));

    return this.api.createType(typeName, planckValue);
  }

  getXcmDiagnostics() {
    return this.xcmDetector.getNetworkDiagnostics();
  }

  validateXcmTransaction(sourceKey: string, destKey: string, method: string) {
    return this.xcmDetector.validateXcmTransaction(sourceKey, destKey, method);
  }

  suggestOptimalMethod(sourceKey: string, destKey: string) {
    return this.xcmDetector.suggestOptimalMethod(sourceKey, destKey);
  }
}



class PalletResolver {
  private api: ApiPromise;

  constructor(api: ApiPromise) {
    this.api = api;
  }

  resolvePallet(palletName: string): any {
    
    const xcmPalletVariations = ['polkadotXcm', 'xcmPallet', 'xTokens', 'xtokens'];

    if (palletName === 'xcmPallet' || palletName.toLowerCase().includes('xcm')) {
      for (const variation of xcmPalletVariations) {
        if (this.api.tx[variation]) {
          console.log(`✅ Resolved XCM pallet: ${palletName} -> ${variation}`);
          return { name: variation, pallet: this.api.tx[variation] };
        }
      }
    }
    
    if (this.api.tx[palletName]) {
      return { name: palletName, pallet: this.api.tx[palletName] };
    }
    
    const variations = [
      palletName,
      palletName.toLowerCase(),
      palletName.charAt(0).toLowerCase() + palletName.slice(1),
      palletName.charAt(0).toUpperCase() + palletName.slice(1)
    ];

    for (const variation of variations) {
      if (this.api.tx[variation]) {
        console.log(`✅ Resolved pallet: ${palletName} -> ${variation}`);
        return { name: variation, pallet: this.api.tx[variation] };
      }
    }

    throw new Error(
      `Pallet not found: ${palletName}. Available pallets: ${Object.keys(this.api.tx).slice(0, 10).join(', ')}...`
    );
  }

  resolveCall(palletObj: any, callName: string): any {
    if (palletObj[callName]) {
      return palletObj[callName];
    }

    const variations = [
      callName,
      callName.toLowerCase(),
      callName.charAt(0).toLowerCase() + callName.slice(1),
      callName.charAt(0).toUpperCase() + callName.slice(1)
    ];

    for (const variation of variations) {
      if (palletObj[variation]) {
        console.log(`✅ Resolved call: ${callName} -> ${variation}`);
        return palletObj[variation];
      }
    }

    const availableCalls = Object.keys(palletObj).slice(0, 10).join(', ');
    throw new Error(`Call not found: ${callName}. Available calls: ${availableCalls}...`);
  }
}

interface TransactionBuilderEnhancedProps extends TransactionBuilderProps {
  onMinimize?: () => void;
  isFullscreen?: boolean;
}

const TransactionBuilder: React.FC<TransactionBuilderEnhancedProps> = ({
  api,
  network,
  senderAccount,
  onMinimize,
  isFullscreen = false,
}) => {
  const { state, updateState, resetState, getCurrentState } = useTransactionState();

  
  const typeHandler = useMemo(() =>
    api ? new SubstrateTypeHandler(api, network) : null,
    [api, network]
  );

  const palletResolver = useMemo(() => api ? new PalletResolver(api) : null, [api]);


  const mountedRef = useRef(true);
  const buildingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);


  const [walletReady, setWalletReady] = React.useState(false);

  
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'loading' = 'success') => {
    const toastId = toast[type](message);
    return toastId;
  }, []);

  
  useEffect(() => {
    const initWallet = async () => {
      try {
        const extensions = await web3Enable('Polkadot Transaction Builder');
        setWalletReady(extensions.length > 0);
        if (extensions.length === 0) {
          showToast('No wallet extension found. Please install Polkadot.js extension.', 'error');
        }
      } catch (error) {
        console.error('Wallet initialization error:', error);
        setWalletReady(false);
      }
    };
    initWallet();
  }, [showToast]);
 
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  
  useEffect(() => {
    if (typeHandler) {
      const diagnostics = typeHandler.getXcmDiagnostics();
      console.log('🔍 XCM Network Diagnostics:', diagnostics);
    }
  }, [typeHandler]);

  
  const currentPhase = useMemo(() => {
    if (!state.selectedPreset) return 'selection';
    if (state.selectedPreset && !state.builtTx) return 'configuration';
    if (state.builtTx && !state.txHash) return 'review';
    if (state.txHash) return 'status';
    return 'selection';
  }, [state.selectedPreset, state.builtTx, state.txHash]);

  const availablePallets = useMemo(() => {
    return api?.tx ? Object.keys(api.tx).sort() : [];
  }, [api?.tx]);

  const availableCalls = useMemo(() => {
    if (!api?.tx || !state.customPallet) return [];
    try {
      const resolved = palletResolver?.resolvePallet(state.customPallet);
      return resolved ? Object.keys(resolved.pallet).sort() : [];
    } catch {
      return [];
    }
  }, [api?.tx, state.customPallet, palletResolver]);

  const steps: TransactionStep[] = useMemo(() => {
    const { selectedPreset, builtTx, estimatedFee, isSigning, txHash, txStatus, isSending } = state;
    return [
      {
        id: 'build',
        title: 'Build',
        description: 'Configure parameters',
        status: builtTx ? 'completed' : selectedPreset ? 'active' : 'pending'
      },
      {
        id: 'review',
        title: 'Review',
        description: 'Verify & estimate',
        status: builtTx ? (estimatedFee ? 'completed' : 'active') : 'pending'
      },
      {
        id: 'sign',
        title: 'Sign',
        description: 'Wallet signature',
        status: isSigning ? 'active' : txHash ? 'completed' : 'pending'
      },
      {
        id: 'broadcast',
        title: 'Send',
        description: 'Network broadcast',
        status: isSending ? 'active' : txStatus === 'finalized' ? 'completed' : 'pending'
      }
    ];
  }, [state]);

  const isExpanded = useMemo(() => currentPhase !== 'selection', [currentPhase]);

  
  const handlePresetSelect = useCallback((preset) => {
    const updates: any = { selectedPreset: preset };

    if (preset.id === 'custom') {
      updates.customPallet = '';
      updates.customCall = '';
      updates.args = {};
    } else {
      updates.customPallet = preset.pallet;
      updates.customCall = preset.call;
      const defaultArgs: Record<string, any> = {};
      preset.args?.forEach(arg => {
        if (arg.defaultValue !== undefined) {
          defaultArgs[arg.name] = arg.defaultValue;
        }
      });
      updates.args = defaultArgs;
    }

    updateState(updates);
  }, [updateState]);

  const handleArgChange = useCallback((argName: string, value: any) => {
    const currentState = getCurrentState();
    updateState({
      args: { ...currentState.args, [argName]: value }
    });
  }, [getCurrentState, updateState]);

  const handleGoBack = useCallback(() => {
    if (buildingRef.current) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    buildingRef.current = false;
    resetState();
  }, [resetState]);

  
  const getCurrentNetworkKey = useCallback(() => {
    const networkType = typeHandler?.getXcmDiagnostics()?.networkType;
    return networkType || 'unknown';
  }, [typeHandler]);

  
  const buildTransaction = useCallback(async () => {
    if (!api || !state.selectedPreset || buildingRef.current || !mountedRef.current || !typeHandler || !palletResolver) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    buildingRef.current = true;
    updateState({ isBuilding: true });

    try {
      const palletName = state.selectedPreset.id === 'custom' ? state.customPallet : state.selectedPreset.pallet;
      const callName = state.selectedPreset.id === 'custom' ? state.customCall : state.selectedPreset.call;

      if (!palletName || !callName) {
        throw new Error('Pallet and call are required');
      }

      console.log(`🔧 Building transaction: ${palletName}.${callName}`);

      if (signal.aborted || !mountedRef.current) return;

      // Enhanced XCM validation with barrier compliance
      if (state.selectedPreset.id.includes('xcm')) {
        console.log(`🔍 Validating XCM transaction against barriers...`);

        // Get XCM diagnostics
        const diagnostics = typeHandler.getXcmDiagnostics();
        console.log(`📊 Network diagnostics:`, diagnostics);

        // Validate required XCM parameters
        const destValue = state.args.dest;
        const assetValue = state.args.assets;
        const beneficiaryValue = state.args.beneficiary;

        if (!destValue || !assetValue || !beneficiaryValue) {
          throw new Error(
            'Missing required XCM parameters. Please provide: destination, assets, and beneficiary.'
          );
        }

        // Validate destination against barriers
        const sourceKey = getCurrentNetworkKey();
        const validation = typeHandler.validateXcmTransaction(sourceKey, destValue, callName);

        if (!validation.valid) {
          throw new Error(`XCM validation failed: ${validation.warnings.join('; ')}`);
        }

        // Show warnings and suggestions
        if (validation.warnings.length > 0) {
          console.warn(`⚠️ XCM Warnings:`, validation.warnings);
          validation.warnings.forEach(warning => {
            showToast(warning, 'error');
          });
        }

        if (validation.suggestions.length > 0) {
          console.log(`💡 XCM Suggestions:`, validation.suggestions);
          validation.suggestions.forEach(suggestion => {
            showToast(`Suggestion: ${suggestion}`, 'error');
          });
        }

        // Check optimal method
        const optimalMethod = typeHandler.suggestOptimalMethod(sourceKey, destValue);
        if (optimalMethod !== callName) {
          console.warn(`💡 Optimal method: ${optimalMethod} instead of ${callName}`);
          showToast(`Consider using ${optimalMethod} for better reliability`, 'error');
        }

        // Validate asset amount
        const [assetKey, amount] = assetValue.split('|');
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          throw new Error('Invalid asset amount. Must be a positive number.');
        }

        // Check minimum amount based on network
        const networkType = diagnostics.networkType;
        const minAmount = networkType === 'paseo' || networkType === 'westend' ? 0.1 : 1.0;
        if (numAmount < minAmount) {
          throw new Error(
            `Amount too small for ${networkType.toUpperCase()} XCM. Minimum: ${minAmount} tokens.`
          );
        }

        // Validate beneficiary address
        try {
          const { isAddress } = require('@polkadot/util-crypto');
          if (!isAddress(beneficiaryValue)) {
            throw new Error(`Invalid beneficiary address format: ${beneficiaryValue}`);
          }
        } catch (addrError) {
          throw new Error(`Beneficiary address validation failed: ${addrError.message}`);
        }

        console.log(`✅ XCM validation passed for ${sourceKey} -> ${destValue}`);
      }

      // Resolve pallet and call
      const { pallet: actualPallet } = palletResolver.resolvePallet(palletName);
      const actualCall = palletResolver.resolveCall(actualPallet, callName);

      if (signal.aborted || !mountedRef.current) return;

      // Process arguments with enhanced type safety
      const processedArgs: any[] = [];

      if (state.selectedPreset.id === 'custom') {
        Object.values(state.args).forEach(value => {
          if (value !== undefined && value !== '') {
            processedArgs.push(value);
          }
        });
      } else {
        const argDefs = state.selectedPreset.args || [];
        console.log(`🔧 Processing ${argDefs.length} arguments for ${palletName}.${callName}`);

        for (const argDef of argDefs) {
          if (signal.aborted) return;

          const value = state.args[argDef.name];
          if (value === undefined || value === '') {
            console.log(`⏭️ Skipping empty argument: ${argDef.name}`);
            continue;
          }

          try {
            console.log(`🎯 Processing: ${argDef.name} (${argDef.type}) = ${value}`);

            let processedValue;

            // Special handling for XCM types to match Polkadot-js format
            if (argDef.type === 'XcmDestination') {
              processedValue = typeHandler.createXcmLocation(value, false);
            } else if (argDef.type === 'XcmBeneficiary') {
              processedValue = typeHandler.createXcmLocation(value, true);
            } else if (argDef.type === 'XcmAssets') {
              processedValue = typeHandler.createXcmAssets(value);
            } else if (argDef.type === 'XcmWeightLimit') {
              processedValue = typeHandler.createWeightLimit(value);
            } else {
              // For non-XCM types, use standard creation
              processedValue = typeHandler.createType(argDef.type, value);
            }

            if (processedValue === null || processedValue === undefined) {
              console.warn(`⚠️ Processed value is null for ${argDef.name}`);
              continue;
            }

            // For XCM parameters, use the raw object (not a Codec type)
            if (argDef.type.startsWith('Xcm')) {
              // XCM parameters should be plain objects, not Codec types
              processedArgs.push(processedValue);
              console.log(`✅ Added XCM parameter ${argDef.name}:`, processedValue);
            } else {
              // For non-XCM types, ensure we have proper Codec types
              processedArgs.push(processedValue);
              console.log(`✅ Successfully processed ${argDef.name}`);
            }

          } catch (processingError) {
            console.error(`❌ Failed to process ${argDef.name}:`, processingError);
            throw new Error(
              `Failed to process argument '${argDef.name}': ${processingError.message}`
            );
          }
        }
      }

      console.log(`🎯 Final transaction: ${palletName}.${callName}(${processedArgs.length} args)`);

      // Final argument validation
      processedArgs.forEach((arg, index) => {
        const argDef = state.selectedPreset.args?.[index];
        if (arg && typeof arg === 'object' && arg._enum && !arg.toHex && !arg.toU8a) {
          throw new Error(
            `CRITICAL: Argument ${index} (${argDef?.name}) contains type definition instead of value. ` +
            `Transaction will fail.`
          );
        }
      });

      if (signal.aborted || !mountedRef.current) return;

      // Build transaction
      try {
        const tx = actualCall(...processedArgs);
        console.log(`✅ Transaction built successfully`);

        if (signal.aborted || !mountedRef.current) return;
        updateState({ builtTx: tx });

        // Estimate fee with timeout
        try {
          console.log(`💰 Estimating fee...`);
          const info = await Promise.race([
            tx.paymentInfo(senderAccount.address),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Fee estimation timeout')), 5000)
            )
          ]);

          if (mountedRef.current && !signal.aborted) {
            const fee = formatBalance(info.partialFee, {
              withUnit: network.symbol,
              decimals: network.decimals
            });
            console.log(`💰 Estimated fee: ${fee}`);
            updateState({ estimatedFee: fee });
          }
        } catch (feeError) {
          console.warn('Fee estimation failed:', feeError);
          if (mountedRef.current && !signal.aborted) {
            updateState({ estimatedFee: 'Unable to estimate' });
          }
        }

        if (mountedRef.current && !signal.aborted) {
          showToast('Transaction built successfully!', 'success');
        }

      } catch (txBuildError) {
        console.error(`❌ Transaction build failed:`, txBuildError);

        // Enhanced error messages for XCM
        if (txBuildError.message.includes('Cannot map Enum JSON') ||
          txBuildError.message.includes('unable to find \'registry\'')) {
          throw new Error(
            'XCM type creation error: Invalid type definitions detected. ' +
            'This usually indicates incorrect XCM parameter formatting. Please check your inputs.'
          );
        }

        throw txBuildError;
      }

    } catch (error) {
      if (mountedRef.current && !signal.aborted) {
        const message = error instanceof Error ? error.message : 'Transaction build failed';
        showToast(message, 'error');
        console.error('Build error:', error);
      }
    } finally {
      buildingRef.current = false;
      if (mountedRef.current) updateState({ isBuilding: false });
    }
  }, [
    api, state.selectedPreset, state.customPallet, state.customCall, state.args,
    network, senderAccount.address, updateState, showToast, typeHandler,
    palletResolver, getCurrentNetworkKey
  ]);

  
  const signAndSendTransaction = useCallback(async () => {
    if (!state.builtTx || !api || !mountedRef.current) return;

    if (!walletReady) {
      showToast('Wallet extension not available. Please install Polkadot.js extension.', 'error');
      return;
    }

    updateState({ isSigning: true });

    try {
      const injector = await web3FromAddress(senderAccount.address);
      if (!injector || !mountedRef.current) {
        throw new Error("Unable to connect to wallet extension");
      }

      updateState({ isSending: true, isSigning: false });
      const broadcastToastId = showToast('Broadcasting transaction...', 'loading');

      let unsubscribed = false;

      const unsub = await state.builtTx.signAndSend(
        senderAccount.address,
        { signer: injector.signer },
        (result: any) => {
          if (!mountedRef.current || unsubscribed) return;

          updateState({ txHash: result.txHash.toHex() });

          if (result.status.isInBlock) {
            if (broadcastToastId) toast.dismiss(broadcastToastId);
            updateState({ txStatus: 'inBlock' });
            showToast('Transaction included in block!', 'success');
          } else if (result.status.isFinalized) {
            updateState({ txStatus: 'finalized', isSending: false });
            showToast('Transaction finalized successfully!', 'success');
            unsubscribed = true;
            unsub();
          } else if (result.status.isDropped || result.status.isInvalid) {
            updateState({ txStatus: 'error', isSending: false });
            showToast('Transaction failed', 'error');
            unsubscribed = true;
            unsub();
          }

          // Enhanced XCM error handling with official documentation references
          if (result.events?.length > 0) {
            result.events.forEach((event: any) => {
              try {
                console.log('📋 Processing event:', event.event.section, event.event.method);

                if (api.events.system.ExtrinsicFailed.is(event.event)) {
                  const [dispatchError] = event.event.data;
                  let errorMessage = 'Transaction failed';

                  if (dispatchError.isModule) {
                    const decoded = api.registry.findMetaError(dispatchError.asModule);
                    const isXcmError = decoded.section.toLowerCase().includes('xcm');

                    if (isXcmError) {
                      // Enhanced XCM error messages based on official documentation
                      switch (decoded.name) {
                        case 'Filtered':
                          errorMessage = `❌ XCM FILTERED ERROR

🔍 Root Cause: The destination chain's barrier configuration rejected this transaction.

📚 Official Barrier Types (Reference: Polkadot Academy):
• TakeWeightCredit - Allows paid execution
• AllowTopLevelPaidExecutionFrom - Requires BuyExecution/PayFees
• AllowUnpaidExecutionFrom - Only for trusted system parachains
• AllowKnownQueryResponses - For query responses only

🔧 SOLUTIONS:
1. **Wrong Method**: Use ${typeHandler?.suggestOptimalMethod(getCurrentNetworkKey(), state.args.dest || '') || 'limitedTeleportAssets'} instead
2. **Trust Issue**: Destination doesn't trust source for this operation
3. **Fee Payment**: Ensure proper fee asset is included (native token)
4. **Amount Too Small**: Use minimum 0.1 tokens for testnets, 1.0 for mainnet
5. **Barrier Rules**: Operation violates destination chain's security policies

💡 **Best Practice**: Use Asset Hub as intermediate hop for complex routes.`;
                          break;

                        case 'Unreachable':
                          errorMessage = `❌ XCM UNREACHABLE ERROR

🔍 Root Cause: No communication path to destination chain.

📚 XCM Transport (Reference: Polkadot Wiki):
• VMP (Vertical): Relay ↔ Parachain ✅
• HRMP (Horizontal): Parachain ↔ Parachain (requires channels)
• XCMP: Still in development, using HRMP instead

🔧 SOLUTIONS:
1. **Missing HRMP Channels**: Direct para-to-para requires open channels
2. **Inactive Destination**: Parachain may be offline or deregistered
3. **Network Mismatch**: Ensure both chains are on same relay chain
4. **Route Through Hub**: Use Asset Hub as intermediate destination

💡 **Workaround**: Most para-to-para goes through relay chain automatically.`;
                          break;

                        case 'NotTrusted':
                          errorMessage = `❌ XCM NOT TRUSTED ERROR

🔍 Root Cause: Chains don't have trust relationship for teleport.

📚 Trust Configuration (Reference: Rococo Runtime):
• TrustedTeleporters defined in runtime
• System parachains (1000-1005) generally trusted
• Regular parachains require explicit trust setup

🔧 SOLUTION:
**Use Reserve Transfer** instead of Teleport for untrusted relationships.`;
                          break;

                        case 'AssetNotFound':
                          errorMessage = `❌ XCM ASSET NOT FOUND

🔧 SOLUTIONS:
1. Use 'native' instead of specific asset ID
2. Ensure asset is registered on both chains
3. Check Asset Hub registry for foreign assets`;
                          break;

                        case 'BadVersion':
                          errorMessage = `❌ XCM VERSION ERROR

🔧 SOLUTION:
Chain uses different XCM version. Transaction may need simpler format.`;
                          break;

                        default:
                          errorMessage = `❌ XCM Error (${decoded.name}): ${decoded.docs.join(' ')}

🔧 General XCM Troubleshooting:
1. Check barrier configuration compatibility
2. Verify trust relationships
3. Ensure proper fee payment
4. Use Asset Hub for complex routes
5. Try ${typeHandler?.suggestOptimalMethod(getCurrentNetworkKey(), state.args.dest || '') || 'different method'}

📚 Reference: https://docs.polkadot.com/learn/xcm/`;
                      }
                    } else {
                      errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`;
                    }

                    console.error(`❌ Detailed error:`, {
                      section: decoded.section,
                      name: decoded.name,
                      docs: decoded.docs,
                      isXcmError
                    });
                  }

                  showToast(errorMessage, 'error');
                  updateState({ txStatus: 'error', isSending: false });
                  unsubscribed = true;
                  unsub();
                }

                // Log successful XCM events
                if (event.event.section.includes('Xcm') || event.event.section === 'XcmPallet') {
                  if (event.event.method === 'Attempted') {
                    console.log('✅ XCM execution attempted:', event.event.data.toHuman());
                  } else if (event.event.method === 'Sent') {
                    console.log('✅ XCM message sent:', event.event.data.toHuman());
                  }
                }

              } catch (eventError) {
                console.warn('Event processing error:', eventError);
              }
            });
          }
        }
      );

      // Timeout protection
      setTimeout(() => {
        if (!unsubscribed && mountedRef.current) {
          try { unsub(); } catch { }
        }
      }, 300000); // 5 minutes

    } catch (error) {
      if (mountedRef.current) {
        let message = error instanceof Error ? error.message : 'Error sending transaction';

        if (message.includes('User rejected')) {
          message = 'Transaction cancelled by user';
        } else if (message.includes('1014: Priority is too low')) {
          message = 'Transaction fee too low. Try increasing the amount or wait for lower network congestion.';
        }

        showToast(message, 'error');
        updateState({ isSigning: false, isSending: false });
        console.error('Transaction error:', error);
      }
    }
  }, [
    state.builtTx, state.args, api, senderAccount.address, updateState,
    walletReady, showToast, typeHandler, getCurrentNetworkKey
  ]);

  
  const containerClasses = useMemo(() => {
    const base = "transition-all duration-500 ease-in-out";
    return isFullscreen || isExpanded
      ? `${base} fixed inset-4 z-50 max-h-[calc(100vh-2rem)] overflow-y-auto`
      : `${base} relative`;
  }, [isFullscreen, isExpanded]);

  const cardClasses = useMemo(() => {
    const base = "relative transition-all duration-500 ease-in-out bg-theme-surface border-2 border-theme backdrop-blur-xl shadow-2xl network-transition";
    return isExpanded
      ? `${base} p-8 border-network-primary/50`
      : `${base} p-6 hover:border-network-primary/50`;
  }, [isExpanded]);

  const phaseDescriptions = {
    selection: 'Choose your transaction type to get started',
    configuration: 'Configure transaction parameters with barrier compliance',
    review: 'Review transaction details and XCM validation',
    status: 'Monitor transaction status and XCM execution'
  };

  
  const StatusIndicator: React.FC<{ isReady: boolean; title: string; subtitle?: string }> = ({
    isReady, title, subtitle
  }) => (
    <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-300 
               hover:shadow-lg network-transition cursor-pointer group ${isReady
        ? 'bg-green-50/80 dark:bg-green-900/40 border-green-200/70 dark:border-green-600/70'
        : 'bg-yellow-50/80 dark:bg-yellow-900/40 border-yellow-200/70 dark:border-yellow-600/70'
      }`}>
      <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
      <div className="flex-1">
        <div className={`font-medium text-sm ${isReady
          ? 'text-green-700 dark:text-green-300'
          : 'text-yellow-700 dark:text-yellow-300'
          }`}>
          {title}
        </div>
        {subtitle && (
          <div className={`text-xs mt-1 ${isReady
            ? 'text-green-600 dark:text-green-400'
            : 'text-yellow-600 dark:text-yellow-400'
            }`}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  const ActionButton: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'success' | 'error';
    children: React.ReactNode;
    className?: string;
  }> = ({ onClick, disabled, loading, variant = 'primary', children, className = '' }) => {
    const variants = {
      primary: 'bg-network-primary hover:bg-network-secondary text-white',
      secondary: 'bg-theme-surface-variant hover:bg-theme-surface border border-theme text-theme-primary',
      success: 'bg-green-500 hover:bg-green-600 text-white',
      error: 'bg-red-500 hover:bg-red-600 text-white'
    };

    return (
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        className={`w-full h-12 rounded-lg font-medium transition-all duration-300 
               hover:scale-[1.02] active:scale-[0.98] 
               disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed
               shadow-lg hover:shadow-xl network-transition
               ${variants[variant]} ${className}`}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white 
                    rounded-full animate-spin mr-2" />
        )}
        {children}
      </Button>
    );
  };

  const StatusMessage: React.FC<{
    type: 'success' | 'error';
    title: string;
    subtitle: string;
    children?: React.ReactNode;
  }> = ({ type, title, subtitle, children }) => (
    <div className={`p-6 rounded-lg text-center backdrop-blur-sm transition-all duration-300
               border shadow-lg hover:shadow-xl
               ${type === 'success'
        ? 'bg-green-50/80 dark:bg-green-900/40 border-green-200/70 dark:border-green-600/70'
        : 'bg-red-50/80 dark:bg-red-900/40 border-red-200/70 dark:border-red-600/70'
      }`}>
      <div className="flex items-center justify-center space-x-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                   ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <span className="text-lg text-white font-bold">
            {type === 'success' ? '✓' : '✕'}
          </span>
        </div>
        <div className="text-left">
          <p className={`text-base font-bold ${type === 'success'
            ? 'text-green-700 dark:text-green-300'
            : 'text-red-700 dark:text-red-300'
            }`}>
            {title}
          </p>
          <p className={`text-sm ${type === 'success'
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
            }`}>
            {subtitle}
          </p>
        </div>
      </div>
      {children}
    </div>
  );

  const InfoCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4 rounded-lg border border-theme bg-theme-surface-variant/50 backdrop-blur-sm">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-network-primary/20 flex items-center justify-center">
          <Info className="w-4 h-4 text-network-primary" />
        </div>
        <h3 className="text-sm font-medium text-theme-primary">
          XCM Cross-Chain Support
        </h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className={containerClasses}>
      <Card className={cardClasses}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {isExpanded && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoBack}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg 
                       bg-theme-surface border-theme 
                       hover:bg-theme-surface-variant hover:border-network-primary
                       transition-all duration-300 shadow-sm hover:shadow-md
                       text-theme-secondary hover:text-theme-primary
                       network-transition font-medium group"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                  <span>Back</span>
                </Button>
              )}
              <div>
                <h2 className="text-xl font-bold flex items-center space-x-3 text-theme-primary">
                  <div className="w-8 h-8 rounded-lg bg-network-primary flex items-center justify-center shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span>Transaction Builder</span>
                </h2>
                <p className="text-sm text-theme-secondary mt-1 font-medium">
                  {phaseDescriptions[currentPhase]}
                </p>
              </div>
            </div>

            {(isExpanded || isFullscreen) && onMinimize && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMinimize}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg
                     bg-theme-surface border-theme 
                     hover:bg-red-50/80 dark:hover:bg-red-900/40
                     hover:border-red-300/70 dark:hover:border-red-600/70
                     transition-all duration-300 shadow-sm hover:shadow-md
                     text-theme-secondary hover:text-red-500
                     network-transition group"
              >
                <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            )}
          </div>

          <StatusIndicator
            isReady={walletReady}
            title={walletReady ? 'Wallet Connected' : 'Wallet Extension Required'}
            subtitle={walletReady ? 'Ready for transactions' : 'Install Polkadot.js extension'}
          />

          {(currentPhase === 'selection' || state.selectedPreset?.id?.includes('xcm')) && (
            <div className="mt-4">
              <InfoCard>
                <p className="text-sm text-theme-secondary leading-relaxed font-medium
                       group-hover:text-theme-primary transition-colors duration-300">
                  Advanced XCM transactions available: Reserve Transfer, Teleport, HRMP channels, and XCMP messages.
                </p>
                <div className="mt-2 text-xs text-theme-secondary">
                  <strong>Network:</strong> {typeHandler?.getXcmDiagnostics()?.networkType?.toUpperCase() || 'Detecting...'} |
                  <strong> Available Destinations:</strong> {typeHandler?.getXcmDiagnostics()?.validDestinations?.length || 0}
                </div>
              </InfoCard>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mb-6">
            <ProgressSteps steps={steps} />
          </div>
        )}

        <div className="space-y-6">
          {!state.selectedPreset && (
            <PresetSelector presets={TRANSACTION_PRESETS} onSelect={handlePresetSelect} />
          )}

          {state.selectedPreset && !state.builtTx && (
            <TransactionConfig
              preset={state.selectedPreset}
              customPallet={state.customPallet}
              customCall={state.customCall}
              args={state.args}
              availablePallets={availablePallets}
              availableCalls={availableCalls}
              network={network}
              isBuilding={state.isBuilding}
              onCustomPalletChange={(pallet) => updateState({ customPallet: pallet })}
              onCustomCallChange={(call) => updateState({ customCall: call })}
              onArgChange={handleArgChange}
              onBuild={buildTransaction}
              onReset={handleGoBack}
            />
          )}

          {state.builtTx && !state.txHash && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg 
                        bg-theme-surface-variant border border-theme backdrop-blur-sm 
                        shadow-lg hover:shadow-xl hover:border-network-primary/50
                        transition-all duration-300 ease-out network-transition">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-network-primary to-network-secondary 
                            rounded-full opacity-90 shadow-lg"></div>
                  <h3 className="text-lg font-bold text-theme-primary">
                    Review Transaction
                  </h3>
                </div>
                <Button
                  variant="outline"
                  onClick={handleGoBack}
                  size="sm"
                  className="px-4 py-2 rounded-lg font-medium
                       bg-theme-surface border border-theme 
                       hover:bg-theme-surface-variant hover:border-network-primary
                       active:scale-95 transition-all duration-300
                       shadow-md hover:shadow-lg
                       text-theme-secondary hover:text-network-primary
                       network-transition group"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Rebuild</span>
                  </span>
                </Button>
              </div>

              <TransactionReview
                senderAddress={senderAccount.address}
                pallet={state.customPallet || state.selectedPreset?.pallet || ''}
                call={state.customCall || state.selectedPreset?.call || ''}
                args={state.args}
                estimatedFee={state.estimatedFee}
                presetId={state.selectedPreset?.id}
              />

              <ActionButton
                onClick={signAndSendTransaction}
                disabled={!walletReady}
                loading={state.isSigning || state.isSending}
                variant="primary"
              >
                {!walletReady ? (
                  'Wallet Required'
                ) : state.isSigning ? (
                  'Signing Transaction...'
                ) : state.isSending ? (
                  'Broadcasting...'
                ) : (
                  'Sign & Send Transaction'
                )}
              </ActionButton>
            </div>
          )}

          {state.txHash && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 rounded-lg 
                        bg-theme-surface-variant border border-theme backdrop-blur-sm 
                        network-transition shadow-lg hover:shadow-xl
                        hover:border-network-primary/50 transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-theme-surface-variant flex items-center justify-center
                           hover:bg-network-primary/20 transition-colors duration-300 shadow-md">
                  <svg className="w-4 h-4 text-network-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-theme-primary">Transaction Status</h3>
              </div>

              <TransactionStatus txHash={state.txHash} txStatus={state.txStatus} />

              {state.txStatus === 'finalized' && (
                <div className="space-y-4">
                  <StatusMessage
                    type="success"
                    title="Transaction Completed Successfully!"
                    subtitle="Your transaction has been finalized on the blockchain"
                  />
                  <ActionButton
                    onClick={handleGoBack}
                    variant="success"
                    className="group"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span className="transition-transform duration-300 group-hover:rotate-12">✨</span>
                      <span>Create New Transaction</span>
                    </span>
                  </ActionButton>
                </div>
              )}

              {(state.txStatus === 'error' || state.txStatus === 'dropped') && (
                <div className="space-y-4">
                  <StatusMessage
                    type="error"
                    title="Transaction Failed"
                    subtitle="Check the error details above for troubleshooting guidance"
                  />
                  <ActionButton
                    onClick={handleGoBack}
                    variant="error"
                    className="group"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span className="transition-transform duration-300 group-hover:rotate-180">🔄</span>
                      <span>Try Again</span>
                    </span>
                  </ActionButton>
                </div>
              )}
            </div>
          )}

          {(currentPhase === 'selection' || currentPhase === 'configuration') && (
            <div className="mt-6">
              <XcmNetworkStatus network={network} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default React.memo(TransactionBuilder);