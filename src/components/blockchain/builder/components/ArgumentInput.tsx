/* eslint-disable @typescript-eslint/no-explicit-any, react/display-name */

import React from "react";
import type { TransactionArg } from "../types/transaction.types";

interface ArgumentInputProps {
  arg: TransactionArg;
  value: any;
  onChange: (name: string, value: any) => void;
  networkSymbol: string;
}

export const ArgumentInput: React.FC<ArgumentInputProps> = React.memo(({ 
  arg, 
  value, 
  onChange, 
  networkSymbol 
}) => {
  const inputProps = {
    value: value || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
      onChange(arg.name, e.target.value),
    className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  };

  const renderInput = () => {
    switch (arg.type) {
      case 'Vec<AccountId>':
        return (
          <textarea
            {...inputProps}
            placeholder="One address per line"
            className={`${inputProps.className} h-24`}
          />
        );
      
      case 'RewardDestination':
        return (
          <select {...inputProps}>
            <option value="Staked">Staked</option>
            <option value="Stash">Stash</option>
            <option value="Controller">Controller</option>
          </select>
        );
      
      case 'XcmDestination':
        return (
          <select {...inputProps}>
            <option value="">Select destination chain</option>
            <optgroup label="Polkadot Parachains">
              <option value="acala">Acala (Para ID: 2000)</option>
              <option value="moonbeam">Moonbeam (Para ID: 2004)</option>
              <option value="astar">Astar (Para ID: 2006)</option>
              <option value="parallel">Parallel (Para ID: 2012)</option>
              <option value="composable">Composable (Para ID: 2019)</option>
              <option value="centrifuge">Centrifuge (Para ID: 2031)</option>
              <option value="interlay">Interlay (Para ID: 2032)</option>
              <option value="hydradx">HydraDX (Para ID: 2034)</option>
              <option value="bifrost">Bifrost (Para ID: 2030)</option>
              <option value="phala">Phala (Para ID: 2035)</option>
            </optgroup>
            <optgroup label="Kusama Parachains">
              <option value="karura">Karura (Para ID: 2000)</option>
              <option value="moonriver">Moonriver (Para ID: 2023)</option>
              <option value="shiden">Shiden (Para ID: 2007)</option>
              <option value="khala">Khala (Para ID: 2004)</option>
              <option value="kintsugi">Kintsugi (Para ID: 2092)</option>
              <option value="basilisk">Basilisk (Para ID: 2090)</option>
            </optgroup>
            <optgroup label="Relay Chains">
              <option value="polkadot">Polkadot Relay Chain</option>
              <option value="kusama">Kusama Relay Chain</option>
            </optgroup>
          </select>
        );
      
      case 'XcmBeneficiary':
        return (
          <input
            {...inputProps}
            type="text"
            placeholder="Destination account address (ss58)"
          />
        );
      
      case 'XcmAssets':
        return (
          <div className="space-y-2">
            <input
              {...inputProps}
              type="text"
              placeholder="asset_key|amount (ex: native|10.5)"
            />
            <div className="text-xs text-gray-500">
              <p>Format: asset_key|amount</p>
              <p>Available assets: native, usdt, usdc, aca, glmr, astr</p>
              <p>Example: native|10.5 (for 10.5 DOT/KSM)</p>
            </div>
          </div>
        );
      
      case 'XcmWeightLimit':
        return (
          <select {...inputProps}>
            <option value="Unlimited">Unlimited</option>
            <option value="5000000000">Limited (5B ref_time)</option>
            <option value="10000000000">Limited (10B ref_time)</option>
            <option value="20000000000">Limited (20B ref_time)</option>
          </select>
        );
      
      case 'XcmMessage':
        return (
          <textarea
            {...inputProps}
            placeholder='{"V3": [{"WithdrawAsset": {...}}]}'
            className={`${inputProps.className} h-32 font-mono text-sm`}
          />
        );
      
      case 'Balance':
        return (
          <input
            {...inputProps}
            type="number"
            step="0.001"
            placeholder={`Amount in ${networkSymbol}`}
          />
        );
      
      case 'u32':
        return (
          <input
            {...inputProps}
            type="number"
            step="1"
            placeholder="Integer number"
          />
        );
      
      default:
        return (
          <input
            {...inputProps}
            type="text"
            placeholder={`Enter ${arg.name}`}
          />
        );
    }
  };

  return (
    <div key={arg.name}>
      <label className="block text-sm font-medium mb-1">
        {arg.name} {arg.required && <span className="text-red-500">*</span>}
      </label>
      <div className="text-xs text-gray-500 mb-2">{arg.description}</div>
      {renderInput()}
    </div>
  );
});