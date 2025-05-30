/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { initializeApp, setupWalletSupport, getDebugInfo } from '../app-initialization';

interface CryptoSetupProps {
    children: React.ReactNode;
    showDebugInfo?: boolean;
}

/**
 * Component that handles crypto initialization for Next.js apps
 * Should be placed high in your component tree, ideally in _app.tsx or layout.tsx
 */
export function CryptoSetup({ children, showDebugInfo = false }: CryptoSetupProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    useEffect(() => {
        // Only run in browser environment
        if (typeof window === 'undefined') return;

        let mounted = true;

        const initialize = async () => {
            try {
                // Initialize crypto polyfills
                initializeApp();

                // Set up wallet support
                setupWalletSupport();

                // Get debug info if requested
                if (showDebugInfo) {
                    const info = getDebugInfo();
                    if (mounted) {
                        setDebugInfo(info);
                    }
                }

                if (mounted) {
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error('Failed to initialize crypto setup:', error);
                if (mounted) {
                    setIsInitialized(true); // Continue anyway
                }
            }
        };

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(initialize, 100);

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, [showDebugInfo]);

    // Show loading state while initializing (optional)
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-network-primary border-t-transparent mx-auto mb-4" />
                    <p className="text-theme-secondary">Initializing secure connection...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {children}
            {showDebugInfo && debugInfo && (
                <DebugInfoDisplay debugInfo={debugInfo} />
            )}
        </>
    );
}

/**
 * Debug info display component (only shown in development)
 */
function DebugInfoDisplay({ debugInfo }: { debugInfo: any }) {
    const [isVisible, setIsVisible] = useState(false);

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="bg-gray-800 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
            >
                🐛 Debug Info
            </button>

            {isVisible && (
                <div className="absolute bottom-full left-0 mb-2 w-80 max-h-96 overflow-auto bg-gray-900 text-white text-xs p-4 rounded shadow-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">Crypto Debug Info</span>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                    <pre className="whitespace-pre-wrap">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

/**
 * Hook to check if crypto is properly initialized
 */
export function useCryptoReady() {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkCrypto = () => {
            try {
                // Test if crypto.randomUUID works
                if (window.crypto && window.crypto.randomUUID) {
                    window.crypto.randomUUID();
                    setIsReady(true);
                    setError(null);
                } else {
                    setError('crypto.randomUUID not available');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown crypto error');
            }
        };

        checkCrypto();

        // Check again after a delay (for wallet injections)
        const timeoutId = setTimeout(checkCrypto, 2000);

        return () => clearTimeout(timeoutId);
    }, []);

    return { isReady, error };
}

/**
 * Higher-order component for pages that require crypto functionality
 */
export function withCryptoSupport<P extends object>(
    Component: React.ComponentType<P>
) {
    return function CryptoSupportWrapper(props: P) {
        const { isReady, error } = useCryptoReady();

        if (error) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center p-8">
                        <div className="text-error mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-theme-primary mb-2">
                            Crypto Support Error
                        </h2>
                        <p className="text-theme-secondary mb-4">
                            {error}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-network-primary text-white px-4 py-2 rounded hover:bg-network-secondary transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        if (!isReady) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-network-primary border-t-transparent mx-auto mb-4" />
                        <p className="text-theme-secondary">Setting up secure crypto...</p>
                    </div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}

export default CryptoSetup;