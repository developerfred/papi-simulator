import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';

export function useLocalStorageState<T>(
	key: string,
	initialValue: T
): [T, Dispatch<SetStateAction<T>>] {	
	const [state, setState] = useState<T>(() => {
		if (typeof window === 'undefined') return initialValue;

		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error('Error reading from localStorage:', error);
			return initialValue;
		}
	});

	
	useEffect(() => {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem(key, JSON.stringify(state));
		} catch (error) {
			console.error('Error writing to localStorage:', error);
		}
	}, [key, state]);

	return [state, setState];
}