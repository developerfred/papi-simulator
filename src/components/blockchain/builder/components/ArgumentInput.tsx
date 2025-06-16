/* eslint-disable @typescript-eslint/no-explicit-any, react/display-name,  @typescript-eslint/no-unused-vars */

import React, { useMemo } from "react";
import type { TransactionArg } from "../types/transaction.types";


import { networkManager, type Network as NetworkConfig } from "../../dynamic-blockchain-config";

interface ArgumentInputProps {
  arg: TransactionArg;
  value: any;
  onChange: (name: string, value: any) => void;
  networkSymbol: string;
  selectedNetwork?: NetworkConfig;
}

// Input Base Component
const InputBase: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`w-full ${className}`}>{children}</div>
);

// Label Component
const InputLabel: React.FC<{
  arg: TransactionArg;
}> = ({ arg }) => (
  <label className="block text-sm font-semibold mb-2 text-theme-primary">
    {arg.name}
    {arg.required && (
      <span className="text-red-500 dark:text-red-400 ml-1 text-base">*</span>
    )}
  </label>
);

// Description Component
const InputDescription: React.FC<{ description: string }> = ({ description }) => (
  <div className="text-xs font-medium text-theme-tertiary mb-3 leading-relaxed">
    {description}
  </div>
);

// Enhanced Help Text Component
const HelpText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-3 p-3 rounded-lg bg-theme-surface-variant border border-theme 
                transition-all duration-200 hover:bg-theme-surface">
    <div className="text-xs text-theme-secondary space-y-1">
      {children}
    </div>
  </div>
);

// Network Status Indicator
const NetworkStatusIndicator: React.FC<{ network: NetworkConfig }> = ({ network }) => {
  const statusColors = {
    live: 'bg-green-500',
    testing: 'bg-yellow-500',
    deprecated: 'bg-red-500'
  };

  return (
    <div className="flex items-center space-x-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${statusColors[network.status]}`} />
      <span className="text-theme-secondary">
        {network.status === 'live' ? 'Live Network' : network.status === 'testing' ? 'Testing' : 'Deprecated'}
      </span>
    </div>
  );
};

export const ArgumentInput: React.FC<ArgumentInputProps> = React.memo(({
  arg,
  value,
  onChange,
  networkSymbol,
  selectedNetwork
}) => {
  const baseInputClasses = `
    w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
    bg-theme-surface border-theme text-theme-primary
    placeholder:text-theme-tertiary
    focus:outline-none focus:ring-2 focus:ring-network-primary/30 focus:border-network-primary
    hover:border-network-primary/50 hover:shadow-sm
    disabled:opacity-50 disabled:cursor-not-allowed
    network-transition font-medium
  `;

  const textareaClasses = `
    ${baseInputClasses} resize-y min-h-[80px] font-mono text-sm leading-relaxed
  `;

  const selectClasses = `
    ${baseInputClasses} cursor-pointer
  `;

  const inputProps = {
    value: value || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(arg.name, e.target.value),
    className: baseInputClasses
  };

  // Dynamic XCM destinations based on selected network
  const xcmDestinations = useMemo(() => {
    const networkGroups = networkManager.getNetworkGroups();

    // Filter based on current network context
    const getCurrentNetworkType = () => {
      if (!selectedNetwork) return 'all';

      if (selectedNetwork.relay === 'Polkadot' || selectedNetwork.name === 'Polkadot') return 'polkadot';
      if (selectedNetwork.relay === 'Kusama' || selectedNetwork.name === 'Kusama') return 'kusama';
      if (selectedNetwork.relay === 'Paseo' || selectedNetwork.name === 'Paseo') return 'paseo';
      if (selectedNetwork.name === 'Westend') return 'westend';

      return 'all';
    };

    const currentNetworkType = getCurrentNetworkType();

    return {
      groups: networkGroups,
      compatible: currentNetworkType,
      filteredGroups: Object.fromEntries(
        Object.entries(networkGroups).filter(([groupName, networks]) => {
          if (currentNetworkType === 'all') return true;

          // Show compatible networks for XCM
          if (currentNetworkType === 'polkadot') {
            return groupName.includes('Polkadot') || groupName === 'Relay Chains';
          }
          if (currentNetworkType === 'kusama') {
            return groupName.includes('Kusama') || groupName === 'Relay Chains';
          }
          if (currentNetworkType === 'paseo') {
            return groupName.includes('Paseo') || groupName === 'Relay Chains';
          }

          return true;
        })
      )
    };
  }, [selectedNetwork]);

  // Dynamic asset options based on network
  const availableAssets = useMemo(() => {
    if (!selectedNetwork) {
      return [
        { key: 'native', name: `Native Token (${networkSymbol})`, symbol: networkSymbol },
        { key: 'usdt', name: 'USDT (Tether)', symbol: 'USDT' },
        { key: 'usdc', name: 'USDC (USD Coin)', symbol: 'USDC' }
      ];
    }

    const baseAssets = [
      { key: 'native', name: `Native Token (${selectedNetwork.symbol})`, symbol: selectedNetwork.symbol }
    ];

    // Add network-specific assets
    if (selectedNetwork.relay === 'Polkadot' || selectedNetwork.name === 'Polkadot') {
      baseAssets.push(
        { key: 'usdt', name: 'USDT (Tether)', symbol: 'USDT' },
        { key: 'usdc', name: 'USDC (USD Coin)', symbol: 'USDC' },
        { key: 'aca', name: 'ACA (Acala)', symbol: 'ACA' },
        { key: 'glmr', name: 'GLMR (Moonbeam)', symbol: 'GLMR' },
        { key: 'astr', name: 'ASTR (Astar)', symbol: 'ASTR' },
        { key: 'hdx', name: 'HDX (HydraDX)', symbol: 'HDX' },
        { key: 'pha', name: 'PHA (Phala)', symbol: 'PHA' }
      );
    } else if (selectedNetwork.relay === 'Kusama' || selectedNetwork.name === 'Kusama') {
      baseAssets.push(
        { key: 'kar', name: 'KAR (Karura)', symbol: 'KAR' },
        { key: 'movr', name: 'MOVR (Moonriver)', symbol: 'MOVR' },
        { key: 'sdn', name: 'SDN (Shiden)', symbol: 'SDN' },
        { key: 'bnc', name: 'BNC (Bifrost)', symbol: 'BNC' },
        { key: 'bsx', name: 'BSX (Basilisk)', symbol: 'BSX' },
        { key: 'kint', name: 'KINT (Kintsugi)', symbol: 'KINT' }
      );
    } else if (selectedNetwork.relay === 'Paseo' || selectedNetwork.name === 'Paseo') {
      baseAssets.push(
        { key: 'ajun', name: 'AJUN (Ajuna)', symbol: 'AJUN' },
        { key: 'ampe', name: 'AMPE (Amplitude)', symbol: 'AMPE' },
        { key: 'frqcy', name: 'FRQCY (Frequency)', symbol: 'FRQCY' },
        { key: 'teer', name: 'TEER (Integritee)', symbol: 'TEER' },
        { key: 'pop', name: 'POP (POP Network)', symbol: 'POP' },
        { key: 'ztg', name: 'ZTG (Zeitgeist)', symbol: 'ZTG' }
      );
    }

    return baseAssets;
  }, [selectedNetwork, networkSymbol]);

  const renderInput = () => {
    switch (arg.type) {
      case 'Vec<AccountId>':
        return (
          <InputBase>
            <textarea
              {...inputProps}
              placeholder="Enter one address per line&#10;5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY&#10;5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"
              className={textareaClasses}
              rows={4}
            />
            <HelpText>
              <p><strong>Format:</strong> One Substrate address per line</p>
              <p><strong>Example:</strong> ss58 encoded addresses starting with 1, 5, or other prefixes</p>
              {selectedNetwork && (
                <p><strong>Network SS58 Format:</strong> {selectedNetwork.ss58Format}</p>
              )}
            </HelpText>
          </InputBase>
        );

      case 'RewardDestination':
        return (
          <InputBase>
            <select {...inputProps} className={selectClasses}>
              <option value="">Select reward destination</option>
              <option value="Staked">Staked - Automatically stake rewards</option>
              <option value="Stash">Stash - Send to stash account</option>
              <option value="Controller">Controller - Send to controller account</option>
            </select>
            <HelpText>
              <p><strong>Staked:</strong> Rewards are automatically added to your stake</p>
              <p><strong>Stash/Controller:</strong> Rewards sent to specified account</p>
            </HelpText>
          </InputBase>
        );

      case 'XcmDestination':
        return (
          <InputBase>
            <select {...inputProps} className={selectClasses}>
              <option value="">Select destination chain</option>

              {Object.entries(xcmDestinations.filteredGroups).map(([groupName, networks]) => (
                <optgroup key={groupName} label={groupName}>
                  {networks.map((network) => (
                    <option
                      key={network.name}
                      value={network.name.toLowerCase().replace(/\s+/g, '_')}
                    >
                      {network.name}
                      {network.parachainId ? ` (Para ID: ${network.parachainId})` : ''}
                      {network.status !== 'live' ? ` [${network.status.toUpperCase()}]` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <HelpText>
              {selectedNetwork && (
                <>
                  <p><strong>Current Network:</strong> {selectedNetwork.name} ({selectedNetwork.symbol})</p>
                  <NetworkStatusIndicator network={selectedNetwork} />
                </>
              )}
              <p><strong>XCM Compatibility:</strong> {xcmDestinations.compatible === 'all' ? 'All networks' : `${xcmDestinations.compatible} ecosystem`}</p>
              <p><strong>Note:</strong> Only compatible networks are shown for cross-chain transfers</p>
            </HelpText>
          </InputBase>
        );

      case 'XcmBeneficiary':
        return (
          <InputBase>
            <input
              {...inputProps}
              type="text"
              placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
              className={baseInputClasses}
            />
            <HelpText>
              <p><strong>Format:</strong> Destination account address in ss58 format</p>
              {selectedNetwork && (
                <>
                  <p><strong>Current Network SS58:</strong> {selectedNetwork.ss58Format}</p>
                  <p><strong>Network:</strong> {selectedNetwork.name}</p>
                </>
              )}
              <p><strong>Note:</strong> Address format may vary by destination chain</p>
            </HelpText>
          </InputBase>
        );

      case 'XcmAssets':
        return (
          <InputBase>
            <div className="space-y-3">
              {/* Network Context Banner */}
              {selectedNetwork && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-network-primary/10 border border-network-primary/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-network-primary/20 flex items-center justify-center">
                      <span className="text-network-primary text-xs font-bold">{selectedNetwork.symbol}</span>
                    </div>
                    <span className="text-sm font-medium text-network-primary">
                      {selectedNetwork.name} Network
                    </span>
                  </div>
                  <NetworkStatusIndicator network={selectedNetwork} />
                </div>
              )}

              {/* Asset Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-2">
                    Asset Type
                  </label>
                  <select
                    value={value?.split('|')[0] || ''}
                    onChange={(e) => {
                      const amount = value?.split('|')[1] || '';
                      onChange(arg.name, e.target.value ? `${e.target.value}|${amount}` : '');
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border-2 transition-all duration-300
                             bg-theme-surface border-theme text-theme-primary text-sm
                             focus:outline-none focus:ring-2 focus:ring-network-primary/30 focus:border-network-primary
                             hover:border-network-primary/50 network-transition cursor-pointer"
                  >
                    <option value="">Select Asset</option>
                    {availableAssets.map((asset) => (
                      <option key={asset.key} value={asset.key}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Input - Enhanced */}
                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={value?.split('|')[1] || ''}
                      onChange={(e) => {
                        const asset = value?.split('|')[0] || '';
                        onChange(arg.name, asset ? `${asset}|${e.target.value}` : '');
                      }}
                      placeholder="0.0"
                      className="w-full px-3 py-2.5 pr-16 rounded-lg border-2 transition-all duration-300
                               bg-theme-surface border-theme text-theme-primary text-sm font-medium
                               placeholder:text-theme-tertiary text-right
                               focus:outline-none focus:ring-2 focus:ring-network-primary/30 focus:border-network-primary
                               hover:border-network-primary/50 network-transition"
                    />
                    {value?.split('|')[0] && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md 
                                       bg-theme-surface-variant text-theme-secondary text-xs font-bold">
                          {(() => {
                            const assetKey = value.split('|')[0];
                            if (assetKey === 'native') {
                              return selectedNetwork?.symbol || networkSymbol;
                            }
                            const asset = availableAssets.find(a => a.key === assetKey);
                            return asset?.symbol || assetKey.toUpperCase();
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex space-x-2">
                <span className="text-xs text-theme-secondary self-center">Quick:</span>
                {['0.1', '1', '10', '100'].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      const asset = value?.split('|')[0] || 'native';
                      onChange(arg.name, `${asset}|${amount}`);
                    }}
                    className="px-3 py-1 rounded-lg border border-theme text-theme-secondary
                             hover:border-network-primary hover:text-network-primary
                             transition-all duration-200 text-xs font-medium
                             hover:bg-network-primary/5"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            <HelpText>
              <p><strong>Format:</strong> Select asset type and enter amount</p>
              {selectedNetwork && (
                <>
                  <p><strong>Network:</strong> {selectedNetwork.name} ({selectedNetwork.symbol})</p>
                  <p><strong>Decimals:</strong> {selectedNetwork.decimals}</p>
                </>
              )}
              <p><strong>Current Input:</strong> {value || 'No asset selected'}</p>
              <p><strong>Available Assets:</strong> {availableAssets.length} assets for this network</p>
            </HelpText>
          </InputBase>
        );

      case 'XcmWeightLimit':
        return (
          <InputBase>
            <select {...inputProps} className={selectClasses}>
              <option value="">Select weight limit</option>
              <option value="Unlimited">Unlimited (recommended)</option>
              <option value="5000000000">Limited - 5B ref_time</option>
              <option value="10000000000">Limited - 10B ref_time</option>
              <option value="20000000000">Limited - 20B ref_time</option>
              <option value="50000000000">Limited - 50B ref_time</option>
            </select>
            <HelpText>
              <p><strong>Unlimited:</strong> Let the destination chain determine fees (recommended)</p>
              <p><strong>Limited:</strong> Set maximum computational resources to use</p>
              {selectedNetwork?.type === 'testnet' && (
                <p><strong>Testnet Note:</strong> Use conservative limits for testing</p>
              )}
            </HelpText>
          </InputBase>
        );

      case 'XcmMessage':
        return (
          <InputBase>
            <textarea
              {...inputProps}
              placeholder='{"V4": [{"WithdrawAsset": {"id": {"interior": "Here"}, "fun": {"Fungible": "1000000000000"}}}]}'
              className={`${textareaClasses} min-h-[120px]`}
              rows={6}
            />
            <HelpText>
              <p><strong>Format:</strong> XCM message in JSON format</p>
              <p><strong>Version:</strong> Use V4 for latest features</p>
              <p><strong>Instructions:</strong> WithdrawAsset, BuyExecution, DepositAsset, etc.</p>
              {selectedNetwork && (
                <p><strong>Network Context:</strong> {selectedNetwork.name} - {selectedNetwork.type}</p>
              )}
            </HelpText>
          </InputBase>
        );

      case 'Balance':
        return (
          <InputBase>
            <div className="space-y-3">
              {/* Network Context Banner */}
              {selectedNetwork && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-network-primary/10 border border-network-primary/20">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-network-primary">
                      {selectedNetwork.name}
                    </span>
                    <span className="text-xs text-theme-secondary">
                      Decimals: {selectedNetwork.decimals}
                    </span>
                  </div>
                  <NetworkStatusIndicator network={selectedNetwork} />
                </div>
              )}

              {/* Enhanced Amount Input */}
              <div className="relative">
                <input
                  {...inputProps}
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0.0"
                  className="w-full px-4 py-4 pr-20 rounded-xl border-2 transition-all duration-300
                           bg-theme-surface border-theme text-theme-primary text-xl font-semibold
                           placeholder:text-theme-tertiary text-right
                           focus:outline-none focus:ring-2 focus:ring-network-primary/30 focus:border-network-primary
                           hover:border-network-primary/50 hover:shadow-sm
                           network-transition"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="inline-flex items-center px-3 py-2 rounded-lg 
                                 bg-network-primary/10 text-network-primary text-sm font-bold
                                 border border-network-primary/20">
                    {selectedNetwork?.symbol || networkSymbol}
                  </span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {['0.1', '1', '10', '100'].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => onChange(arg.name, amount)}
                    className="px-3 py-2 rounded-lg border-2 border-theme text-theme-secondary
                             hover:border-network-primary hover:text-network-primary
                             hover:bg-network-primary/5 transition-all duration-200 
                             text-sm font-semibold network-transition"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            <HelpText>
              <p><strong>Amount:</strong> Enter the number of {selectedNetwork?.symbol || networkSymbol} tokens to transfer</p>
              <p><strong>Format:</strong> Decimal numbers supported (e.g., 10.5)</p>
              {selectedNetwork && (
                <>
                  <p><strong>Network:</strong> {selectedNetwork.name}</p>
                  <p><strong>Precision:</strong> {selectedNetwork.decimals} decimal places</p>
                </>
              )}
            </HelpText>
          </InputBase>
        );

      case 'u32':
        return (
          <InputBase>
            <input
              {...inputProps}
              type="number"
              step="1"
              min="0"
              max="4294967295"
              placeholder="Enter positive integer"
              className={baseInputClasses}
            />
            <HelpText>
              <p><strong>Range:</strong> 0 to 4,294,967,295</p>
              <p><strong>Format:</strong> Positive integer only</p>
              {selectedNetwork?.parachainId && (
                <p><strong>Example:</strong> Parachain ID for {selectedNetwork.name} is {selectedNetwork.parachainId}</p>
              )}
            </HelpText>
          </InputBase>
        );

      case 'u128':
        return (
          <InputBase>
            <input
              {...inputProps}
              type="number"
              step="1"
              min="0"
              placeholder="Enter large positive integer"
              className={baseInputClasses}
            />
            <HelpText>
              <p><strong>Range:</strong> 0 to very large numbers (128-bit)</p>
              <p><strong>Use case:</strong> Large amounts or IDs</p>
            </HelpText>
          </InputBase>
        );

      case 'AccountId':
        return (
          <InputBase>
            <input
              {...inputProps}
              type="text"
              placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
              className={baseInputClasses}
            />
            <HelpText>
              <p><strong>Format:</strong> Substrate account address (ss58)</p>
              {selectedNetwork && (
                <>
                  <p><strong>Network SS58 Format:</strong> {selectedNetwork.ss58Format}</p>
                  <p><strong>Network:</strong> {selectedNetwork.name}</p>
                </>
              )}
              <p><strong>Validation:</strong> Starts with 1, 5, or other network prefix</p>
            </HelpText>
          </InputBase>
        );

      case 'Proposal':
        return (
          <InputBase>
            <input
              {...inputProps}
              type="text"
              placeholder="0x1234567890abcdef..."
              className={`${baseInputClasses} font-mono`}
            />
            <HelpText>
              <p><strong>Format:</strong> Proposal hash in hex format</p>
              <p><strong>Prefix:</strong> Must start with 0x</p>
              {selectedNetwork?.features?.includes('Governance') && (
                <p><strong>Network Support:</strong> {selectedNetwork.name} supports governance proposals</p>
              )}
            </HelpText>
          </InputBase>
        );

      default:
        return (
          <InputBase>
            <input
              {...inputProps}
              type="text"
              placeholder={`Enter ${arg.name.toLowerCase()}`}
              className={baseInputClasses}
            />
            <HelpText>
              <p><strong>Type:</strong> {arg.type}</p>
              <p><strong>Description:</strong> {arg.description}</p>
              {selectedNetwork && (
                <p><strong>Network:</strong> {selectedNetwork.name} ({selectedNetwork.symbol})</p>
              )}
            </HelpText>
          </InputBase>
        );
    }
  };

  return (
    <div className="space-y-1">
      <InputLabel arg={arg} />
      <InputDescription description={arg.description} />
      {renderInput()}
    </div>
  );
});