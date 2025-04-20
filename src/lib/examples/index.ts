import { exampleRegistry } from "./factory";
import { SimpleTransferExample } from "./SimpleTransferExample";
import { QueryBalanceExample } from "./QueryBalanceExample";
import { WatchBlocksExample } from "./WatchBlocksExample";
import { TestComponentExample } from "./TestComponentExample";
import { NetworkDashboardExample } from "./NetworkDashboardExample";
import type { Example, ExampleLevel } from "../types/example";

exampleRegistry.registerMany([
	new SimpleTransferExample(),
	new QueryBalanceExample(),
	new WatchBlocksExample(),
	new TestComponentExample(),
	new NetworkDashboardExample(),
]);

exampleRegistry.setDefaultExample("network-dashboard");

export const EXAMPLES: Example[] = exampleRegistry.getAll();
export const findExampleById = (id: string): Example | undefined =>
	exampleRegistry.findById(id);
export const getExamplesByCategory = (category: string): Example[] =>
	exampleRegistry.getByCategory(category);
export const getExamplesByLevel = (level: ExampleLevel): Example[] =>
	exampleRegistry.getByLevel(level);
// biome-ignore lint/style/noNonNullAssertion: <explanation>
export const DEFAULT_EXAMPLE: Example = exampleRegistry.getDefaultExample()!;


export type { Example, ExampleLevel } from "../types/example";