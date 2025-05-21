"use client";

import React, { useMemo } from "react";
import { useWallet } from "@/providers/WalletProvider";
import { encodeAddress } from "@polkadot/util-crypto";
import { truncateHash } from "@/lib/utils/formatters";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { ChevronDown, ExternalLink, CheckCircle, LogOut } from "lucide-react";

import Button from "@/components/ui/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NETWORKS } from "@/lib/constants/networks";

export const ConnectWalletButton: React.FC = () => {
    const { isDarkTheme, getNetworkColor } = useTheme();
    const {
        connect,
        disconnect,
        connectionState,
        activeAccount,
        accounts,
        setActiveAccount,
        activeNetwork,
        switchNetwork,
        wallets,
        isWalletInstalled,
    } = useWallet();

    // Derived states for UI rendering
    const isConnecting = connectionState.status === "connecting";
    const isConnected = connectionState.status === "connected";
    const connectionError = connectionState.status === "error" ? connectionState.error : null;

    // Memoize encoded address to avoid recalculations
    const encodedAddress = useMemo(() => {
        if (!activeAccount) return "";
        return encodeAddress(
            activeAccount.address,
            activeNetwork.id === "polkadot" ? 0 : 42
        );
    }, [activeAccount, activeNetwork?.id]);

    // Connect button - shown when no account is connected
    if (!activeAccount) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="networkColored"
                        disabled={isConnecting}
                        isLoading={isConnecting}
                        className="px-4 py-2 h-10 rounded-lg"
                    >
                        <span className="mr-2">{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
                        <ChevronDown size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1 rounded-lg shadow-md">
                    {connectionError && (
                        <div className="px-2 py-1 mb-1 text-xs bg-error/10 text-error rounded-md">
                            {connectionError.message}
                        </div>
                    )}

                    <div className="p-2 mb-1 text-xs text-muted-foreground bg-surface-variant rounded-md">
                        Select a wallet to connect
                    </div>

                    {wallets.map((wallet) =>
                        isWalletInstalled(wallet) ? (
                            <DropdownMenuItem
                                key={wallet.id}
                                onClick={() => connect(wallet.id)}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-surface transition-colors rounded-md"
                            >
                                <span className="font-medium">{wallet.name}</span>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                key={wallet.id}
                                className="opacity-60 px-3 py-2 rounded-md"
                                disabled
                            >
<a
                                href={wallet.urls.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between w-full"
                                onClick={(e) => e.stopPropagation()}
                >
                                <span>{wallet.name}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs">Not installed</span>
                                    <ExternalLink size={12} />
                                </div>
                            </a>
              </DropdownMenuItem>
                )
          )}
            </DropdownMenuContent>
      </DropdownMenu >
    );
  }

// Connected state - compact account display with dropdown
return (
    <div className="flex items-center gap-2">
        {/* Network indicator */}
        <div
            className="px-3 py-1.5 rounded-lg text-xs font-medium border"
            style={{
                backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                borderColor: getNetworkColor('primary'),
                color: getNetworkColor('primary')
            }}
        >
            {activeNetwork.name}
        </div>

        {/* Account dropdown */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="h-9 rounded-lg px-3 py-1.5"
                    style={{
                        borderColor: getNetworkColor('primary'),
                    }}
                >
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-start">
                            <span className="font-medium text-xs leading-tight">
                                {activeAccount.name || "Account"}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                                {truncateHash(encodedAddress, 5)}
                            </span>
                        </div>
                        <ChevronDown className="ml-1" size={14} />
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60 p-1 rounded-lg shadow-md">
                <div className="px-3 py-2 mb-1 text-sm font-medium">
                    Networks
                </div>

                {/* Network selection */}
                <div className="grid grid-cols-2 gap-1 mb-2 px-2">
                    {Object.values(NETWORKS).map((network) => (
                        <button
                            key={network.id}
                            disabled={network.id === activeNetwork.id}
                            className={`
                  px-3 py-2 rounded-md text-xs flex items-center justify-between
                  ${network.id === activeNetwork.id
                                    ? 'bg-network-primary/10 text-network-primary'
                                    : 'hover:bg-surface-variant cursor-pointer'}
                `}
                            onClick={() => switchNetwork(network)}
                        >
                            <span>{network.name}</span>
                            {network.id === activeNetwork.id && (
                                <CheckCircle className="shrink-0" size={12} />
                            )}
                        </button>
                    ))}
                </div>

                <DropdownMenuSeparator />

                {/* Accounts section */}
                <div className="px-3 py-2 text-sm font-medium">
                    Accounts
                </div>

                <div className="max-h-40 overflow-y-auto px-1">
                    {accounts.map((acc) => {
                        const accEncodedAddress = encodeAddress(
                            acc.address,
                            activeNetwork.id === "polkadot" ? 0 : 42
                        );
                        const truncatedAddress = truncateHash(accEncodedAddress, 6);

                        return (
                            <DropdownMenuItem
                                key={accEncodedAddress}
                                disabled={acc.address === activeAccount.address}
                                className={`
                    mb-1 rounded-md px-3 py-2
                    ${acc.address === activeAccount.address
                                        ? 'bg-network-primary/10 text-network-primary'
                                        : 'hover:bg-surface-variant cursor-pointer'}
                  `}
                                onClick={() => setActiveAccount(acc)}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                        <div className="font-medium text-sm">
                                            {acc.name || "Account"}
                                        </div>
                                        <div className="text-xs font-mono text-muted-foreground">{truncatedAddress}</div>
                                    </div>
                                    {acc.address === activeAccount.address && (
                                        <CheckCircle className="shrink-0 text-network-primary" size={14} />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        );
                    })}
                </div>

                <DropdownMenuSeparator />

                {/* Disconnect button */}
                <DropdownMenuItem
                    className="mt-1 rounded-md cursor-pointer hover:bg-surface-variant px-3 py-2"
                    onClick={disconnect}
                >
                    <div className="flex items-center gap-2 text-sm text-error">
                        <LogOut size={14} />
                        <span>Disconnect</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);
};