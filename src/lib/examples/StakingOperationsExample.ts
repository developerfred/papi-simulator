import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class StakingOperationsExample extends ExampleFactory {
	constructor() {
		super({
			id: "staking-operations",
			name: "Staking Operations",
			description: "Demonstrate staking operations: bonding, nominating, and managing stake",
			level: "intermediate",
			categories: ["staking", "transactions", "validators"],
		});
	}

	generateCode(network: Network): string {
		return `// Staking Operations Example on ${network.name}
${this.getImports(network, true)}

// Connect to ${network.name} using WebSocket
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("${network.endpoint}")
  )
);

// Get the typed API using the descriptors
const typedApi = client.getTypedApi(${network.descriptorKey});

// Example staking operations
const demonstrateStakingOperations = async () => {
  try {
    console.log("🚀 Starting staking operations demonstration...");
    
    // 1. Query current staking information for Alice
    const aliceAddress = "${this.getTestAccount("alice")}";
    console.log("\\n📊 Querying staking info for Alice:", aliceAddress);
    
    // Get staking ledger
    const ledger = await typedApi.query.Staking.Ledger.getValue(aliceAddress);
    console.log("Staking Ledger:", {
      stash: ledger?.stash,
      total: ledger?.total?.toString(),
      active: ledger?.active?.toString(),
      unlocking: ledger?.unlocking?.length || 0
    });
    
    // Get bonded amount
    const bonded = await typedApi.query.Staking.Bonded.getValue(aliceAddress);
    console.log("Bonded to:", bonded);
    
    // Get nominators
    const nominators = await typedApi.query.Staking.Nominators.getValue(aliceAddress);
    console.log("Current nominators:", nominators?.targets || []);
    
    // 2. Demonstrate bonding transaction (would normally require signer)
    console.log("\\n🔗 Bonding Transaction Example:");
    console.log("This would bond tokens to a stash account:");
    const bondAmount = 1000000000000n; // 1000 tokens (adjust for decimals)
    const bondTx = typedApi.tx.Staking.bond({
      value: bondAmount,
      payee: { Staked: null }
    });
    console.log("Bond transaction created (not submitted in simulator)");
    
    // 3. Demonstrate nomination transaction
    console.log("\\n🎯 Nomination Transaction Example:");
    console.log("This would nominate validators:");
    const validator1 = "${this.getTestAccount("bob")}"; // Example validator
    const validator2 = "${this.getTestAccount("charlie")}"; // Example validator
    const nominateTx = typedApi.tx.Staking.nominate({
      targets: [
        MultiAddress.Id(validator1),
        MultiAddress.Id(validator2)
      ]
    });
    console.log("Nominate transaction created for validators:", [validator1, validator2]);
    
    // 4. Query validator information
    console.log("\\n🏆 Querying Validator Information:");
    const validatorInfo = await typedApi.query.Staking.Validators.getValue(validator1);
    console.log("Validator", validator1, "info:", {
      commission: validatorInfo?.commission?.toString(),
      blocked: validatorInfo?.blocked
    });
    
    // 5. Demonstrate unbonding
    console.log("\\n🔓 Unbonding Transaction Example:");
    const unbondAmount = 500000000000n; // 500 tokens
    const unbondTx = typedApi.tx.Staking.unbond({
      value: unbondAmount
    });
    console.log("Unbond transaction created for", unbondAmount.toString(), "tokens");
    
    // 6. Query era information
    console.log("\\n📅 Current Era Information:");
    const currentEra = await typedApi.query.Staking.CurrentEra.getValue();
    const activeEra = await typedApi.query.Staking.ActiveEra.getValue();
    console.log("Current era:", currentEra?.toString());
    console.log("Active era:", activeEra?.index?.toString());
    
    // 7. Query reward points for current era
    console.log("\\n💰 Reward Information:");
    if (activeEra?.index) {
      const eraRewardPoints = await typedApi.query.Staking.ErasRewardPoints.getValue(activeEra.index);
      console.log("Era", activeEra.index.toString(), "total reward points:", eraRewardPoints?.total?.toString());
    }
    
    console.log("\\n✅ Staking operations demonstration completed!");
    console.log("Note: In a real application, you would sign and submit these transactions using a wallet.");
    
  } catch (error) {
    console.error("❌ Error in staking operations:", error);
  }
};

demonstrateStakingOperations().catch(console.error);
`;
	}
}
