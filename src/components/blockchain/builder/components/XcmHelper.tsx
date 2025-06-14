/* eslint-disable react/display-name */

import React from "react";

interface XcmHelperProps {
    presetId: string;
}

export const XcmHelper: React.FC<XcmHelperProps> = React.memo(({ presetId }) => {
    if (!presetId.startsWith('xcm') && !presetId.startsWith('hrmp')) return null;

    const getHelpContent = () => {
        switch (presetId) {
            case 'xcm_reserve_transfer':
                return {
                    title: 'Reserve Transfer',
                    description: 'Use reserve transfer when the asset is trusted between chains.',
                    tips: [
                        'Ideal for DOT/KSM between relay chain and parachains',
                        'Requires destination chain to trust the origin',
                        'Safer than teleport for non-native assets',
                        'Works with most parachain ecosystems'
                    ],
                    supportedNetworks: ['Polkadot', 'Kusama'],
                    notSupported: ['Paseo (unreliable)', 'Local networks']
                };
            case 'xcm_teleport':
                return {
                    title: 'Teleport Assets',
                    description: 'Teleport is used only between fully trusted chains.',
                    tips: [
                        'Only between relay chain and system parachains',
                        'Works on Paseo for system parachains',
                        'Do not use for third-party assets',
                        'Faster but requires explicit trust relationship'
                    ],
                    supportedNetworks: ['Polkadot', 'Kusama', 'Paseo (limited)', 'Westend'],
                    notSupported: ['Arbitrary parachain pairs without trust setup']
                };
            case 'xcm_limited_reserve_transfer':
                return {
                    title: 'Limited Reserve Transfer',
                    description: 'Reserve transfer with weight and fee control.',
                    tips: [
                        'Allows defining execution weight limit',
                        'Useful for controlling execution costs',
                        'Recommended for large transfers',
                        'Prevents excessive fee consumption'
                    ],
                    supportedNetworks: ['Polkadot', 'Kusama'],
                    notSupported: ['Paseo (not reliable)', 'Testnet environments']
                };
            case 'xcm_limited_teleport':
                return {
                    title: 'Limited Teleport',
                    description: 'Teleport assets with weight and fee limits.',
                    tips: [
                        'Combines teleport speed with cost control',
                        'Ideal for system parachain interactions',
                        'Works well on Paseo for trusted routes',
                        'Prevents transaction failures due to weight issues'
                    ],
                    supportedNetworks: ['Polkadot', 'Kusama', 'Paseo', 'Westend'],
                    notSupported: ['Non-trusted parachain pairs']
                };
            case 'xcmp_queue_send':
                return {
                    title: 'XCMP Queue Send',
                    description: 'Send custom XCM messages via XCMP queue.',
                    tips: [
                        'For advanced XCM message composition',
                        'Requires deep understanding of XCM format',
                        'Direct message queue interaction',
                        'Not recommended for beginners'
                    ],
                    supportedNetworks: ['Polkadot', 'Kusama'],
                    notSupported: ['Paseo (limited XCMP)', 'Most testnets']
                };
            case 'hrmp_channel_request':
                return {
                    title: 'HRMP Channel Request',
                    description: 'Request communication channel opening between parachains.',
                    tips: [
                        'Required for direct parachain-to-parachain communication',
                        'Can be set up manually on Paseo',
                        'Requires governance approval on mainnet',
                        'Deposit will be required and returned when closed'
                    ],
                    supportedNetworks: ['Polkadot', 'Kusama', 'Paseo (manual)'],
                    notSupported: ['Some testnets may have restrictions']
                };
            default:
                return null;
        }
    };

    const content = getHelpContent();
    if (!content) return null;

    return (
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-amber-900 dark:text-amber-100">
                    💡 {content.title}
                </h4>
                <span className="text-xs px-2 py-1 rounded bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                    Helper
                </span>
            </div>

            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                {content.description}
            </p>

            {/* Tips Section */}
            <div className="mb-3">
                <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-2">
                    📋 Best Practices:
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    {content.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                            <span className="mr-2 text-amber-600 dark:text-amber-400">•</span>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Network Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                {/* Supported Networks */}
                <div>
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                        ✅ Supported Networks:
                    </p>
                    <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        {content.supportedNetworks.map((network, index) => (
                            <li key={index} className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-2"></span>
                                <span>{network}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Not Supported */}
                {content.notSupported && content.notSupported.length > 0 && (
                    <div>
                        <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                            ⚠️ Not Supported:
                        </p>
                        <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                            {content.notSupported.map((limitation, index) => (
                                <li key={index} className="flex items-center">
                                    <span className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full mr-2"></span>
                                    <span>{limitation}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Special notes for specific presets */}
            {presetId === 'xcm_teleport' && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                    <p className="text-blue-800 dark:text-blue-200">
                        <span className="font-medium">🎯 Paseo Tip:</span> Teleport works well between Paseo Relay ↔ Paseo Asset Hub.
                        Perfect for testing before mainnet deployment.
                    </p>
                </div>
            )}

            {presetId === 'xcm_reserve_transfer' && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
                    <p className="text-red-800 dark:text-red-200">
                        <span className="font-medium">⚠️ Paseo Warning:</span> Reserve transfers may not work reliably on Paseo.
                        Use teleport for testing instead.
                    </p>
                </div>
            )}

            {presetId === 'hrmp_channel_request' && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs">
                    <p className="text-green-800 dark:text-green-200">
                        <span className="font-medium">💡 Development Tip:</span> HRMP channels can be manually configured on Paseo.
                        Check the documentation for setup instructions.
                    </p>
                </div>
            )}
        </div>
    );
});