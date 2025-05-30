/* eslint-disable react/display-name, @next/next/no-img-element, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import React, { memo } from "react";
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
  const { getColor, isDarkTheme } = useTheme();
  const { status, isWalletInstalled, isWalletConnected } = useWallet();

  const isInstalled = isWalletInstalled(wallet.id);
  const isConnected = isWalletConnected(wallet.id);
  const isConnecting = status === "connecting";

  const statusConfig = {
    connected: {
      bg: isDarkTheme ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.08)",
      border: isDarkTheme ? "rgba(34, 197, 94, 0.4)" : "rgba(34, 197, 94, 0.3)",
      shadow: isDarkTheme ? "0 0 16px rgba(34, 197, 94, 0.2)" : "0 0 8px rgba(34, 197, 94, 0.1)",
      badge: { bg: isDarkTheme ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)", color: "#22c55e" }
    },
    notInstalled: {
      bg: isDarkTheme ? "rgba(251, 146, 60, 0.1)" : "rgba(251, 146, 60, 0.05)",
      border: isDarkTheme ? "rgba(251, 146, 60, 0.3)" : "rgba(251, 146, 60, 0.2)",
      badge: { bg: isDarkTheme ? "rgba(251, 146, 60, 0.2)" : "rgba(251, 146, 60, 0.1)", color: "#fb923c" }
    },
    default: {
      bg: getColor("surfaceVariant"),
      border: getColor("border")
    }
  };

  const currentStatus = isConnected ? statusConfig.connected :
    !isInstalled ? statusConfig.notInstalled :
      statusConfig.default;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-md",
        { "opacity-80": isConnecting && !isConnected }
      )}
      style={{
        background: currentStatus.bg,
        borderColor: currentStatus.border,
        boxShadow: currentStatus.shadow || "none"
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          {wallet.logo ? (
            <img
              src={wallet.logo}
              alt={wallet.name}
              className="w-10 h-10 rounded-lg object-contain"
              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{
                background: isDarkTheme ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)",
                color: "#6366f1"
              }}
            >
              {wallet.name.slice(0, 2)}
            </div>
          )}

          {isConnected && (
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
              style={{ background: "#22c55e", borderColor: getColor("background") }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          )}
        </div>

        <div>
          <div className="font-semibold" style={{ color: getColor("textPrimary") }}>
            {wallet.name}
          </div>
          <div className="flex gap-1.5 mt-1">
            {isConnected && (
              <Badge variant="success" size="sm" style={statusConfig.connected.badge}>
                Connected
              </Badge>
            )}
            {!isInstalled && (
              <Badge variant="warning" size="sm" style={statusConfig.notInstalled.badge}>
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
        className={cn("transition-all duration-200 hover:scale-105", {
          "cursor-default": isConnected
        })}
        style={isConnected ? statusConfig.connected.badge : undefined}
      >
        {isConnecting ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            Connecting...
          </div>
        ) : !isInstalled ? "Install" : isConnected ? "✓ Connected" : "Connect"}
      </Button>
    </div>
  );
});

const AccountSelector = memo(() => {
  const { accounts, activeAccount, setActiveAccount } = useWallet();
  const { getColor, isDarkTheme } = useTheme();

  if (accounts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold" style={{ color: getColor("textSecondary") }}>
        Select Account ({accounts.length})
      </h4>
      <div className="space-y-2">
        {accounts.map((account) => {
          const isSelected = activeAccount?.address === account.address;
          const primaryColor = isDarkTheme ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)";
          const primaryBg = isDarkTheme ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)";

          return (
            <button
              key={account.address}
              onClick={() => setActiveAccount(account)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all duration-200",
                "hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                { "shadow-sm": isSelected }
              )}
              style={{
                borderColor: isSelected ? primaryColor : getColor("border"),
                backgroundColor: isSelected ? primaryBg : getColor("surface")
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium" style={{ color: getColor("textPrimary") }}>
                    {account.name || "Unnamed Account"}
                  </div>
                  <div className="text-xs font-mono mt-1" style={{ color: getColor("textTertiary") }}>
                    {account.address.slice(0, 8)}...{account.address.slice(-6)}
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#6366f1" }}
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
  const { getColor, isDarkTheme } = useTheme();

  const isConnected = status === "connected";

  return (
    <div
      className="rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: getColor("surface"),
        border: `1px solid ${getColor("border")}`
      }}
    >
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold" style={{ color: getColor("textPrimary") }}>
            Wallet Connection
          </h3>
          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={disconnect}
              className="hover:scale-105 transition-transform text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Disconnect
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="p-3 rounded-xl flex items-center gap-3"
            style={{
              backgroundColor: isDarkTheme ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${isDarkTheme ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.2)"}`
            }}
          >
            <span className="text-red-500 text-lg">⚠️</span>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </span>
          </div>
        )}

        {/* Wallets List */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: getColor("textSecondary") }}>            
            Available Wallets {wallets.length > 0 && `(${wallets.length})`}
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
              <div className="text-center py-8" style={{ color: getColor("textSecondary") }}>
                <div className="text-4xl mb-2">🔍</div>
                <div className="font-medium">Searching for wallets...</div>
                <div className="text-sm mt-1">Install a Polkadot wallet to continue</div>
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

export const WalletStatus = memo(() => {
  const { activeAccount, status } = useWallet();
  const { getColor, isDarkTheme } = useTheme();

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  const statusConfig = {
    connected: {
      bg: isDarkTheme ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.1)",
      color: "#22c55e",
      dot: "#22c55e"
    },
    connecting: {
      bg: isDarkTheme ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)",
      color: "#3b82f6",
      dot: "#3b82f6"
    },
    disconnected: {
      bg: getColor("surfaceVariant"),
      color: getColor("textSecondary"),
      dot: getColor("textTertiary")
    }
  };

  const currentStatus = isConnected ? statusConfig.connected :
    isConnecting ? statusConfig.connecting :
      statusConfig.disconnected;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
      style={{
        backgroundColor: currentStatus.bg,
        color: currentStatus.color
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: currentStatus.dot,
          animation: isConnected ? "pulse 2s infinite" : "none"
        }}
      />
      {isConnecting ? "🔄 Connecting..." :
        isConnected ? `✅ ${activeAccount?.name || `${activeAccount?.address.slice(0, 6)}...`}` :
          "❌ No Wallet"}
    </div>
  );
});