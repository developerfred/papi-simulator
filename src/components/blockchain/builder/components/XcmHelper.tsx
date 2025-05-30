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
                        'Safer than teleport for non-native assets'
                    ]
                };
            case 'xcm_teleport':
                return {
                    title: 'Teleport Assets',
                    description: 'Teleport is used only between fully trusted chains.',
                    tips: [
                        'Only between relay chain and system parachains',
                        'Do not use for third-party assets',
                        'Faster but less secure than reserve transfer'
                    ]
                };
            case 'xcm_limited_reserve_transfer':
                return {
                    title: 'Limited Reserve Transfer',
                    description: 'Reserve transfer with weight and fee control.',
                    tips: [
                        'Allows defining execution weight limit',
                        'Useful for controlling execution costs',
                        'Recommended for large transfers'
                    ]
                };
            case 'hrmp_channel_request':
                return {
                    title: 'HRMP Channel Request',
                    description: 'Request communication channel opening between parachains.',
                    tips: [
                        'Required for direct parachain-to-parachain communication',
                        'Requires governance approval',
                        'Deposit will be required'
                    ]
                };
            default:
                return null;
        }
    };

    const content = getHelpContent();
    if (!content) return null;

    return (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2">{content.title}</h4>
            <p className="text-sm text-amber-800 mb-3">{content.description}</p>
            <ul className="text-xs text-amber-700 space-y-1">
                {content.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{tip}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
});