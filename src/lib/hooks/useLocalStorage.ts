import { useState, useEffect } from 'react';

/**
 * Hook for using localStorage with type safety
 * 
 * @param key The localStorage key
 * @param initialValue The initial value if nothing is in localStorage
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    // Initialize on first render only
    useEffect(() => {
        try {
            // Check if client-side
            if (typeof window === 'undefined') {
                return;
            }

            // Get from local storage by key
            const item = window.localStorage.getItem(key);

            // Parse stored json or return initialValue
            setStoredValue(item ? JSON.parse(item) : initialValue);
        } catch (error) {
            // If error, use the initial value
            console.error('Error reading from localStorage:', error);
            setStoredValue(initialValue);
        }
    }, [key, initialValue]);

    // Function to update stored value
    const setValue = (value: T): void => {
        try {
            // Save state
            setStoredValue(value);

            // Check if client-side
            if (typeof window === 'undefined') {
                return;
            }

            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    };

    return [storedValue, setValue];
}