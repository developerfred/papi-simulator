"use client";

import type React from "react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { ApiPromise } from "@polkadot/api";
import { formatBalance } from "@polkadot/util";
import { Card, Button } from "@/components/ui";

interface Network {
  name: string;
  symbol: string;
  decimals: number;
}

interface TransactionInfo {
  uid?: string;
  hash: string;
  blockNumber: number;
  blockHash: string;
  timestamp: Date;
  from: string;
  to?: string;
  amount?: string;
  fee: string;
  success: boolean;
  method: string;
  section: string;
  args: any[];
  events: any[];
}

interface TransactionMonitorProps {
  api: ApiPromise;
  network: Network;
  userAddress?: string;
  limit?: number;
}

const TransactionMonitor: React.FC<TransactionMonitorProps> = ({
  api,
  network,
  userAddress,
  limit = 20
}) => {
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [filter, setFilter] = useState<'all' | 'user' | 'transfers'>('all');
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const unsubscribeRef = useRef<() => void>();
  const isMountedRef = useRef(true);

  // Memoized process block transactions para evitar re-criações
  const processBlockTransactions = useCallback(async (header: any) => {
    if (!isMountedRef.current || !api) return;

    setIsLoading(true);
    try {
      const blockHash = header.hash;
      const blockNumber = header.number.toNumber();
      const block = await api.rpc.chain.getBlock(blockHash);
      const timestamp = new Date();
      const newTransactions: TransactionInfo[] = [];

      for (const [i, extrinsic] of block.block.extrinsics.entries()) {
        // Skip system extrinsics
        if (['timestamp', 'parachainSystem'].includes(extrinsic.method.section)) continue;

        const hash = extrinsic.hash.toHex();
        const events = await api.query.system.events.at(blockHash);
        const extrinsicEvents = events.filter(
          (event: any) => event.phase.isApplyExtrinsic &&
            event.phase.asApplyExtrinsic.eq(i)
        );

        const success = !extrinsicEvents.some((event: any) =>
          api.events.system.ExtrinsicFailed.is(event.event)
        );

        let fee = '0';
        const feeEvent = extrinsicEvents.find((event: any) =>
          api.events.balances?.Withdraw?.is(event.event) ||
          api.events.treasury?.Deposit?.is(event.event)
        );

        if (feeEvent && api.events.balances?.Withdraw?.is(feeEvent.event)) {
          fee = formatBalance(feeEvent.event.data[1], {
            withUnit: network.symbol,
            decimals: network.decimals
          });
        }

        let to, amount;
        if (extrinsic.method.section === 'balances' &&
          ['transfer', 'transferKeepAlive'].includes(extrinsic.method.method)) {
          const args = extrinsic.method.args;
          to = args[0].toString();
          amount = formatBalance(args[1], {
            withUnit: network.symbol,
            decimals: network.decimals
          });
        }

        newTransactions.push({
          uid: `${blockHash.toHex()}-${hash}`,
          hash,
          blockNumber,
          blockHash: blockHash.toHex(),
          timestamp,
          from: extrinsic.signer?.toString() || 'System',
          to,
          amount,
          fee,
          success,
          method: extrinsic.method.method,
          section: extrinsic.method.section,
          args: extrinsic.method.args.map((arg: any) => arg.toString()),
          events: extrinsicEvents.map((event: any) => ({
            section: event.event.section,
            method: event.event.method,
            data: event.event.data.map((d: any) => d.toString())
          })),
          
        });
      }

      if (isMountedRef.current) {
        setTransactions(prev => {
          const newMap = new Map([...prev, ...newTransactions].map(tx => [tx.uid, tx]));
          return Array.from(newMap.values()).slice(0, limit);
        });

      }
    } catch (error) {
      console.error('Error processing block:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [api, limit, network]);

  // Start monitoring com otimizações
  const startMonitoring = useCallback(async () => {
    if (!api || isMonitoring) return;

    try {
      setIsMonitoring(true);
      const unsubscribe = await api.rpc.chain.subscribeNewHeads(processBlockTransactions);
      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('Error starting monitoring:', error);
      setIsMonitoring(false);
    }
  }, [api, isMonitoring, processBlockTransactions]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = undefined;
    }
    setIsMonitoring(false);
  }, []);

  // Clear transactions
  const clearTransactions = useCallback(() => {
    setTransactions([]);
    setExpandedTx(null);
  }, []);

  // Memoized filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      switch (filter) {
        case 'user':
          return userAddress && (tx.from === userAddress || tx.to === userAddress);
        case 'transfers':
          return tx.section === 'balances' &&
            ['transfer', 'transferKeepAlive'].includes(tx.method);
        default:
          return true;
      }
    });
  }, [transactions, filter, userAddress]);

  // Memoized stats
  const stats = useMemo(() => {
    const totalTx = transactions.length;
    const successfulTx = transactions.filter(tx => tx.success).length;
    const failedTx = totalTx - successfulTx;
    const transferTx = transactions.filter(tx =>
      tx.section === 'balances' && ['transfer', 'transferKeepAlive'].includes(tx.method)
    ).length;

    return { totalTx, successfulTx, failedTx, transferTx };
  }, [transactions]);

  // Lifecycle management
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      stopMonitoring();
    };
  }, [stopMonitoring]);

  // Auto-start monitoring
  useEffect(() => {
    if (api && !isMonitoring) {
      startMonitoring();
    }
  }, [api, startMonitoring, isMonitoring]);

  // Expand/collapse transaction details
  const toggleExpanded = useCallback((hash: string) => {
    setExpandedTx(prev => prev === hash ? null : hash);
  }, []);

  // Memoized formatters
  const formatTimestamp = useCallback((timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  const formatAddress = useCallback((address: string, length = 8) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, length)}...${address.slice(-4)}`;
  }, []);

  // Memoized style helpers
  const getStatusStyles = useCallback((success: boolean) => {
    return success
      ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-red-600 bg-red-50 border-red-200';
  }, []);

  const getMethodBadgeStyles = useCallback((section: string) => {
    const styles: Record<string, string> = {
      balances: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      staking: 'bg-blue-100 text-blue-800 border-blue-200',
      democracy: 'bg-purple-100 text-purple-800 border-purple-200',
      utility: 'bg-amber-100 text-amber-800 border-amber-200',
      system: 'bg-gray-100 text-gray-800 border-gray-200',
      sudo: 'bg-red-100 text-red-800 border-red-200',
      treasury: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return styles[section] || 'bg-slate-100 text-slate-800 border-slate-200';
  }, []);

  return (
    <Card className="bg-theme-surface border-theme network-transition">
      {/* Header com melhor design */}
      <div className="p-6 border-b border-theme">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-theme-primary">
              Transaction Monitor
            </h2>
            <p className="text-sm text-theme-secondary">
              Real-time transactions on <span className="text-network-primary font-medium">{network.name}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status indicator melhorado */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-theme-surface-variant border border-theme">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isMonitoring
                  ? 'bg-green-500 animate-pulse-slow shadow-green-400/50 shadow-lg'
                  : 'bg-gray-400'
                }`} />
              <span className="text-xs font-medium text-theme-secondary">
                {isMonitoring ? 'Live' : 'Stopped'}
              </span>
              {isLoading && (
                <div className="w-3 h-3 border border-network-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            <Button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              variant={isMonitoring ? 'outline' : 'primary'}
              size="sm"
              className="network-transition hover:scale-105 active:scale-95"
              disabled={!api}
            >
              {isMonitoring ? 'Stop' : 'Start'}
            </Button>
          </div>
        </div>

        {/* Stats dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-theme-surface-variant border border-theme rounded-lg p-3 network-transition">
            <div className="text-lg font-bold text-theme-primary">{stats.totalTx}</div>
            <div className="text-xs text-theme-secondary">Total</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 network-transition">
            <div className="text-lg font-bold text-green-700">{stats.successfulTx}</div>
            <div className="text-xs text-green-600">Success</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 network-transition">
            <div className="text-lg font-bold text-red-700">{stats.failedTx}</div>
            <div className="text-xs text-red-600">Failed</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 network-transition">
            <div className="text-lg font-bold text-blue-700">{stats.transferTx}</div>
            <div className="text-xs text-blue-600">Transfers</div>
          </div>
        </div>

        {/* Controls melhorados */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 border border-theme rounded-lg text-sm bg-theme-surface text-theme-primary network-transition focus:ring-2 focus:ring-network-primary focus:border-network-primary"
            >
              <option value="all">All Transactions</option>
              {userAddress && <option value="user">My Transactions</option>}
              <option value="transfers">Only Transfers</option>
            </select>

            <div className="px-3 py-2 bg-network-light text-network-primary rounded-lg text-sm font-medium border border-network-primary/20">
              {filteredTransactions.length} shown
            </div>
          </div>

          <Button
            onClick={clearTransactions}
            variant="outline"
            size="sm"
            disabled={transactions.length === 0}
            className="network-transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Transaction list com melhor design */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-theme-surface-variant rounded-full flex items-center justify-center">
              {isMonitoring ? (
                <div className="w-6 h-6 border-2 border-network-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-8 h-8 text-theme-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div className="text-theme-secondary font-medium mb-2">
              {isMonitoring
                ? 'Listening for transactions...'
                : 'Start monitoring to see transactions'}
            </div>
            <div className="text-sm text-theme-tertiary">
              {filter !== 'all' && `Filtering by: ${filter}`}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-theme">
            {filteredTransactions.map((tx, index) => (
              <div
                key={tx.uid}
                className="network-transition hover:bg-theme-surface-variant animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpanded(tx.hash)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border network-transition ${getMethodBadgeStyles(tx.section)}`}>
                        {tx.section}.{tx.method}
                      </span>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyles(tx.success)}`}>
                        <span>{tx.success ? '✓' : '✗'}</span>
                        <span>{tx.success ? 'Success' : 'Failed'}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-theme-tertiary">Block</span>
                        <span className="text-sm font-mono bg-theme-surface-variant px-2 py-0.5 rounded border border-theme">
                          #{tx.blockNumber}
                        </span>
                      </div>
                      <div className="text-xs text-theme-secondary">
                        {formatTimestamp(tx.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-theme-tertiary">From:</span>
                        <code className="text-xs bg-theme-surface-variant px-2 py-1 rounded border border-theme font-mono">
                          {formatAddress(tx.from)}
                        </code>
                      </div>

                      {tx.to && (
                        <>
                          <svg className="w-4 h-4 text-theme-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <div className="flex items-center space-x-2">
                            <span className="text-theme-tertiary">To:</span>
                            <code className="text-xs bg-theme-surface-variant px-2 py-1 rounded border border-theme font-mono">
                              {formatAddress(tx.to)}
                            </code>
                          </div>
                        </>
                      )}
                    </div>

                    {tx.amount && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-theme-primary">{tx.amount}</div>
                        <div className="text-xs text-theme-tertiary">Amount</div>
                      </div>
                    )}
                  </div>

                  {/* Expand indicator */}
                  <div className="flex justify-center mt-3">
                    <svg
                      className={`w-4 h-4 text-theme-tertiary transition-transform duration-200 ${expandedTx === tx.hash ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expandable details com smooth animation */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedTx === tx.hash
                    ? 'max-h-[2000px] opacity-100'
                    : 'max-h-0 opacity-0'
                  }`}>
                  <div className="border-t border-theme bg-theme-surface-variant p-4 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-theme-primary mb-1 block">Transaction Hash</span>
                          <code className="text-xs bg-theme-surface px-3 py-2 rounded border border-theme block break-all font-mono">
                            {tx.hash}
                          </code>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-theme-primary mb-1 block">Block Hash</span>
                          <code className="text-xs bg-theme-surface px-3 py-2 rounded border border-theme block break-all font-mono">
                            {tx.blockHash}
                          </code>
                        </div>

                        {tx.fee !== '0' && (
                          <div>
                            <span className="text-sm font-medium text-theme-primary mb-1 block">Transaction Fee</span>
                            <span className="text-sm bg-amber-50 text-amber-800 px-3 py-2 rounded border border-amber-200 block">
                              {tx.fee}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        {tx.args.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-theme-primary mb-2 block">Arguments</span>
                            <div className="bg-theme-surface border border-theme rounded max-h-32 overflow-y-auto">
                              <pre className="text-xs p-3 font-mono whitespace-pre-wrap">
                                {JSON.stringify(tx.args, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {tx.events.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-theme-primary mb-2 block">Events ({tx.events.length})</span>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {tx.events.map((event, index) => (
                            <div
                              key={index}
                              className="bg-theme-surface border border-theme rounded-lg p-3 network-transition hover:bg-theme-surface-variant"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getMethodBadgeStyles(event.section)}`}>
                                  {event.section}.{event.method}
                                </span>
                                <span className="text-xs text-theme-tertiary">Event #{index + 1}</span>
                              </div>
                              {event.data.length > 0 && (
                                <pre className="text-xs font-mono text-theme-secondary bg-theme-surface-variant p-2 rounded border border-theme overflow-x-auto">
                                  {JSON.stringify(event.data, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      {transactions.length >= limit && (
        <div className="p-4 border-t border-theme bg-theme-surface-variant text-center">
          <span className="text-sm text-theme-secondary">
            Showing latest {limit} transactions • {transactions.length - filteredTransactions.length} filtered out
          </span>
        </div>
      )}
    </Card>
  );
};

export default TransactionMonitor;