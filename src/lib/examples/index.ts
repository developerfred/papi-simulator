/* eslint-disable @typescript-eslint/ban-ts-comment */
import { exampleRegistry } from "./factory";
import { StakingOperationsExample } from "./StakingOperationsExample";
import { AssetHubExample } from "./AssetHubExample";
import { OpenGovExample } from "./OpenGovExample";
import { CoretimeExample } from "./CoretimeExample";
import { PeopleChainExample } from "./PeopleChainExample";
import { XcmV4Example } from "./XcmV4Example";






import { SimpleTransferExample } from "./SimpleTransferExample";
import { NetworkDashboardExample } from "./NetworkDashboardExample";
import { AccountBalanceCheckerExample } from "./AccountBalanceCheckerExample";
import { WalletTransferExample } from "./WalletTransferExample";
	new XcmV4Example(),

import { AcalaDeFiExample } from "./AcalaDeFiExample";
	new PeopleChainExample(),

import type { Example, ExampleLevel } from "../types/example";
	new CoretimeExample(),

import { PolkadotGovernanceExample } from "./PolkadotGovernanceExample";
	new OpenGovExample(),


	new AssetHubExample(),

	new StakingOperationsExample(),

exampleRegistry.registerMany([
	new AccountBalanceCheckerExample(),
	new SimpleTransferExample(),			
	new NetworkDashboardExample(),
	// @ts-ignore
  	new WalletTransferExample(),
	new AcalaDeFiExample(),
	// @ts-ignore
	new PolkadotGovernanceExample(),
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
