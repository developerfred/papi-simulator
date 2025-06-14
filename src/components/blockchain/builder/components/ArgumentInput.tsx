/* eslint-disable @typescript-eslint/no-explicit-any, react/display-name */

import React from "react";
import type { TransactionArg } from "../types/transaction.types";

interface ArgumentInputProps {
  arg: TransactionArg;
  value: any;
  onChange: (name: string, value: any) => void;
  networkSymbol: string;
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

export const ArgumentInput: React.FC<ArgumentInputProps> = React.memo(({
  arg,
  value,
  onChange,
  networkSymbol
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

              <optgroup label="Relay Chains">
                <option value="polkadot">Polkadot Relay Chain</option>
                <option value="kusama">Kusama Relay Chain</option>
                <option value="paseo">Paseo Testnet Relay</option>
                <option value="westend">Westend Testnet Relay</option>
              </optgroup>

              <optgroup label="System Parachains">
                <option value="polkadot_asset_hub">Polkadot Asset Hub (Para ID: 1000)</option>
                <option value="polkadot_collectives">Polkadot Collectives (Para ID: 1001)</option>
                <option value="polkadot_bridge_hub">Polkadot Bridge Hub (Para ID: 1002)</option>
                <option value="kusama_asset_hub">Kusama Asset Hub (Para ID: 1000)</option>
                <option value="kusama_bridge_hub">Kusama Bridge Hub (Para ID: 1002)</option>
              </optgroup>

              <optgroup label="Polkadot Parachains">
                <option value="acala">Acala (Para ID: 2000)</option>
                <option value="moonbeam">Moonbeam (Para ID: 2004)</option>
                <option value="astar">Astar (Para ID: 2006)</option>
                <option value="parallel">Parallel (Para ID: 2012)</option>
                <option value="centrifuge">Centrifuge (Para ID: 2031)</option>
                <option value="interlay">Interlay (Para ID: 2032)</option>
                <option value="hydradx">HydraDX (Para ID: 2034)</option>
                <option value="phala">Phala Network (Para ID: 2035)</option>
              </optgroup>

              <optgroup label="Kusama Parachains">
                <option value="karura">Karura (Para ID: 2000)</option>
                <option value="moonriver">Moonriver (Para ID: 2023)</option>
                <option value="shiden">Shiden (Para ID: 2007)</option>
                <option value="khala">Khala Network (Para ID: 2004)</option>
                <option value="basilisk">Basilisk (Para ID: 2090)</option>
                <option value="kintsugi">Kintsugi (Para ID: 2092)</option>
              </optgroup>

              <optgroup label="Paseo Testnet Parachains">
                <option value="ajuna_paseo">Ajuna Network (Para ID: 2000)</option>
                <option value="amplitude_paseo">Amplitude (Para ID: 2124)</option>
                <option value="aventus_paseo">Aventus (Para ID: 2056)</option>
                <option value="bajun_paseo">Bajun Network (Para ID: 2119)</option>
                <option value="bifrost_paseo">Bifrost (Para ID: 2030)</option>
                <option value="darwinia_koi">Darwinia Koi (Para ID: 2105)</option>
                <option value="frequency">Frequency (Para ID: 4000)</option>
                <option value="hyperbridge">Hyperbridge (Para ID: 4374)</option>
                <option value="integritee_paseo">Integritee (Para ID: 3002)</option>
                <option value="kilt_paseo">KILT Spiritnet (Para ID: 2086)</option>
                <option value="laos_sigma">Laos Sigma (Para ID: 3369)</option>
                <option value="muse">Muse (Para ID: 3369)</option>
                <option value="myriad_social">Myriad Social (Para ID: 4002)</option>
                <option value="niskala">Niskala (Para ID: 3888)</option>
                <option value="nodle_paradis">Nodle Paradis (Para ID: 2026)</option>
                <option value="pop_network">POP Network (Para ID: 4001)</option>
                <option value="regionx_cocos">RegionX Cocos (Para ID: 4019)</option>
                <option value="xcavate">Xcavate (Para ID: 2021)</option>
                <option value="zeitgeist_battery">Zeitgeist Battery Station (Para ID: 2101)</option>
              </optgroup>
            </select>
            <HelpText>
              <p><strong>Relay Chains:</strong> Main network chains</p>
              <p><strong>System Parachains:</strong> Core infrastructure chains</p>
              <p><strong>Paseo Parachains:</strong> Testing environment with real XCM functionality</p>
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
              <p><strong>Note:</strong> Address format may vary by destination chain</p>
            </HelpText>
          </InputBase>
        );

      case 'XcmAssets':
        return (
          <InputBase>
            <div className="space-y-3">
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
                    <option value="native">Native Token ({networkSymbol})</option>
                    <option value="usdt">USDT (Tether)</option>
                    <option value="usdc">USDC (USD Coin)</option>
                    <option value="aca">ACA (Acala)</option>
                    <option value="glmr">GLMR (Moonbeam)</option>
                    <option value="astr">ASTR (Astar)</option>
                    <option value="hdx">HDX (HydraDX)</option>
                    <option value="pha">PHA (Phala)</option>
                  </select>
                </div>

                {/* Amount Input - Uniswap Style */}
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
                          {value.split('|')[0] === 'native' ? networkSymbol : value.split('|')[0].toUpperCase()}
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
              <p><strong>Network Detection:</strong> Automatically uses {networkSymbol} network assets</p>
              <p><strong>Current Input:</strong> {value || 'No asset selected'}</p>
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
            </HelpText>
          </InputBase>
        );

      case 'Balance':
        return (
          <InputBase>
            <div className="space-y-3">
              {/* Uniswap-style Amount Input */}
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
                    {networkSymbol}
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
              <p><strong>Amount:</strong> Enter the number of {networkSymbol} tokens to transfer</p>
              <p><strong>Format:</strong> Decimal numbers supported (e.g., 10.5)</p>
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