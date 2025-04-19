import { useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(
	key: string,
	initialValue: T,
): [T, (value: T) => void] {
	const [storedValue, setStoredValue] = useState<T>(initialValue);

	const initialized = useRef(false);

	useEffect(() => {
		if (typeof window === "undefined" || initialized.current) return;

		try {
			const item = localStorage.getItem(key);
			if (item) {
				setStoredValue(JSON.parse(item));
			}
			initialized.current = true;
		} catch (error) {
			console.error("Error reading from localStorage:", error);
		}
	}, [key]);

	const setValue = (value: T): void => {
		try {
			setStoredValue(value);

			if (typeof window !== "undefined") {
				localStorage.setItem(key, JSON.stringify(value));
			}
		} catch (error) {
			console.error("Error writing to localStorage:", error);
		}
	};

	return [storedValue, setValue];
}
