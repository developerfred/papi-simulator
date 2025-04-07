'use client'

import React, { useState } from 'react'
import { Network } from '@/lib/types/network'
import { Example } from '@/lib/types/example'
import { ACCOUNT_LIST } from '@/lib/constants/accounts'


interface InfoPanelProps {
  network: Network
  example: Example
}

export default function InfoPanel({ network }: InfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'network' | 'accounts'>('network')
  
  return (
    <div className="border border-gray-700 rounded-md overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeTab === 'network' ? 'bg-gray-800' : 'hover:bg-gray-800'
          }`}
          onClick={() => setActiveTab('network')}
        >
          Network Info
        </button>
        <button
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeTab === 'accounts' ? 'bg-gray-800' : 'hover:bg-gray-800'
          }`}
          onClick={() => setActiveTab('accounts')}
        >
          Test Accounts
        </button>
      </div>

      {/* Tab content */}
      <div className="p-3">
        {activeTab === 'network' && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{network.name}</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Token:</span>
                <span>{network.tokenSymbol} ({network.tokenDecimals} decimals)</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-400">Explorer:</span>
                <a 
                  href={network.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:underline truncate max-w-32 text-right"
                >
                  {network.explorer.replace(/^https?:\/\//, '')}
                </a>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-400">Faucet:</span>
                <a 
                  href={network.faucet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:underline truncate max-w-32 text-right"
                >
                  Get test tokens
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="space-y-2">
            <p className="text-xs mb-2">
              These well-known accounts have funds on testnets:
            </p>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {ACCOUNT_LIST.map((account) => (
                <div key={account.address} className="text-xs border border-gray-700 rounded p-2">
                  <div className="font-medium">{account.name}</div>
                  <div className="text-gray-400 text-xs">{account.description}</div>
                  <div className="mt-1 font-mono text-2xs break-all">
                    {account.address}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}