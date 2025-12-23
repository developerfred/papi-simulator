import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class PeopleChainExample extends ExampleFactory {
	constructor() {
		super({
			id: "people-chain-identity",
			name: "People Chain Identity",
			description: "Demonstrate People Chain identity operations: DID creation, verification, and management",
			level: "advanced",
			categories: ["identity", "people-chain", "did", "verification"],
		});
	}

	generateCode(network: Network): string {
		return `// People Chain Identity Operations Example on ${network.name}
${this.getImports(network, true)}

// Connect to ${network.name} People Chain
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("${network.endpoint}")
  )
);

// Get the typed API using the descriptors
const typedApi = client.getTypedApi(${network.descriptorKey});

// People Chain identity operations demonstration
const demonstratePeopleChainIdentity = async () => {
  try {
    console.log("🆔 Starting People Chain identity operations demonstration...");

    // 1. Query identity information
    console.log("\\n🔍 Querying identity information:");
    const aliceAddress = "${this.getTestAccount("alice")}";
    const bobAddress = "${this.getTestAccount("bob")}";

    try {
      const aliceIdentity = await typedApi.query.Identity.IdentityOf.getValue(aliceAddress);
      console.log("Alice's identity:", aliceIdentity);

      const bobIdentity = await typedApi.query.Identity.IdentityOf.getValue(bobAddress);
      console.log("Bob's identity:", bobIdentity);
    } catch (error) {
      console.log("Identity queries not available or different structure");
    }

    // 2. Query super identities
    console.log("\\n👑 Querying super identities:");
    try {
      const superOf = await typedApi.query.Identity.SuperOf.getValue(aliceAddress);
      console.log("Alice's super identity:", superOf);
    } catch (error) {
      console.log("Super identity queries not available");
    }

    // 3. Query subs (sub-accounts)
    console.log("\\n👥 Querying sub-accounts:");
    try {
      const subsOf = await typedApi.query.Identity.SubsOf.getValue(aliceAddress);
      console.log("Alice's sub-accounts:", subsOf);
    } catch (error) {
      console.log("Sub-account queries not available");
    }

    // 4. Demonstrate identity registration
    console.log("\\n📝 Identity Registration Example:");
    console.log("This would register a new identity:");
    const registerTx = typedApi.tx.Identity.setIdentity({
      display: {
        Raw: "Alice Developer"
      },
      legal: {
        Raw: "Alice Developer Ltd"
      },
      web: {
        Raw: "https://alice.dev"
      },
      email: {
        Raw: "alice@example.com"
      },
      twitter: {
        Raw: "@alice_dev"
      },
      matrix: {
        Raw: "@alice:matrix.org"
      }
    });
    console.log("Identity registration transaction created (not submitted in simulator)");

    // 5. Demonstrate identity verification request
    console.log("\\n✅ Identity Verification Request Example:");
    console.log("This would request verification for identity fields:");
    const requestVerifyTx = typedApi.tx.Identity.requestJudgement({
      reg_index: 0, // Registration index
      max_fee: 1000000000000n // Maximum fee for verification
    });
    console.log("Judgement request transaction created (not submitted in simulator)");

    // 6. Query registrars
    console.log("\\n🏛️ Querying registrars:");
    try {
      const registrars = await typedApi.query.Identity.Registrars.getValue();
      console.log("Available registrars:", registrars?.map((reg, index) => ({
        index,
        account: reg?.account,
        fee: reg?.fee?.toString(),
        fields: reg?.fields?.toString()
      })));
    } catch (error) {
      console.log("Registrar queries not available");
    }

    // 7. Demonstrate sub-account addition
    console.log("\\n👶 Sub-Account Addition Example:");
    console.log("This would add a sub-account to an identity:");
    const addSubTx = typedApi.tx.Identity.addSub({
      sub: MultiAddress.Id(bobAddress),
      data: {
        Raw: "Bob Assistant"
      }
    });
    console.log("Add sub-account transaction created (not submitted in simulator)");

    // 8. Demonstrate sub-account removal
    console.log("\\n👋 Sub-Account Removal Example:");
    console.log("This would remove a sub-account from an identity:");
    const removeSubTx = typedApi.tx.Identity.removeSub({
      sub: MultiAddress.Id(bobAddress)
    });
    console.log("Remove sub-account transaction created (not submitted in simulator)");

    // 9. Demonstrate identity clearing
    console.log("\\n🗑️ Identity Clearing Example:");
    console.log("This would clear the entire identity:");
    const clearTx = typedApi.tx.Identity.clearIdentity();
    console.log("Clear identity transaction created (not submitted in simulator)");

    // 10. Query identity judgments
    console.log("\\n⚖️ Querying identity judgments:");
    try {
      const judgements = await typedApi.query.Identity.Judgements.getValue(aliceAddress);
      console.log("Alice's judgements:", judgements);
    } catch (error) {
      console.log("Judgement queries not available");
    }

    // 11. Demonstrate username registration (if available)
    console.log("\\n📛 Username Registration Example:");
    console.log("This would register a username:");
    try {
      const usernameTx = typedApi.tx.Identity.setUsername({
        username: "alice_dev"
      });
      console.log("Username registration transaction created (not submitted in simulator)");
    } catch (error) {
      console.log("Username registration not available on this network");
    }

    // 12. Query username authorities
    console.log("\\n🔐 Querying username authorities:");
    try {
      const authorities = await typedApi.query.Identity.UsernameAuthorities.getValue();
      console.log("Username authorities:", authorities);
    } catch (error) {
      console.log("Username authorities not available");
    }

    // 13. Demonstrate DID operations (if available)
    console.log("\\n🆔 DID Operations Example:");
    console.log("This would perform DID operations:");
    try {
      // Query DID document
      const didDoc = await typedApi.query.Did.DidDocuments.getValue(aliceAddress);
      console.log("DID document for Alice:", didDoc);

      // DID update example
      const didUpdateTx = typedApi.tx.Did.setAttribute({
        did: aliceAddress,
        name: {
          Raw: "email"
        },
        value: {
          Raw: "alice.updated@example.com"
        },
        valid_for: null
      });
      console.log("DID attribute update transaction created (not submitted in simulator)");
    } catch (error) {
      console.log("DID operations not available on this network");
    }

    console.log("\\n✅ People Chain identity operations demonstration completed!");
    console.log("Note: Identity operations require:");
    console.log("- Understanding of registrar fees and requirements");
    console.log("- Proper field validation and formatting");
    console.log("- Sufficient balance for registration and verification fees");
    console.log("- In a real application, you would sign and submit these transactions");
    console.log("- Identity verification may require third-party registrars");

  } catch (error) {
    console.error("❌ Error in People Chain identity operations:", error);
  }
};

demonstratePeopleChainIdentity().catch(console.error);
`;
	}
}
