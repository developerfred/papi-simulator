import type { Example } from "../types/example";
import { QueryBalanceExample } from "./QueryBalanceExample";
import { SimpleTransferExample } from "./SimpleTransferExample";
import { WatchBlocksExample } from "./WatchBlocksExample";

const exampleFactories = [
	new SimpleTransferExample(),
	new QueryBalanceExample(),
	new WatchBlocksExample(),
];

export const EXAMPLES: Example[] = exampleFactories.map((factory) =>
	factory.createExample(),
);

export function findExampleById(id: string): Example | undefined {
	return EXAMPLES.find((example) => example.id === id);
}

export function getExamplesByCategory(category: string): Example[] {
	return EXAMPLES.filter((example) => example.categories.includes(category));
}

export function getExamplesByLevel(level: Example["level"]): Example[] {
	return EXAMPLES.filter((example) => example.level === level);
}

export const DEFAULT_EXAMPLE = EXAMPLES[0];
