import { Example } from '../types/example';
import { Network } from '../types/network';
import { TEST_ACCOUNTS } from '../constants/accounts';
import { DifficultyLevel } from './difficulty';
import { ExampleCategory } from './categories';

export type ExampleParams = {
    id: string;
    name: string;
    description: string;
    level: DifficultyLevel;
    categories: ExampleCategory[];
};

export abstract class BaseExampleFactory {
    protected params: ExampleParams;

    constructor(params: ExampleParams) {
        this.params = params;
    }

    abstract generateCode(network: Network): string;

    createExample(): Example {
        return {
            id: this.params.id,
            name: this.params.name,
            description: this.params.description,
            level: this.params.level,
            categories: this.params.categories,
            getCode: this.generateCode.bind(this)
        };
    }

    // Utility methods for common code snippets used across examples
    protected generateImports(network: Network): string {
        return `import { createClient } from "polkadot-api";
import { ${network.descriptorKey} } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";`;
    }

    protected generateClientSetup(network: Network): string {
        return `
// Connect to ${network.name} testnet
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("${network.endpoint}")
  )
);

// Get the typed API
const typedApi = client.getTypedApi(${network.descriptorKey});`;
    }

    protected getTestAccount(name: keyof typeof TEST_ACCOUNTS = 'alice'): string {
        return TEST_ACCOUNTS[name];
    }
}