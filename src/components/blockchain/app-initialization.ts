
/*  eslint-disable @typescript-eslint/no-explicit-any, import/no-anonymous-default-export, @typescript-eslint/no-unused-vars */
import { polyfillCryptoRandomUUID, fixWalletCryptoIssues, checkCryptoSupport } from './crypto-polyfill';

/**
 * Initialize the application with all necessary polyfills and fixes
 * This should be called at the very beginning of your app
 */
export function initializeApp() {
    console.log('🚀 Initializing blockchain dashboard...');

    // 1. Apply crypto polyfills immediately
    polyfillCryptoRandomUUID();

    // 2. Check crypto support and log status
    const support = checkCryptoSupport();
    console.log('🔐 Crypto support status:', support);

    if (!support.isSecureContext) {
        console.warn('⚠️ Not in secure context - some crypto features may not work');
    }

    // 3. Fix wallet crypto issues
    fixWalletCryptoIssues();

    // 4. Set up global error handling for crypto-related errors
    setupGlobalErrorHandling();

    // 5. Initialize performance monitoring
    setupPerformanceMonitoring();

    console.log('✅ App initialization complete');
}

/**
 * Set up global error handling specifically for crypto-related issues
 */
function setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason;

        if (error && typeof error === 'object') {
            const errorMessage = error.message || error.toString();

            // Check for crypto-related errors
            if (errorMessage.includes('randomUUID') ||
                errorMessage.includes('crypto') ||
                errorMessage.includes('getRandomValues')) {

                console.error('🔴 Crypto-related error detected:', error);

                // Try to apply fixes again
                setTimeout(() => {
                    polyfillCryptoRandomUUID();
                    fixWalletCryptoIssues();
                }, 100);

                // Prevent the error from being logged to console if we can handle it
                event.preventDefault();
            }
        }
    });

    // Handle regular errors
    window.addEventListener('error', (event) => {
        const error = event.error;

        if (error && typeof error === 'object') {
            const errorMessage = error.message || error.toString();

            if (errorMessage.includes('randomUUID') ||
                errorMessage.includes('crypto') ||
                errorMessage.includes('getRandomValues')) {

                console.error('🔴 Crypto-related script error:', error);

                // Try to apply fixes
                setTimeout(() => {
                    polyfillCryptoRandomUUID();
                    fixWalletCryptoIssues();
                }, 100);
            }
        }
    });
}

/**
 * Set up performance monitoring for crypto operations
 */
function setupPerformanceMonitoring() {
    // Monitor crypto performance
    if (window.performance && window.performance.mark) {
        window.performance.mark('crypto-init-start');

        setTimeout(() => {
            window.performance.mark('crypto-init-end');
            try {
                window.performance.measure('crypto-init', 'crypto-init-start', 'crypto-init-end');
                const measures = window.performance.getEntriesByName('crypto-init');
                if (measures.length > 0) {
                    console.log(`⏱️ Crypto initialization took ${measures[0].duration.toFixed(2)}ms`);
                }
            } catch (e) {
                // Performance API not fully supported
            }
        }, 1000);
    }
}

/**
 * Enhanced wallet detection and fixing
 */
export function setupWalletSupport() {
    let walletFixAttempts = 0;
    const maxAttempts = 10;

    const checkAndFixWallets = () => {
        walletFixAttempts++;

        try {
            // Check for common wallet injections
            const walletDetected =
                window.injectedWeb3 ||
                (window as any).SubWallet ||
                (window as any).polkadotWallet ||
                (window as any).talismanWallet;

            if (walletDetected) {
                console.log('💼 Wallet detected, applying fixes...');
                fixWalletCryptoIssues();
                return true;
            }

            if (walletFixAttempts < maxAttempts) {
                setTimeout(checkAndFixWallets, 2000);
            } else {
                console.log('💼 No wallets detected after maximum attempts');
            }

        } catch (error) {
            console.warn('⚠️ Error during wallet detection:', error);
        }

        return false;
    };

    // Start checking immediately
    checkAndFixWallets();

    // Also listen for wallet injection events
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(checkAndFixWallets, 1000);
    });

    // Listen for extension events
    window.addEventListener('load', () => {
        setTimeout(checkAndFixWallets, 2000);
    });
}

/**
 * Debug information for troubleshooting
 */
export function getDebugInfo() {
    const support = checkCryptoSupport();

    return {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        location: window.location.href,
        protocol: window.location.protocol,
        cryptoSupport: support,
        wallets: {
            injectedWeb3: !!window.injectedWeb3,
            subWallet: !!(window as any).SubWallet,
            polkadotWallet: !!(window as any).polkadotWallet,
            talismanWallet: !!(window as any).talismanWallet,
        },
        // Test crypto functions
        cryptoTests: {
            canGenerateUUID: (() => {
                try {
                    if (window.crypto && window.crypto.randomUUID) {
                        window.crypto.randomUUID();
                        return true;
                    }
                    return false;
                } catch {
                    return false;
                }
            })(),
            canGetRandomValues: (() => {
                try {
                    if (window.crypto && window.crypto.getRandomValues) {
                        const array = new Uint8Array(1);
                        window.crypto.getRandomValues(array);
                        return true;
                    }
                    return false;
                } catch {
                    return false;
                }
            })()
        }
    };
}

// Auto-initialize if we're in a browser environment
if (typeof window !== 'undefined') {
    // Run initialization as soon as possible
    initializeApp();

    // Set up wallet support
    setupWalletSupport();

    // Expose debug info globally for troubleshooting
    (window as any).getBlockchainDebugInfo = getDebugInfo;

    // Log debug info in development
    if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
            console.log('🐛 Debug info:', getDebugInfo());
        }, 3000);
    }
}

export default {
    initializeApp,
    setupWalletSupport,
    getDebugInfo
};