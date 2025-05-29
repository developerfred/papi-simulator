/*  eslint-disable  @typescript-eslint/no-explicit-any, import/no-anonymous-default-export, prefer-const */

/**
 * Polyfill for crypto.randomUUID() to ensure compatibility across all environments
 *
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Check if crypto is available
const hasCrypto = isBrowser && 'crypto' in window;

// Check if randomUUID is available
const hasRandomUUID = hasCrypto && 'randomUUID' in window.crypto;

/**
 * Fallback UUID v4 generator using Math.random()
 * This is cryptographically less secure but works in all environments
 */
function generateUUIDFallback(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Secure UUID v4 generator using crypto.getRandomValues()
 * More secure than Math.random() fallback
 */
function generateUUIDSecure(): string {
    if (!hasCrypto || !window.crypto.getRandomValues) {
        return generateUUIDFallback();
    }

    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);

    // Set version (4) and variant bits
    array[6] = (array[6] & 0x0f) | 0x40; // Version 4
    array[8] = (array[8] & 0x3f) | 0x80; // Variant 10

    const hex = Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32)
    ].join('-');
}

/**
 * Main UUID generator function that handles all compatibility issues
 */
export function generateUUID(): string {
    try {
        // Try to use native crypto.randomUUID() first
        if (hasRandomUUID) {
            return window.crypto.randomUUID();
        }

        // Fall back to secure generation
        if (hasCrypto) {
            return generateUUIDSecure();
        }

        // Final fallback for environments without crypto
        return generateUUIDFallback();
    } catch (error) {
        console.warn('UUID generation error, falling back to Math.random:', error);
        return generateUUIDFallback();
    }
}

/**
 * Polyfill crypto.randomUUID if it doesn't exist
 * This should be called early in your application
 */
export function polyfillCryptoRandomUUID(): void {
    if (isBrowser && hasCrypto && !hasRandomUUID) {
        try {
            // Add randomUUID method to crypto object
            Object.defineProperty(window.crypto, 'randomUUID', {
                value: generateUUIDSecure,
                writable: false,
                enumerable: true,
                configurable: false
            });

            console.log('✅ crypto.randomUUID polyfill applied successfully');
        } catch (error) {
            console.warn('⚠️ Failed to polyfill crypto.randomUUID:', error);
        }
    }
}

/**
 * Initialize polyfill automatically when this module is imported
 */
if (isBrowser) {
    polyfillCryptoRandomUUID();
}

/**
 * Utility function to check crypto support
 */
export function checkCryptoSupport(): {
    hasCrypto: boolean;
    hasRandomUUID: boolean;
    hasGetRandomValues: boolean;
    isSecureContext: boolean;
} {
    return {
        hasCrypto,
        hasRandomUUID: hasRandomUUID || (hasCrypto && 'randomUUID' in window.crypto),
        hasGetRandomValues: hasCrypto && 'getRandomValues' in window.crypto,
        isSecureContext: isBrowser && window.isSecureContext
    };
}

/**
 * Enhanced crypto utilities for blockchain applications
 */
export class CryptoUtils {
    /**
     * Generate a random hex string of specified length
     */
    static randomHex(length: number): string {
        if (length % 2 !== 0) {
            throw new Error('Length must be even for hex string');
        }

        const bytes = Math.floor(length / 2);

        if (hasCrypto && window.crypto.getRandomValues) {
            const array = new Uint8Array(bytes);
            window.crypto.getRandomValues(array);
            return Array.from(array)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        // Fallback using Math.random
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 16).toString(16);
        }
        return result;
    }

    /**
     * Generate random bytes
     */
    static randomBytes(length: number): Uint8Array {
        const array = new Uint8Array(length);

        if (hasCrypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(array);
        } else {
            // Fallback using Math.random
            for (let i = 0; i < length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }

        return array;
    }

    /**
     * Generate a random integer within range
     */
    static randomInt(min: number, max: number): number {
        if (min >= max) {
            throw new Error('Min must be less than max');
        }

        const range = max - min;

        if (hasCrypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return min + (array[0] % range);
        }

        return min + Math.floor(Math.random() * range);
    }

    /**
     * Generate a secure random string
     */
    static randomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = this.randomInt(0, charset.length);
            result += charset[randomIndex];
        }

        return result;
    }
}

/**
 * React hook for generating UUIDs with proper dependency handling
 */
export function useUUID(): string {
    const [uuid] = React.useState(() => generateUUID());
    return uuid;
}

/**
 * React hook for crypto support detection
 */
export function useCryptoSupport() {
    const [support, setSupport] = React.useState(() => checkCryptoSupport());

    React.useEffect(() => {
        // Re-check support when component mounts (useful for SSR)
        setSupport(checkCryptoSupport());
    }, []);

    return support;
}

// Additional fixes for specific wallet injection scripts
export function fixWalletCryptoIssues(): void {
    if (!isBrowser) return;

    try {
        // Fix for Polkadot.js extension and other wallet injected scripts
        if (window.injectedWeb3) {
            Object.values(window.injectedWeb3).forEach((wallet: any) => {
                if (wallet && typeof wallet === 'object') {
                    // Ensure wallet has access to proper crypto functions
                    if (!wallet.crypto) {
                        wallet.crypto = {
                            randomUUID: generateUUID,
                            getRandomValues: window.crypto?.getRandomValues?.bind(window.crypto) ||
                                ((array: any) => {
                                    for (let i = 0; i < array.length; i++) {
                                        array[i] = Math.floor(Math.random() * 256);
                                    }
                                    return array;
                                })
                        };
                    }
                }
            });
        }

        // Fix for SubWallet and other extensions
        if (window.SubWallet) {
            if (!window.SubWallet.crypto) {
                window.SubWallet.crypto = {
                    randomUUID: generateUUID
                };
            }
        }

        console.log('✅ Wallet crypto issues fixed');
    } catch (error) {
        console.warn('⚠️ Failed to fix wallet crypto issues:', error);
    }
}

// Apply wallet fixes on load
if (isBrowser) {
    // Fix immediately
    fixWalletCryptoIssues();

    // Also fix when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixWalletCryptoIssues);
    }

    // Fix when wallets are injected (they often inject after page load)
    let walletCheckInterval: NodeJS.Timeout;
    const checkForWallets = () => {
        if (window.injectedWeb3 && Object.keys(window.injectedWeb3).length > 0) {
            fixWalletCryptoIssues();
            clearInterval(walletCheckInterval);
        }
    };

    walletCheckInterval = setInterval(checkForWallets, 1000);

    // Stop checking after 30 seconds
    setTimeout(() => {
        clearInterval(walletCheckInterval);
    }, 30000);
}

// Type declarations for global objects
declare global {
    interface Window {
        injectedWeb3?: Record<string, any>;
        SubWallet?: any;
    }
}

export default {
    generateUUID,
    polyfillCryptoRandomUUID,
    checkCryptoSupport,
    CryptoUtils,
    fixWalletCryptoIssues
};