/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import type React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Network } from '@/lib/types/network';

interface NetworkHealthProps {
  network: Network;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'badge' | 'full';
}

interface HealthStatus {
  status: 'checking' | 'healthy' | 'degraded' | 'offline' | 'unknown';
  latency: number | null;
  lastChecked: Date | null;
  error?: string;
  retryCount: number;
}

const HEALTH_CHECK_TIMEOUT = 8000; // 8 seconds
const MAX_RETRIES = 3;
const DEFAULT_REFRESH_INTERVAL = 30000; // 30 seconds

export function NetworkHealth({
  network,
  showDetails = false,
  autoRefresh = false,
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
  className = '',
  size = 'sm',
  variant = 'icon'
}: NetworkHealthProps) {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'unknown',
    latency: null,
    lastChecked: null,
    retryCount: 0
  });

  const [isChecking, setIsChecking] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Check endpoint health
  const checkHealth = useCallback(async (isRetry = false) => {
    if (isChecking && !isRetry) return;
    
    setIsChecking(true);
    
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const startTime = Date.now();

    try {
      setHealth(prev => ({ 
        ...prev, 
        status: 'checking',
        retryCount: isRetry ? prev.retryCount + 1 : 0
      }));

      const result = await Promise.race([
        checkRpcEndpoint(network.endpoint, abortControllerRef.current.signal),
        new Promise<never>((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, HEALTH_CHECK_TIMEOUT);
        })
      ]);

      const latency = Date.now() - startTime;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      let status: HealthStatus['status'] = 'healthy';
      
      // Determine status based on latency and response
      if (latency > 5000) {
        status = 'degraded'; // Slow but working
      } else if (result && latency < 3000) {
        status = 'healthy'; // Good performance
      } else {
        status = 'degraded'; // Moderate performance
      }

      setHealth({
        status,
        latency,
        lastChecked: new Date(),
        retryCount: 0
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setHealth(prev => {
        const newRetryCount = prev.retryCount + 1;
        
        // Auto-retry up to MAX_RETRIES
        if (newRetryCount < MAX_RETRIES && !abortControllerRef.current?.signal.aborted) {
          setTimeout(() => checkHealth(true), 2000 * newRetryCount); // Exponential backoff
        }
        
        return {
          status: 'offline',
          latency: null,
          lastChecked: new Date(),
          error: errorMessage,
          retryCount: newRetryCount
        };
      });
    } finally {
      setIsChecking(false);
    }
  }, [network.endpoint, isChecking]);

  // Auto-refresh setup
  useEffect(() => {
    // Initial check
    checkHealth();

    // Setup auto-refresh
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        checkHealth();
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkHealth, autoRefresh, refreshInterval]);

  // Update when network changes
  useEffect(() => {
    checkHealth();
  }, [network.endpoint]);

  const getStatusInfo = () => {
    const { status, latency, lastChecked, error } = health;

    const statusConfig = {
      checking: {
        icon: '⏳',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        label: 'Checking...',
        description: 'Testing connection'
      },
      healthy: {
        icon: '🟢',
        color: 'text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        label: 'Healthy',
        description: latency ? `${latency}ms response` : 'Connection active'
      },
      degraded: {
        icon: '🟡',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        label: 'Slow',
        description: latency ? `${latency}ms response (slow)` : 'Connection slow'
      },
      offline: {
        icon: '🔴',
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        label: 'Offline',
        description: error || 'Connection failed'
      },
      unknown: {
        icon: '❓',
        color: 'text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        label: 'Unknown',
        description: 'Status not checked'
      }
    };

    return statusConfig[status];
  };

  const statusInfo = getStatusInfo();
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const handleManualRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    checkHealth();
  };

  // Icon only variant
  if (variant === 'icon') {
    return (
      <div 
        className={`inline-flex items-center ${className}`}
        title={`${network.name}: ${statusInfo.label} - ${statusInfo.description}`}
      >
        <span className={`${sizeClasses[size]} cursor-help`}>
          {statusInfo.icon}
        </span>
      </div>
    );
  }

  // Badge variant
  if (variant === 'badge') {
    return (
      <div 
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bgColor} ${className}`}
        title={statusInfo.description}
      >
        <span className={sizeClasses[size]}>{statusInfo.icon}</span>
        {showDetails && (
          <span className={`${sizeClasses[size]} ${statusInfo.color} font-medium`}>
            {statusInfo.label}
          </span>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <span className={sizeClasses[size]}>{statusInfo.icon}</span>
        {showDetails && (
          <div className="flex flex-col">
            <span className={`${sizeClasses[size]} ${statusInfo.color} font-medium leading-tight`}>
              {statusInfo.label}
            </span>
            <span className="text-xs text-gray-500 leading-tight">
              {health.latency ? `${health.latency}ms` : statusInfo.description}
            </span>
          </div>
        )}
      </div>
      
      {/* Manual refresh button */}
      <button
        onClick={handleManualRefresh}
        disabled={isChecking}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
          isChecking ? 'animate-spin' : ''
        }`}
        title="Refresh status"
      >
        <span className="text-xs">🔄</span>
      </button>
      
      {/* Last checked info */}
      {health.lastChecked && showDetails && (
        <span className="text-xs text-gray-400" title={health.lastChecked.toLocaleString()}>
          {getTimeSince(health.lastChecked)}
        </span>
      )}
    </div>
  );
}

// ============================
// RPC Health Check Function
async function checkRpcEndpoint(endpoint: string, signal?: AbortSignal): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false; // Skip on server side
  }

  try {
    // For WebSocket endpoints, we'll use a different approach
    if (endpoint.startsWith('wss://') || endpoint.startsWith('ws://')) {
      return await checkWebSocketEndpoint(endpoint, signal);
    }
    
    // For HTTP endpoints (fallback)
    if (endpoint.startsWith('http')) {
      return await checkHttpEndpoint(endpoint, signal);
    }
    
    return false;
  } catch (error) {
    console.debug('Health check failed:', error);
    return false;
  }
}

async function checkWebSocketEndpoint(endpoint: string, signal?: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(endpoint);
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          try {
            ws.close();
          } catch {}
        }
      };

      // Handle abort signal
      if (signal) {
        signal.addEventListener('abort', () => {
          cleanup();
          resolve(false);
        });
      }

      ws.onopen = () => {
        cleanup();
        resolve(true);
      };

      ws.onerror = () => {
        cleanup();
        resolve(false);
      };

      ws.onclose = (event) => {
        cleanup();
        // If close code is 1000 (normal) or 1006 (abnormal but immediate), consider it working
        resolve(event.code === 1000 || event.code === 1006);
      };

      // Fallback timeout
      setTimeout(() => {
        if (!resolved) {
          cleanup();
          resolve(false);
        }
      }, 5000);

    } catch (error) {
      resolve(false);
    }
  });
}

async function checkHttpEndpoint(endpoint: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(endpoint, {
      method: 'HEAD',
      signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

// ============================
// Utility Functions
function getTimeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ============================
// Batch Health Checker Hook
export function useNetworkHealthBatch(networks: Network[], options?: {
  batchSize?: number;
  refreshInterval?: number;
  autoRefresh?: boolean;
}) {
  const [healthStatuses, setHealthStatuses] = useState<Record<string, HealthStatus>>({});
  const [isChecking, setIsChecking] = useState(false);
  
  const {
    batchSize = 5,
    refreshInterval = 60000,
    autoRefresh = false
  } = options || {};

  const checkBatch = useCallback(async () => {
    if (isChecking || networks.length === 0) return;
    
    setIsChecking(true);
    
    try {
      // Process networks in batches to avoid overwhelming
      for (let i = 0; i < networks.length; i += batchSize) {
        const batch = networks.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (network) => {
          const startTime = Date.now();
          try {
            const isHealthy = await checkRpcEndpoint(network.endpoint);
            const latency = Date.now() - startTime;
            
            return {
              networkId: network.id,
              status: {
                status: isHealthy ? (latency > 5000 ? 'degraded' : 'healthy') : 'offline',
                latency,
                lastChecked: new Date(),
                retryCount: 0
              } as HealthStatus
            };
          } catch (error) {
            return {
              networkId: network.id,
              status: {
                status: 'offline',
                latency: null,
                lastChecked: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error',
                retryCount: 0
              } as HealthStatus
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        setHealthStatuses(prev => {
          const updated = { ...prev };
          batchResults.forEach(({ networkId, status }) => {
            updated[networkId] = status;
          });
          return updated;
        });
        
        // Small delay between batches
        if (i + batchSize < networks.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } finally {
      setIsChecking(false);
    }
  }, [networks, batchSize, isChecking]);

  useEffect(() => {
    checkBatch();
    
    if (autoRefresh) {
      const interval = setInterval(checkBatch, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [checkBatch, autoRefresh, refreshInterval]);

  return {
    healthStatuses,
    isChecking,
    refreshAll: checkBatch
  };
}

// ============================
// Simplified Health Indicator
export function HealthIndicator({ 
  status, 
  size = 'sm' 
}: { 
  status: 'healthy' | 'degraded' | 'offline' | 'checking' | 'unknown';
  size?: 'xs' | 'sm' | 'md';
}) {
  const icons = {
    healthy: '🟢',
    degraded: '🟡', 
    offline: '🔴',
    checking: '⏳',
    unknown: '❓'
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm', 
    md: 'text-base'
  };

  return (
    <span className={`${sizeClasses[size]} ${status === 'checking' ? 'animate-pulse' : ''}`}>
      {icons[status]}
    </span>
  );
}

export default NetworkHealth;