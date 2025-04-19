import { useState, useEffect, useCallback } from 'react';

export function useMountedState(): [boolean, () => boolean] {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    
    const getMounted = useCallback(() => mounted, [mounted]);

    return [mounted, getMounted];
}
