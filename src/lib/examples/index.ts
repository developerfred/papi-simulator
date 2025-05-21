import { exampleRegistry } from "./factory";
import { SimpleTransferExample } from "./SimpleTransferExample";
import { NetworkDashboardExample } from "./NetworkDashboardExample";
import { AccountBalanceCheckerExample } from "./AccountBalanceCheckerExample";
import type { Example, ExampleLevel } from "../types/example";
import { TransactionBuilderExample } from "./TransactionBuilderExample";

exampleRegistry.registerMany([
	new AccountBalanceCheckerExample(),
	new SimpleTransferExample(),			
	new NetworkDashboardExample(),
	new TransactionBuilderExample(),
]);

exampleRegistry.setDefaultExample("account-balance");

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
