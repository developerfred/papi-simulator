import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
    useReducer,
    useContext,
    createContext,
    type RefObject
} from 'react';

import {
    debounce,
    throttle,
    memoize,
    asyncReducer,
    deepEqual,
    generateId,
    isFunction
} from '@/utils/core';

import type {
    AsyncState,
    AsyncAction,
    OptimizedEventListener,
    ValidationSchema,
    ValidationResult,
    ConsoleOutput
} from '@/types/core';

// ============================================================================
// PERFORMANCE HOOKS
// ============================================================================

// Optimized debounced value hook
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

// Optimized throttled callback hook
export function useThrottle<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const throttledFn = useMemo(
        () => throttle(callback, delay),
        [callback, delay]
    );

    return throttledFn as T;
}

// Memoized callback with dependency optimization
export function useOptimizedCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
): T {
    const memoizedCallback = useCallback(callback, deps);
    const memoizedFn = useMemo(() => memoize(memoizedCallback), [memoizedCallback]);

    return memoizedFn as T;
}

// Previous value tracking hook
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = value;
    });

    return ref.current;
}

// ============================================================================
// STATE MANAGEMENT HOOKS
// ============================================================================

// Enhanced async state hook with optimistic updates
export function useAsyncState<TData, TError = Error>(
    initialData: TData | null = null
) {
    const [state, dispatch] = useReducer(asyncReducer<TData, TError>, {
        data: initialData,
        loading: false,
        error: null
    });

    const execute = useCallback(async (asyncFunction: () => Promise<TData>) => {
        dispatch({ type: 'LOADING' });

        try {
            const data = await asyncFunction();
            dispatch({ type: 'SUCCESS', payload: data });
            return data;
        } catch (error) {
            dispatch({ type: 'ERROR', payload: error as TError });
            throw error;
        }
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    return {
        ...state,
        execute,
        reset
    };
}

// Local storage hook with type safety and SSR compatibility
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;

        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            const valueToStore = isFunction(value) ? value(storedValue) : value;
            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error saving to localStorage:`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
}

// Toggle hook with enhanced functionality
export function useToggle(
    initialValue = false
): [boolean, () => void, (value?: boolean) => void] {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => setValue(prev => !prev), []);
    const setToggle = useCallback((newValue?: boolean) => {
        setValue(newValue ?? !value);
    }, [value]);

    return [value, toggle, setToggle];
}

// ============================================================================
// COMPONENT INTERACTION HOOKS
// ============================================================================

// Outside click detection hook
export function useClickOutside<T extends HTMLElement>(
    handler: () => void
): RefObject<T> {
    const ref = useRef<T>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handler]);

    return ref;
}

// Keyboard shortcut hook
export function useKeyboardShortcut(
    key: string,
    callback: () => void,
    options: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {}
): void {
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const { ctrlKey = false, shiftKey = false, altKey = false } = options;

            if (
                event.key === key &&
                event.ctrlKey === ctrlKey &&
                event.shiftKey === shiftKey &&
                event.altKey === altKey
            ) {
                event.preventDefault();
                callback();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [key, callback, options]);
}

// Responsive breakpoint hook
export function useResponsive() {
    const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) setBreakpoint('sm');
            else if (width < 768) setBreakpoint('md');
            else if (width < 1024) setBreakpoint('lg');
            else setBreakpoint('xl');
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        breakpoint,
        isMobile: breakpoint === 'sm',
        isTablet: breakpoint === 'md',
        isDesktop: breakpoint === 'lg' || breakpoint === 'xl',
        isLarge: breakpoint === 'xl'
    };
}

// ============================================================================
// FORM HOOKS
// ============================================================================

// Enhanced form hook with validation
export function useForm<T extends Record<string, any>>(
    initialValues: T,
    validationSchema?: ValidationSchema<T>
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
        setValues(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as string]) {
            setErrors(prev => ({ ...prev, [name]: [] }));
        }
    }, [errors]);

    const setFieldTouched = useCallback((name: keyof T) => {
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    const validateField = useCallback((name: keyof T): string[] => {
        if (!validationSchema?.[name]) return [];

        const fieldErrors: string[] = [];
        const rules = validationSchema[name] || [];

        for (const rule of rules) {
            if (!rule.validate(values[name])) {
                fieldErrors.push(rule.message);
            }
        }

        return fieldErrors;
    }, [values, validationSchema]);

    const validateForm = useCallback((): ValidationResult => {
        if (!validationSchema) return { isValid: true, errors: {} };

        const formErrors: Record<string, string[]> = {};
        let isValid = true;

        for (const field in values) {
            const fieldErrors = validateField(field);
            if (fieldErrors.length > 0) {
                formErrors[field] = fieldErrors;
                isValid = false;
            }
        }

        setErrors(formErrors);
        return { isValid, errors: formErrors };
    }, [values, validateField, validationSchema]);

    const handleSubmit = useCallback(async (
        onSubmit: (values: T) => Promise<void> | void
    ) => {
        setIsSubmitting(true);

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {} as Record<string, boolean>);
        setTouched(allTouched);

        const validation = validateForm();

        if (validation.isValid) {
            try {
                await onSubmit(values);
            } catch (error) {
                console.error('Form submission error:', error);
            }
        }

        setIsSubmitting(false);
    }, [values, validateForm]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        setValue,
        setFieldTouched,
        validateField,
        validateForm,
        handleSubmit,
        reset,
        isValid: Object.keys(errors).length === 0
    };
}

// ============================================================================
// CONSOLE HOOKS
// ============================================================================

// Unified console management hook
export function useConsole(maxOutputs = 100) {
    const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    const addOutput = useCallback((
        type: ConsoleOutput['type'],
        content: string,
        metadata?: Record<string, unknown>
    ) => {
        const newOutput: ConsoleOutput = {
            id: generateId('console'),
            type,
            content,
            timestamp: Date.now(),
            metadata
        };

        setOutputs(prev => {
            const updated = [newOutput, ...prev];
            return updated.length > maxOutputs
                ? updated.slice(0, maxOutputs)
                : updated;
        });
    }, [maxOutputs]);

    const clearOutputs = useCallback(() => {
        setOutputs([]);
    }, []);

    const toggleVisibility = useCallback(() => {
        setIsVisible(prev => !prev);
    }, []);

    // Convenience methods
    const log = useCallback((content: string, metadata?: Record<string, unknown>) => {
        addOutput('log', content, metadata);
    }, [addOutput]);

    const error = useCallback((content: string, metadata?: Record<string, unknown>) => {
        addOutput('error', content, metadata);
    }, [addOutput]);

    const warning = useCallback((content: string, metadata?: Record<string, unknown>) => {
        addOutput('warning', content, metadata);
    }, [addOutput]);

    const success = useCallback((content: string, metadata?: Record<string, unknown>) => {
        addOutput('success', content, metadata);
    }, [addOutput]);

    return {
        outputs,
        isVisible,
        addOutput,
        clearOutputs,
        toggleVisibility,
        log,
        error,
        warning,
        success
    };
}

// ============================================================================
// INTERSECTION OBSERVER HOOK
// ============================================================================

// Intersection observer hook for performance optimization
export function useIntersectionObserver<T extends HTMLElement>(
    options: IntersectionObserverInit = {}
): [RefObject<T>, boolean] {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsIntersecting(entry.isIntersecting),
            {
                threshold: 0.1,
                ...options
            }
        );

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [options]);

    return [ref, isIntersecting];
}

// ============================================================================
// NETWORK CONNECTIVITY HOOK
// ============================================================================

// Network status hook
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}

// ============================================================================
// COMPOUND COMPONENT HOOK
// ============================================================================

// Context for compound components
export function useCompoundComponent<T>(displayName: string) {
    const Context = createContext<T | null>(null);
    Context.displayName = displayName;

    const useContext = () => {
        const context = useContext(Context);
        if (!context) {
            throw new Error(
                `useContext must be used within a ${displayName} component`
            );
        }
        return context;
    };

    const Provider = Context.Provider;

    return { Provider, useContext };
}

// ============================================================================
// PERFORMANCE MONITORING HOOK
// ============================================================================

// Component performance monitoring
export function usePerformanceMonitor(componentName: string) {
    const renderCount = useRef(0);
    const startTime = useRef<number>(0);

    useEffect(() => {
        renderCount.current += 1;
        startTime.current = performance.now();

        return () => {
            const endTime = performance.now();
            const renderTime = endTime - startTime.current;

            if (process.env.NODE_ENV === 'development') {
                console.log(
                    `${componentName} - Render #${renderCount.current} took ${renderTime.toFixed(2)}ms`
                );
            }
        };
    });

    const logPerformance = useCallback((operation: string, time: number) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`${componentName} - ${operation}: ${time.toFixed(2)}ms`);
        }
    }, [componentName]);

    return { renderCount: renderCount.current, logPerformance };
}

// ============================================================================
// COPY TO CLIPBOARD HOOK
// ============================================================================

// Copy to clipboard with feedback
export function useCopyToClipboard() {
    const [isCopied, setIsCopied] = useState(false);

    const copy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);

            // Reset after 2 seconds
            setTimeout(() => setIsCopied(false), 2000);

            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            setIsCopied(false);
            return false;
        }
    }, []);

    return { copy, isCopied };
}

// ============================================================================
// MEDIA QUERY HOOK
// ============================================================================

// Media query hook for responsive design
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);

        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
}