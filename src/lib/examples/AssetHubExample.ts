import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class AssetHubExample extends ExampleFactory {
	constructor() {
		super({
			id: "asset-hub-operations",
			name: "Asset Hub Operations",
			description: "Demonstrate Asset Hub operations: foreign assets, teleport assets, and reserve transfers",
			level: "advanced",
			categories: ["assets", "xcm", "transfers", "parachains"],
		});
	}

	generateCode(network: Network): string {
		return `// Asset Hub Operations Example on ${network.name}
${this.getImports(network, true)}

// Connect to ${network.name} Asset Hub
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("${network.endpoint}")
  )
);

// Get the typed API using the descriptors
const typedApi = client.getTypedApi(${network.descriptorKey});

// Asset Hub operations demonstration
const demonstrateAssetHubOperations = async () => {
  try {
    console.log("🚀 Starting Asset Hub operations demonstration...");

    // 1. Query foreign assets
    console.log("\\n🔍 Querying foreign assets:");
    const foreignAssets = await typedApi.query.ForeignAssets.Asset.getEntries();
    console.log("Found", foreignAssets.length, "foreign assets");
    
    if (foreignAssets.length > 0) {
      const firstAsset = foreignAssets[0];
      console.log("First asset details:", {
        assetId: firstAsset.key?.args?.[0],
        details: firstAsset.value
      });
    }

    // 2. Query asset balances
    console.log("\\n💰 Querying asset balances:");
    const aliceAddress = "${this.getTestAccount("alice")}";
    
    // Native token balance (DOT/KSM)
    const nativeBalance = await typedApi.query.System.Account.getValue(aliceAddress);
    console.log("Native balance:", nativeBalance.data.free.toString(), "${network.tokenSymbol}");

    // 3. Demonstrate asset transfer (would require foreign asset)
    console.log("\\n📤 Asset Transfer Example:");
    console.log("This would transfer foreign assets between accounts:");
    const transferTx = typedApi.tx.ForeignAssets.transfer({
      id: { parents: 0, interior: { X1: { PalletInstance: 50 } } }, // Example asset ID
      target: MultiAddress.Id("${this.getTestAccount("bob")}"),
      amount: 1000000000000n // 1000 tokens (adjust for decimals)
    });
    console.log("Asset transfer transaction created (not submitted in simulator)");

    // 4. Demonstrate teleport assets (XCM)
    console.log("\\n✈️ Teleport Assets Example:");
    console.log("This would teleport assets to another parachain:");
    const teleportTx = typedApi.tx.PolkadotXcm.teleport_assets({
      dest: {
        V4: {
          parents: 1,
          interior: {
            X1: { Parachain: 2000 } // Example parachain ID
          }
        }
      },
      beneficiary: {
        V4: {
          parents: 0,
          interior: {
            X1: { AccountId32: { id: "${this.getTestAccount("alice")}" } }
          }
        }
      },
      assets: {
        V4: [{
          id: { Concrete: { parents: 1, interior: "Here" } },
          fun: { Fungible: 1000000000000n }
        }]
      },
      fee_asset_item: 0
    });
    console.log("Teleport transaction created (not submitted in simulator)");

    // 5. Query reserve transfers
    console.log("\\n🔄 Reserve Transfer Example:");
    console.log("This would perform a reserve transfer to another parachain:");
    const reserveTransferTx = typedApi.tx.PolkadotXcm.reserve_transfer_assets({
      dest: {
        V4: {
          parents: 1,
          interior: {
            X1: { Parachain: 2000 }
          }
        }
      },
      beneficiary: {
        V4: {
          parents: 0,
          interior: {
            X1: { AccountId32: { id: "${this.getTestAccount("bob")}" } }
          }
        }
      },
      assets: {
        V4: [{
          id: { Concrete: { parents: 1, interior: "Here" } },
          fun: { Fungible: 500000000000n }
        }]
      },
      fee_asset_item: 0
    });
    console.log("Reserve transfer transaction created (not submitted in simulator)");

    // 6. Query asset metadata
    console.log("\\n📋 Asset Metadata:");
    try {
      const assetMetadata = await typedApi.query.ForeignAssets.Metadata.getEntries();
      console.log("Found metadata for", assetMetadata.length, "assets");
      
      if (assetMetadata.length > 0) {
        const firstMetadata = assetMetadata[0];
        console.log("Asset metadata:", {
          assetId: firstMetadata.key?.args?.[0],
          name: firstMetadata.value?.name?.toString(),
          symbol: firstMetadata.value?.symbol?.toString(),
          decimals: firstMetadata.value?.decimals?.toString()
        });
      }
    } catch (error) {
      console.log("Asset metadata not available or different structure");
    }

    // 7. Query asset approvals
    console.log("\\n✅ Asset Approvals:");
    try {
      const approvals = await typedApi.query.ForeignAssets.Approvals.getEntries();
      console.log("Found", approvals.length, "asset approvals");
    } catch (error) {
      console.log("Asset approvals query not available");
    }

    console.log("\\n✅ Asset Hub operations demonstration completed!");
    console.log("Note: Asset Hub operations typically require:");
    console.log("- Foreign asset registration on the hub");
    console.log("- Sufficient balance of the asset");
    console.log("- Proper XCM configuration between chains");
    console.log("- In a real application, you would sign and submit these transactions");

  } catch (error) {
    console.error("❌ Error in Asset Hub operations:", error);
  }
};

demonstrateAssetHubOperations().catch(console.error);
`;
	}
}
