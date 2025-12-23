import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class XcmV4Example extends ExampleFactory {
	constructor() {
		super({
			id: "xcm-v4-operations",
			name: "XCM V4 Operations",
			description: "Demonstrate latest XCM V4 features: teleport assets, reserve transfers, and cross-chain messaging",
			level: "advanced",
			categories: ["xcm", "cross-chain", "assets", "teleport"],
		});
	}

	generateCode(network: Network): string {
		return `// XCM V4 Operations Example on ${network.name}
${this.getImports(network, true)}

// Connect to ${network.name}
const client = createClient(
  withPoladotSdkCompat(
    getWsProvider("${network.endpoint}")
  )
);

// Get the typed API using the descriptors
const typedApi = client.getTypedApi(${network.descriptorKey});

// XCM V4 operations demonstration
const demonstrateXcmV4Operations = async () => {
  try {
    console.log("🌐 Starting XCM V4 operations demonstration...");

    // 1. Query XCM version
    console.log("\\n🔍 Querying XCM version and capabilities:");
    try {
      const version = await typedApi.query.PolkadotXcm.VersionNotifiers.getValue();
      console.log("XCM version notifiers:", version);
    } catch (error) {
      console.log("Version notifiers not available");
    }

    // 2. Query supported locations
    console.log("\\n📍 Querying supported XCM locations:");
    try {
      const locations = await typedApi.query.PolkadotXcm.SupportedVersion.getEntries();
      console.log("Supported XCM locations:", locations.length);
    } catch (error) {
      console.log("Supported locations not available");
    }

    // 3. Demonstrate teleport assets (XCM V4)
    console.log("\\n✈️ Teleport Assets Example (XCM V4):");
    console.log("This would teleport assets to another chain:");
    const teleportTx = typedApi.tx.PolkadotXcm.teleport_assets({
      dest: {
        V4: {
          parents: 1,
          interior: {
            X1: { Parachain: 2000 } // Target parachain
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
          fun: { Fungible: 1000000000000n } // 1000 DOT/KSM
        }]
      },
      fee_asset_item: 0
    });
    console.log("Teleport assets transaction created (not submitted in simulator)");

    // 4. Demonstrate reserve transfer assets
    console.log("\\n🔄 Reserve Transfer Assets Example (XCM V4):");
    console.log("This would perform a reserve transfer:");
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
          fun: { Fungible: 500000000000n } // 500 DOT/KSM
        }]
      },
      fee_asset_item: 0
    });
    console.log("Reserve transfer transaction created (not submitted in simulator)");

    // 5. Demonstrate limited teleport assets
    console.log("\\n🎯 Limited Teleport Assets Example:");
    console.log("This would perform a limited teleport:");
    const limitedTeleportTx = typedApi.tx.PolkadotXcm.limited_teleport_assets({
      dest: {
        V4: {
          parents: 1,
          interior: {
            X1: { Parachain: 1000 } // Asset Hub
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
          fun: { Fungible: 100000000000n }
        }]
      },
      fee_asset_item: 0,
      weight_limit: { Limited: { ref_time: 2000000000n, proof_size: 50000n } }
    });
    console.log("Limited teleport transaction created (not submitted in simulator)");

    // 6. Demonstrate transfer reserve asset
    console.log("\\n🏦 Transfer Reserve Asset Example:");
    console.log("This would transfer reserve-backed assets:");
    const transferReserveTx = typedApi.tx.PolkadotXcm.transfer_reserve_asset({
      assets: {
        V4: [{
          id: { Concrete: { parents: 1, interior: "Here" } },
          fun: { Fungible: 200000000000n }
        }]
      },
      dest: {
        V4: {
          parents: 1,
          interior: {
            X1: { Parachain: 2000 }
          }
        }
      },
      xcm: {
        V4: [
          {
            ReserveAssetDeposited: {
              assets: { Wild: { AllCounted: 1 } }
            }
          },
          {
            ClearOrigin: null
          },
          {
            DepositAsset: {
              assets: { Wild: { AllCounted: 1 } },
              beneficiary: {
                AccountId32: { id: "${this.getTestAccount("bob")}" }
              }
            }
          }
        ]
      }
    });
    console.log("Transfer reserve asset transaction created (not submitted in simulator)");

    // 7. Query XCM queues
    console.log("\\n📋 Querying XCM queues:");
    try {
      const outboundQueue = await typedApi.query.PolkadotXcm.Queries.getValue();
      console.log("Outbound XCM queries:", outboundQueue);
    } catch (error) {
      console.log("XCM queue queries not available");
    }

    // 8. Demonstrate execute XCM message
    console.log("\\n⚡ Execute XCM Message Example:");
    console.log("This would execute a custom XCM message:");
    const executeTx = typedApi.tx.PolkadotXcm.execute({
      message: {
        V4: [
          {
            WithdrawAsset: {
              assets: {
                Concrete: {
                  parents: 0,
                  interior: {
                    X1: { PalletInstance: 10 }
                  }
                }
              }
            }
          },
          {
            DepositAsset: {
              assets: { Wild: { AllCounted: 1 } },
              beneficiary: {
                AccountId32: { id: "${this.getTestAccount("alice")}" }
              }
            }
          }
        ]
      },
      max_weight: { ref_time: 1000000000n, proof_size: 10000n }
    });
    console.log("Execute XCM message transaction created (not submitted in simulator)");

    // 9. Query XCM version negotiation
    console.log("\\n🤝 Querying XCM version negotiation:");
    try {
      const versionNotify = await typedApi.query.PolkadotXcm.VersionNotifyTargets.getValue();
      console.log("Version notify targets:", versionNotify);
    } catch (error) {
      console.log("Version negotiation queries not available");
    }

    // 10. Demonstrate force XCM version
    console.log("\\n🔧 Force XCM Version Example:");
    console.log("This would force a specific XCM version (admin only):");
    const forceVersionTx = typedApi.tx.PolkadotXcm.force_xcm_version({
      location: {
        V4: {
          parents: 1,
          interior: {
            X1: { Parachain: 2000 }
          }
        }
      },
      version: 4
    });
    console.log("Force XCM version transaction created (not submitted in simulator)");

    console.log("\\n✅ XCM V4 operations demonstration completed!");
    console.log("Note: XCM operations require:");
    console.log("- Understanding of XCM multilocation format");
    console.log("- Knowledge of destination chain requirements");
    console.log("- Proper weight limits and fee calculations");
    console.log("- In a real application, you would sign and submit these transactions");
    console.log("- XCM V4 introduces enhanced asset handling and better error reporting");

  } catch (error) {
    console.error("❌ Error in XCM V4 operations:", error);
  }
};

demonstrateXcmV4Operations().catch(console.error);
`;
	}
}
