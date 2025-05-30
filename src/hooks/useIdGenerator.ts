import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';

export interface UseIdGeneratorReturn {
    id: string;
    regenerate: () => void;
    reset: () => void;
}

export function useIdGenerator(prefix?: string): UseIdGeneratorReturn {
    const [id, setId] = useState(() => prefix ? `${prefix}_${nanoid()}` : nanoid());

    const regenerate = useCallback(() => {
        setId(prefix ? `${prefix}_${nanoid()}` : nanoid());
    }, [prefix]);

    const reset = useCallback(() => {
        setId(prefix ? `${prefix}_${nanoid()}` : nanoid());
    }, [prefix]);

    return {
        id,
        regenerate,
        reset
    };
}