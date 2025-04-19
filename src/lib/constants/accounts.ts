/**
 * Well-known test accounts with their SS58 addresses.
 * These accounts have funds on testnets and can be imported with well-known mnemonics.
 */
export const TEST_ACCOUNTS: Record<string, string> = {
	alice: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
	bob: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
	charlie: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
	dave: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
	eve: "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw",
};

export interface AccountDetails {
	address: string;
	name: string;
	description: string;
}

/**
 * Additional account details for display in the UI
 */
export const ACCOUNT_DETAILS: Record<string, AccountDetails> = {
	alice: {
		address: TEST_ACCOUNTS.alice,
		name: "Alice",
		description: "Default test account with funds on all testnets",
	},
	bob: {
		address: TEST_ACCOUNTS.bob,
		name: "Bob",
		description: "Secondary test account",
	},
	charlie: {
		address: TEST_ACCOUNTS.charlie,
		name: "Charlie",
		description: "Tertiary test account",
	},
	dave: {
		address: TEST_ACCOUNTS.dave,
		name: "Dave",
		description: "Fourth test account",
	},
	eve: {
		address: TEST_ACCOUNTS.eve,
		name: "Eve",
		description: "Fifth test account",
	},
};

/**
 * List of account details for easier display in UI
 */
export const ACCOUNT_LIST = Object.values(ACCOUNT_DETAILS);
