import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class QueryBalanceExample extends ExampleFactory {
	constructor() {
		super({
			id: "query-balance",
			name: "Query Account Balance",
			description: "Check an account's balance on testnet",
			level: "beginner",
			categories: ["queries", "balances"],
		});
	}

	generateCode(network: Network): string {
		return `// Query account balance example on ${network.name}
${this.getImports(network)}

${this.getClientSetup(network)}

// Query an account's balance
const checkBalance = async () => {
  // Alice's address (for demonstration)
  const ALICE = "${this.getTestAccount("alice")}";
  
  // Get account information
  const accountInfo = await typedApi.query.System.Account.getValue(ALICE);
  
  console.log("Account Info:", accountInfo);
  console.log("Free Balance:", accountInfo.data.free.toString());
  console.log("Reserved Balance:", accountInfo.data.reserved.toString());
  console.log("Total Balance:", 
    (accountInfo.data.free + accountInfo.data.reserved).toString()
  );
  
  // Format the balance in a human-readable way
  const divisor = 10n ** ${BigInt(network.tokenDecimals)}n;
  const formattedBalance = Number(accountInfo.data.free) / Number(divisor);
  console.log("Human readable balance:", formattedBalance.toFixed(4), "${network.tokenSymbol}");
};

checkBalance().catch(console.error);`;
	}
}
