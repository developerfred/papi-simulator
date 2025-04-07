import { Network } from './network';

/**
 * Represents a code example in the playground
 */
export interface Example {
    /** Unique identifier for the example */
    id: string;
    /** Display name for the example */
    name: string;
    /** Short description of what the example does */
    description: string;
    /** Function that generates code based on the selected network */
    getCode: (network: Network) => string;
    /** Difficulty level of the example */
    level: 'beginner' | 'intermediate' | 'advanced';
    /** Categories this example belongs to */
    categories: string[];
    /** Dependencies required for this example */
    dependencies?: string[];
}

/**
 * Represents the console output type 
 */
export interface ConsoleOutput {
    /** Type of output: log, error, or warning */
    type: 'log' | 'error' | 'warning';
    /** The output content */
    content: string;
    /** Timestamp when the output was generated */
    timestamp: number;
}