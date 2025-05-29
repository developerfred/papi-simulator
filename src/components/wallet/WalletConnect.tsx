/* eslint-disable @typescript-eslint/no-unused-vars,  react/display-name, @next/next/no-img-element */
"use client";

import React, { memo, useMemo } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useTheme } from "@/lib/theme/ThemeProvider";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";


const WalletItem = memo<{
  wallet: { id: string; name: string; logo?: string; website: string };
  onConnect: () => void;
  onInstall: () => void;
}>(({ wallet, onConnect, onInstall }) => {
  const { getColor, getNetworkColor, isDarkTheme } = useTheme();
  const { status, isWalletInstalled, isWalletConnected } = useWallet();

  const isInstalled = isWalletInstalled(wallet.id);
  const isConnected = isWalletConnected(wallet.id);
  const isConnecting = status === "connecting";

  
  const walletStyles = useMemo(() => {
    const baseStyles = {
      background: getColor("surfaceVariant"),
      borderColor: getColor("border"),
    };

    if (isConnected) {
      return {
        ...baseStyles,
        background: isDarkTheme
          ? getNetworkColor("success", 0.15)
          : getNetworkColor("success", 0.08),
        borderColor: isDarkTheme
          ? getNetworkColor("success", 0.4)
          : getNetworkColor("success", 0.3),
        boxShadow: isDarkTheme
          ? `0 0 16px ${getNetworkColor("success", 0.2)}`
          : `0 0 8px ${getNetworkColor("success", 0.1)}`,
      };
    }

    if (!isInstalled) {
      return {
        ...baseStyles,
        background: isDarkTheme
          ? getNetworkColor("warning", 0.1)
          : getNetworkColor("warning", 0.05),
        borderColor: isDarkTheme
          ? getNetworkColor("warning", 0.3)
          : getNetworkColor("warning", 0.2),
      };
    }

    return baseStyles;
  }, [isConnected, isInstalled, isDarkTheme, getColor, getNetworkColor]);

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-md focus-within:ring-2 focus-within:ring-offset-2",
        { "opacity-80": isConnecting && !isConnected }
      )}
      style={walletStyles}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          {wallet.logo ? (
            <img
              src={wallet.logo}
              alt={wallet.name}
              className="w-10 h-10 rounded-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: getNetworkColor("primary", 0.2) }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: getNetworkColor("primary") }}
              >
                {wallet.name.slice(0, 2)}
              </span>
            </div>
          )}

          {isConnected && (
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
              style={{
                background: getNetworkColor("success"),
                borderColor: getColor("background"),
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          )}
        </div>

        <div>
          <div
            className="font-semibold text-base"
            style={{ color: getColor("textPrimary") }}
          >
            {wallet.name}
          </div>
          <div className="flex gap-1.5 mt-1">
            {isConnected && (
              <Badge
                variant="success"
                size="sm"
                style={{
                  background: isDarkTheme
                    ? getNetworkColor("success", 0.2)
                    : getNetworkColor("success", 0.1),
                  color: getNetworkColor("success"),
                }}
              >
                Connected
              </Badge>
            )}
            {!isInstalled && (
              <Badge
                variant="warning"
                size="sm"
                style={{
                  background: isDarkTheme
                    ? getNetworkColor("warning", 0.2)
                    : getNetworkColor("warning", 0.1),
                  color: getNetworkColor("warning"),
                }}
              >
                Not Installed
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Button
        size="sm"
        variant={!isInstalled ? "outline" : isConnected ? "ghost" : "primary"}
        onClick={!isInstalled ? onInstall : isConnected ? undefined : onConnect}
        disabled={isConnecting || isConnected}
        className={cn(
          "transition-all duration-200 hover:scale-105",
          {
            "cursor-default": isConnected,
            "opacity-90 hover:opacity-100": !isConnected,
          }
        )}
        style={isConnected ? {
          background: isDarkTheme
            ? getNetworkColor("success", 0.2)
            : getNetworkColor("success", 0.1),
          color: getNetworkColor("success"),
        } : undefined}
      >
        {isConnecting ? (
          <div className="flex items-center gap-2">
            <div
              className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
            Connecting...
          </div>
        ) : !isInstalled ? "Install" : isConnected ? "Connected" : "Connect"}
      </Button>
    </div>
  );
});

// Componente de seleção de conta otimizado
const AccountSelector = memo(() => {
  const { accounts, activeAccount, setActiveAccount } = useWallet();
  const { getColor, getNetworkColor, isDarkTheme } = useTheme();

  if (accounts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4
        className="text-sm font-semibold"
        style={{ color: getColor("textSecondary") }}
      >
        Select Account
      </h4>
      <div className="space-y-2">
        {accounts.map((account) => {
          const isSelected = activeAccount?.address === account.address;

          return (
            <button
              key={account.address}
              onClick={() => setActiveAccount(account)}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all duration-200",
                "hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2",
                {
                  "scale-[1.01] shadow-sm": isSelected,
                }
              )}
              style={{
                borderColor: isSelected
                  ? getNetworkColor("primary", 0.4)
                  : getColor("border"),
                backgroundColor: isSelected
                  ? isDarkTheme
                    ? getNetworkColor("primary", 0.1)
                    : getNetworkColor("primary", 0.05)
                  : getColor("surface"),
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="font-medium"
                    style={{ color: getColor("textPrimary") }}
                  >
                    {account.name || "Unnamed Account"}
                  </div>
                  <div
                    className="text-xs font-mono mt-1"
                    style={{ color: getColor("textTertiary") }}
                  >
                    {account.address.slice(0, 8)}...{account.address.slice(-6)}
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getNetworkColor("primary") }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});


export const WalletConnect = memo(() => {
  const { status, wallets, error, connect, disconnect } = useWallet();
  const { getColor } = useTheme();

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div
      className="rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
        borderWidth: 1,
      }}
    >
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3
            className="text-xl font-bold"
            style={{ color: getColor("textPrimary") }}
          >
            Wallet Connection
          </h3>
          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={disconnect}
              className="hover:scale-105 transition-transform"
              style={{
                color: getColor("error"),
              }}
            >
              Disconnect
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="p-3 rounded-xl flex items-center gap-3 transition-all"
            style={{
              backgroundColor: getColor("error", 0.1),
              borderColor: getColor("error", 0.3),
              borderWidth: 1,
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: getColor("error") }}
            >
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: getColor("error") }}
            >
              {error}
            </span>
          </div>
        )}

        {/* Wallets List */}
        <div className="space-y-4">
          <h4
            className="text-sm font-semibold"
            style={{ color: getColor("textSecondary") }}
          >
            Available Wallets
          </h4>
          <div className="space-y-3">
            {wallets.length > 0 ? (
              wallets.map((wallet) => (
                <WalletItem
                  key={wallet.id}
                  wallet={wallet}
                  onConnect={() => connect(wallet.id)}
                  onInstall={() => window.open(wallet.website, "_blank")}
                />
              ))
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border animate-pulse"
                    style={{
                      backgroundColor: getColor("surfaceVariant"),
                      borderColor: getColor("border"),
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Account Selection */}
        {isConnected && <AccountSelector />}
      </div>
    </div>
  );
});

// Componente de status da carteira
export const WalletStatus = memo(() => {
  const { activeAccount, status } = useWallet();
  const { getColor, getNetworkColor } = useTheme();

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
        "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
      )}
      style={{
        backgroundColor: isConnected
          ? getNetworkColor("success", 0.1)
          : isConnecting
            ? getNetworkColor("info", 0.1)
            : getColor("surfaceVariant"),
        color: isConnected
          ? getNetworkColor("success")
          : isConnecting
            ? getNetworkColor("info")
            : getColor("textSecondary"),
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: isConnected
            ? getNetworkColor("success")
            : isConnecting
              ? getNetworkColor("info")
              : getColor("textTertiary"),
          animation: isConnected ? "pulse 1.5s infinite" : "none",
        }}
      />
      {isConnecting ? "Connecting..." :
        isConnected ? (activeAccount?.name || `${activeAccount?.address.slice(0, 6)}...`) :
          "No Wallet"}
    </div>
  );
});

