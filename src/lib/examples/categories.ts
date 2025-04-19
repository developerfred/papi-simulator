export const EXAMPLE_CATEGORIES = [
	"transactions",
	"balances",
	"storage",
	"queries",
	"blocks",
	"events",
	"subscriptions",
	"compatibility",
] as const;

export type ExampleCategory = (typeof EXAMPLE_CATEGORIES)[number];
