import type { Example } from "../types/example";
import type { Network } from "../types/network";
import { TEST_ACCOUNTS } from "../constants/accounts";

/**
 * Base class for example factories
 * This makes it easier to create new examples with consistent structure
 */
export abstract class ExampleFactory {
	protected id: string;
	protected name: string;
	protected description: string;
	protected level: "beginner" | "intermediate" | "advanced";
	protected categories: string[];

	constructor(config: {
		id: string;
		name: string;
		description: string;
		level: "beginner" | "intermediate" | "advanced";
		categories: string[];
	}) {
		this.id = config.id;
		this.name = config.name;
		this.description = config.description;
		this.level = config.level;
		this.categories = config.categories;
	}

	abstract generateCode(network: Network): string;

	createExample(): Example {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			level: this.level,
			categories: this.categories,
			getCode: this.generateCode.bind(this),
		};
	}

	protected getClientSetup(network: Network): string {
		return `
// Connect to ${network.name} using WebSocket
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("${network.endpoint}")
  )
);

// Get the typed API using the descriptors
const typedApi = client.getTypedApi(${network.descriptorKey});`;
	}

	protected getImports(network: Network, includeMultiAddress = false): string {
		return `import { createClient } from "polkadot-api";
import { ${includeMultiAddress ? "MultiAddress, " : ""}${network.descriptorKey} } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";`;
	}

	protected getTestAccount(name: "alice" | "bob" | "charlie"): string {
		return TEST_ACCOUNTS[name];
	}
}

/**
 * Registry for all examples
 * Makes it easy to register and discover examples
 */
export class ExampleRegistry {
	private examples: Example[] = [];
	private defaultExampleId: string | null = null;

	register(factory: ExampleFactory): void {
		const example = factory.createExample();
		this.examples.push(example);
	}

	registerMany(factories: ExampleFactory[]): void {
		// biome-ignore lint/complexity/noForEach: <explanation>
		factories.forEach((factory) => this.register(factory));
	}

	setDefaultExample(id: string): void {
		this.defaultExampleId = id;
	}

	getAll(): Example[] {
		return [...this.examples];
	}

	findById(id: string): Example | undefined {
		return this.examples.find((example) => example.id === id);
	}

	getByCategory(category: string): Example[] {
		return this.examples.filter((example) =>
			example.categories.includes(category),
		);
	}

	getByLevel(level: "beginner" | "intermediate" | "advanced"): Example[] {
		return this.examples.filter((example) => example.level === level);
	}

	getDefaultExample(): Example | undefined {
		if (this.defaultExampleId) {
			return this.findById(this.defaultExampleId);
		}

		return this.examples[0];
	}
}

export const exampleRegistry = new ExampleRegistry();
