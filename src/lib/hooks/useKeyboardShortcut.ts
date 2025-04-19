import { useEffect, useCallback } from 'react';

type KeyboardShortcutOptions = {
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    disabled?: boolean;
    preventDefaultEvent?: boolean;
};

export function useKeyboardShortcut(
    key: string | string[],
    callback: (e: KeyboardEvent) => void,
    options: KeyboardShortcutOptions = {}
) {
    const {
        ctrlKey = false,
        altKey = false,
        shiftKey = false,
        metaKey = false,
        disabled = false,
        preventDefaultEvent = true,
    } = options;

    const keyHandler = useCallback(
        (event: KeyboardEvent) => {
            if (disabled) return;

            const keys = Array.isArray(key) ? key : [key];
            const isTargetKey = keys.some(k => k.toLowerCase() === event.key.toLowerCase());

            if (
                isTargetKey &&
                event.ctrlKey === ctrlKey &&
                event.altKey === altKey &&
                event.shiftKey === shiftKey &&
                event.metaKey === metaKey
            ) {
                if (preventDefaultEvent) {
                    event.preventDefault();
                }
                callback(event);
            }
        },
        [key, callback, ctrlKey, altKey, shiftKey, metaKey, disabled, preventDefaultEvent]
    );

    useEffect(() => {
        if (disabled) return;

        window.addEventListener('keydown', keyHandler);
        return () => {
            window.removeEventListener('keydown', keyHandler);
        };
    }, [keyHandler, disabled]);
}