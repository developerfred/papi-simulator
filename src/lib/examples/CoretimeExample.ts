import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class CoretimeExample extends ExampleFactory {
	constructor() {
		super({
			id: "coretime-operations",
			name: "Coretime Chain Operations",
			description: "Demonstrate Coretime operations: core buying, renewal, and asset management",
			level: "advanced",
			categories: ["coretime", "parachains", "assets", "agile-coretime"],
		});
	}

	generateCode(network: Network): string {
		return `// Coretime Chain Operations Example on ${network.name}
${this.getImports(network, true)}

// Connect to ${network.name} Coretime Chain
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("${network.endpoint}")
  )
);

// Get the typed API using the descriptors
const typedApi = client.getTypedApi(${network.descriptorKey});

// Coretime operations demonstration
const demonstrateCoretimeOperations = async () => {
  try {
    console.log("⏰ Starting Coretime operations demonstration...");

    // 1. Query current price and configuration
    console.log("\\n💰 Querying Coretime pricing:");
    try {
      const coretimeConfig = await typedApi.query.Broker.Configuration.getValue();
      console.log("Coretime configuration:", coretimeConfig);
    } catch (error) {
      console.log("Coretime configuration not available");
    }

    // 2. Query core sales status
    console.log("\\n🏷️ Querying core sales status:");
    try {
      const saleInfo = await typedApi.query.Broker.SaleInfo.getValue();
      console.log("Current sale information:", saleInfo);
    } catch (error) {
      console.log("Sale info not available");
    }

    // 3. Query available cores
    console.log("\\n🔍 Querying available cores:");
    try {
      const cores = await typedApi.query.Broker.CoreSchedules.getEntries();
      console.log("Found", cores.length, "cores with schedules");
      
      if (cores.length > 0) {
        const firstCore = cores[0];
        console.log("First core schedule:", {
          coreId: firstCore.key?.args?.[0]?.toString(),
          schedule: firstCore.value
        });
      }
    } catch (error) {
      console.log("Core schedules not available");
    }

    // 4. Demonstrate core purchase
    console.log("\\n🛒 Core Purchase Example:");
    console.log("This would purchase coretime for a specific period:");
    const purchaseTx = typedApi.tx.Broker.purchase({
      price_limit: 1000000000000n, // Maximum price willing to pay
    });
    console.log("Coretime purchase transaction created (not submitted in simulator)");

    // 5. Demonstrate core renewal
    console.log("\\n🔄 Core Renewal Example:");
    console.log("This would renew an existing core:");
    const renewTx = typedApi.tx.Broker.renew({
      core: 0, // Core ID to renew
      price_limit: 500000000000n, // Maximum price for renewal
    });
    console.log("Core renewal transaction created for core 0 (not submitted in simulator)");

    // 6. Query workload information
    console.log("\\n📊 Querying workload information:");
    try {
      const workload = await typedApi.query.Broker.Workload.getEntries();
      console.log("Found workload data for", workload.length, "cores");
    } catch (error) {
      console.log("Workload data not available");
    }

    // 7. Query reservations
    console.log("\\n📅 Querying reservations:");
    try {
      const reservations = await typedApi.query.Broker.Reservations.getValue();
      console.log("Current reservations:", reservations);
    } catch (error) {
      console.log("Reservations not available");
    }

    // 8. Demonstrate partition core operation
    console.log("\\n✂️ Core Partition Example:");
    console.log("This would partition a core into smaller time slices:");
    const partitionTx = typedApi.tx.Broker.partition({
      core: 0, // Core to partition
      price_limit: 200000000000n, // Price limit for partition
    });
    console.log("Core partition transaction created (not submitted in simulator)");

    // 9. Demonstrate core assignment
    console.log("\\n🎯 Core Assignment Example:");
    console.log("This would assign a core to a parachain:");
    const assignTx = typedApi.tx.Broker.assign({
      core: 0, // Core to assign
      begin: 1000, // Starting block
      assignment: [{
        task: 2000, // Parachain ID
        ratio: [80, 20] // 80% to parachain, 20% to pool
      }],
      end_hint: null
    });
    console.log("Core assignment transaction created (not submitted in simulator)");

    // 10. Query core status
    console.log("\\n📋 Querying core status:");
    try {
      const status = await typedApi.query.Broker.StatusOf.getValue(0);
      console.log("Status of core 0:", status);
    } catch (error) {
      console.log("Core status not available");
    }

    // 11. Query allowed renewal records
    console.log("\\n🔑 Querying allowed renewal records:");
    try {
      const aliceAddress = "${this.getTestAccount("alice")}";
      const allowedRenewal = await typedApi.query.Broker.AllowedRenewalRecords.getValue(aliceAddress);
      console.log("Alice's allowed renewal records:", allowedRenewal);
    } catch (error) {
      console.log("Allowed renewal records not available");
    }

    // 12. Demonstrate pool operations
    console.log("\\n🏊 Pool Operations Example:");
    console.log("This would add coretime to the instant pool:");
    const poolTx = typedApi.tx.Broker.pool({
      core: 0, // Core to add to pool
      price_limit: 100000000000n, // Price limit
    });
    console.log("Pool transaction created (not submitted in simulator)");

    // 13. Query instant pool configuration
    console.log("\\n⚡ Querying instant pool:");
    try {
      const poolInfo = await typedApi.query.Broker.InstantaneousPoolInfo.getValue();
      console.log("Instant pool information:", poolInfo);
    } catch (error) {
      console.log("Instant pool info not available");
    }

    console.log("\\n✅ Coretime operations demonstration completed!");
    console.log("Note: Coretime operations require:");
    console.log("- Understanding of core scheduling and availability");
    console.log("- Proper price limits for purchases and renewals");
    console.log("- Knowledge of parachain assignments and workload distribution");
    console.log("- In a real application, you would sign and submit these transactions");
    console.log("- Coretime is a complex system - study the documentation thoroughly");

  } catch (error) {
    console.error("❌ Error in Coretime operations:", error);
  }
};

demonstrateCoretimeOperations().catch(console.error);
`;
	}
}
