import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isHydrated, setIsHydrated] = useState(false);

    
    useEffect(() => {
        setIsHydrated(true);

        try {
            const item = localStorage.getItem(key);
            const parsedItem: T = item ? JSON.parse(item) : initialValue;
            setStoredValue(parsedItem);
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            setStoredValue(initialValue);
        }
    }, [key, initialValue]);

    
    const setValue = (value: T): void => {
        try {
    
            setStoredValue(value);

    
            if (isHydrated) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    };

    return [storedValue, setValue];
}