import { useEffect, useState } from "react";
import { DEFAULT_EXAMPLE, EXAMPLES } from "../examples";
import type { Example } from "../types/example";
import { useLocalStorageState } from "./useLocalStorageState";

export function useExample() {
	const [selectedExampleId, setSelectedExampleId] = useLocalStorageState<string>(
		"selectedExample",
		DEFAULT_EXAMPLE.id
	);

	const [selectedExample, setSelectedExample] = useState<Example>(() =>
		EXAMPLES.find(example => example.id === selectedExampleId) || DEFAULT_EXAMPLE
	);

	useEffect(() => {
		const example = EXAMPLES.find(example => example.id === selectedExampleId) || DEFAULT_EXAMPLE;
		setSelectedExample(example);
	}, [selectedExampleId]);

	const handleExampleChange = (exampleId: string) => {
		setSelectedExampleId(exampleId);
	};

	return {
		examples: EXAMPLES,
		selectedExample,
		selectedExampleId,
		setExample: handleExampleChange,
	};
}