/* eslint-disable react/display-name, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from "react";
import type { Network } from "../types/transaction.types";
import { detectNetworkType } from "../constants/presets";

interface XcmNetworkStatusProps {
    network: Network;
}


const XCM_SUPPORT_CONFIG = {
    polkadot: {
        level: 'full' as const,
        features: { reserve: true, teleport: true, hrmp: true, xcmp: true },
        parachains: ['Acala', 'Moonbeam', 'Astar', 'Parallel', 'Centrifuge', 'Interlay', 'HydraDX', 'Phala'],
        status: 'success' as const,
        version: 'v4',
        notes: ['Full XCM v4 support', 'Production-ready ecosystem']
    },
    kusama: {
        level: 'full' as const,
        features: { reserve: true, teleport: true, hrmp: true, xcmp: true },
        parachains: ['Karura', 'Moonriver', 'Shiden', 'Khala', 'Bifrost', 'Kintsugi', 'Basilisk'],
        status: 'success' as const,
        version: 'v4',
        notes: ['Full XCM v4 support', 'Canary network with experimental features']
    },
    paseo: {
        level: 'limited' as const,
        features: { reserve: false, teleport: true, hrmp: true, xcmp: false },
        parachains: ['Ajuna', 'Amplitude', 'Frequency', 'POP Network', 'Integritee'],
        status: 'warning' as const,
        version: 'v4 (limited)',
        notes: ['Testnet environment', 'Reserve transfers unreliable'],
        limitations: ['HRMP channels need manual setup', 'Limited parachain ecosystem']
    },
    westend: {
        level: 'experimental' as const,
        features: { reserve: true, teleport: true, hrmp: true, xcmp: true },
        parachains: ['Limited testnet parachains'],
        status: 'info' as const,
        version: 'v4 (experimental)',
        notes: ['Protocol testing', 'May be unstable']
    }
};

// UI Components
const StatusBadge: React.FC<{ status: keyof typeof XCM_SUPPORT_CONFIG[keyof typeof XCM_SUPPORT_CONFIG]['status'], level: string }> = ({ status, level }) => {
    const variants = {
        success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    };

    const icons = {
        full: '✓',
        limited: '⚠',
        experimental: '🧪',
        none: '✕'
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${variants[status]}`}>
            <span className="mr-1">{icons[level as keyof typeof icons]}</span>
            {level.toUpperCase()}
        </span>
    );
};

const FeatureList: React.FC<{ features: Record<string, boolean>, compact?: boolean }> = ({ features, compact = false }) => {
    const featureNames = {
        reserve: 'Reserve Transfer',
        teleport: 'Teleport Assets',
        hrmp: 'HRMP Channels',
        xcmp: 'XCMP Messages'
    };

    if (compact) {
        const supported = Object.entries(features).filter(([_, supported]) => supported).length;
        const total = Object.keys(features).length;
        return (
            <span className="text-sm text-theme-secondary">
                {supported}/{total} features supported
            </span>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-2">
            {Object.entries(features).map(([key, supported]) => (
                <div key={key} className="flex items-center space-x-2 text-sm">
                    <span className={supported ? 'text-green-500' : 'text-red-500'}>
                        {supported ? '✓' : '✕'}
                    </span>
                    <span className="text-theme-secondary">
                        {featureNames[key as keyof typeof featureNames]}
                    </span>
                </div>
            ))}
        </div>
    );
};

const ParachainList: React.FC<{ parachains: string[], maxShow?: number }> = ({ parachains, maxShow = 4 }) => {
    const shown = parachains.slice(0, maxShow);
    const remaining = parachains.length - maxShow;

    return (
        <div className="text-sm text-theme-secondary">
            {shown.join(', ')}
            {remaining > 0 && (
                <span className="text-theme-tertiary"> +{remaining} more</span>
            )}
        </div>
    );
};

export const XcmNetworkStatus: React.FC<XcmNetworkStatusProps> = React.memo(({ network }) => {
    const networkType = detectNetworkType(network?.name, network?.symbol, network?.relay);
    const config = XCM_SUPPORT_CONFIG[networkType as keyof typeof XCM_SUPPORT_CONFIG];

    // No XCM support
    if (!config) {
        return (
            <div className="p-5 rounded-xl bg-theme-surface border-2 border-theme 
                    shadow-sm network-transition">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-theme-surface-variant flex items-center justify-center">
                        <span className="text-theme-tertiary">✕</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-theme-primary">XCM Not Available</h4>
                        <p className="text-sm text-theme-secondary mt-1">
                            Connect to Polkadot, Kusama, or Paseo to use XCM features
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const statusVariants = {
        success: 'border-green-500/70 dark:border-green-400/70 bg-theme-surface',
        warning: 'border-amber-500/70 dark:border-amber-400/70 bg-theme-surface',
        info: 'border-blue-500/70 dark:border-blue-400/70 bg-theme-surface',
        error: 'border-red-500/70 dark:border-red-400/70 bg-theme-surface'
    };

    return (
        <div className={`p-5 rounded-xl border-2 shadow-lg hover:shadow-xl 
                   transition-all duration-300 network-transition
                   ${statusVariants[config.status]}`}>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-network-primary/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-network-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-theme-primary text-lg">
                            XCM Support ({config.version})
                        </h4>
                        <p className="text-sm text-theme-secondary">
                            Cross-chain messaging capabilities
                        </p>
                    </div>
                </div>
                <StatusBadge status={config.status} level={config.level} />
            </div>

            {/* Features Overview */}
            <div className="space-y-4">
                <div>
                    <h5 className="font-semibold text-theme-primary mb-3">Available Features</h5>
                    <FeatureList features={config.features} />
                </div>

                {/* Parachains */}
                <div>
                    <h5 className="font-semibold text-theme-primary mb-2">Compatible Parachains</h5>
                    <ParachainList parachains={config.parachains} />
                </div>

                {/* Limitations */}
                {config.limitations && (
                    <div className="p-3 rounded-lg bg-theme-surface-variant border border-theme">
                        <h6 className="font-semibold text-amber-600 dark:text-amber-400 mb-2 text-sm">
                            ⚠ Limitations
                        </h6>
                        <ul className="space-y-1">
                            {config.limitations.map((limitation, index) => (
                                <li key={index} className="text-xs text-theme-secondary flex items-start">
                                    <span className="text-amber-500 mr-2 mt-0.5">•</span>
                                    {limitation}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Notes */}
                <div className="p-3 rounded-lg bg-theme-surface-variant border border-theme">
                    <h6 className="font-semibold text-theme-primary mb-2 text-sm">
                        📝 Notes
                    </h6>
                    <ul className="space-y-1">
                        {config.notes.map((note, index) => (
                            <li key={index} className="text-xs text-theme-secondary flex items-start">
                                <span className="text-network-primary mr-2 mt-0.5">•</span>
                                {note}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
});