import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Example } from '../types/example';
import { DEFAULT_EXAMPLE, EXAMPLES, findExampleById } from '../examples';

export function useExample() {
    const [selectedExampleId, setSelectedExampleId] = useLocalStorage<string>('selectedExample', DEFAULT_EXAMPLE.id);
    const [selectedExample, setSelectedExample] = useState<Example>(DEFAULT_EXAMPLE);

    useEffect(() => {
        const example = findExampleById(selectedExampleId) || DEFAULT_EXAMPLE;
        setSelectedExample(example);
    }, [selectedExampleId]);

    const handleExampleChange = (exampleId: string) => {
        setSelectedExampleId(exampleId);
    };

    return {
        examples: EXAMPLES,
        selectedExample,
        selectedExampleId,
        setExample: handleExampleChange
    };
}