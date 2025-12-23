import type { Network } from "../types/network";
import { ExampleFactory } from "./factory";

export class OpenGovExample extends ExampleFactory {
	constructor() {
		super({
			id: "opengov-operations",
			name: "OpenGov Operations",
			description: "Demonstrate OpenGov operations: tracks, referenda, voting, and submission deposits",
			level: "advanced",
			categories: ["governance", "opengov", "voting", "referenda"],
		});
	}

	generateCode(network: Network): string {
		return `// OpenGov Operations Example on ${network.name}
${this.getImports(network, true)}

// Connect to ${network.name}
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("${network.endpoint}")
  )
);

// Get the typed API using the descriptors
const typedApi = client.getTypedApi(${network.descriptorKey});

// OpenGov operations demonstration
const demonstrateOpenGovOperations = async () => {
  try {
    console.log("🏛️ Starting OpenGov operations demonstration...");

    // 1. Query current referenda
    console.log("\\n📋 Querying active referenda:");
    const referenda = await typedApi.query.Referenda.ReferendumInfoFor.getEntries();
    console.log("Found", referenda.length, "active referenda");

    if (referenda.length > 0) {
      const firstReferendum = referenda[0];
      console.log("First referendum:", {
        id: firstReferendum.key?.args?.[0]?.toString(),
        info: firstReferendum.value
      });
    }

    // 2. Query referendum tracks
    console.log("\\n🎯 Querying referendum tracks:");
    try {
      const tracks = await typedApi.query.Referenda.Tracks.getValue();
      console.log("Available tracks:", tracks?.map(track => ({
        id: track?.[0]?.toString(),
        info: track?.[1]
      })));
    } catch (error) {
      console.log("Tracks query not available in current version");
    }

    // 3. Demonstrate referendum submission
    console.log("\\n📝 Referendum Submission Example:");
    console.log("This would submit a referendum to a specific track:");
    const submissionTx = typedApi.tx.Referenda.submit({
      proposalOrigin: {
        Origins: "GeneralAdmin" // Track name
      },
      proposal: {
        Lookup: {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000000", // Example hash
          len: 0
        }
      },
      enactmentMoment: {
        After: 100 // Blocks after approval
      }
    });
    console.log("Referendum submission transaction created (not submitted in simulator)");

    // 4. Demonstrate voting on referendum
    console.log("\\n🗳️ Voting on Referendum Example:");
    console.log("This would vote on an active referendum:");
    const voteTx = typedApi.tx.ConvictionVoting.vote({
      poll_index: 0, // Referendum ID
      vote: {
        Standard: {
          vote: {
            aye: true,
            conviction: "Locked4x" // 4x conviction
          },
          balance: 1000000000000n // Vote amount
        }
      }
    });
    console.log("Vote transaction created for referendum #0 (not submitted in simulator)");

    // 5. Query conviction voting state
    console.log("\\n📊 Querying conviction voting state:");
    const aliceAddress = "${this.getTestAccount("alice")}";
    try {
      const votingFor = await typedApi.query.ConvictionVoting.VotingFor.getValue(aliceAddress, 0);
      console.log("Alice's vote on referendum 0:", votingFor);
    } catch (error) {
      console.log("Conviction voting query not available");
    }

    // 6. Demonstrate proposal deposit
    console.log("\\n💰 Proposal Deposit Example:");
    console.log("This would place a decision deposit on a referendum:");
    const depositTx = typedApi.tx.Referenda.placeDecisionDeposit({
      index: 0 // Referendum ID
    });
    console.log("Decision deposit transaction created (not submitted in simulator)");

    // 7. Query decision deposits
    console.log("\\n🏦 Querying decision deposits:");
    try {
      const deposits = await typedApi.query.Referenda.DecisionDeposits.getValue(0);
      console.log("Decision deposits for referendum 0:", deposits);
    } catch (error) {
      console.log("Decision deposits query not available");
    }

    // 8. Demonstrate whitelisted caller operation
    console.log("\\n⭐ Whitelisted Caller Example:");
    console.log("This would execute a whitelisted operation:");
    const whitelistTx = typedApi.tx.WhitelistedCaller.dispatchAs({
      asOrigin: {
        Origins: "WhitelistedCaller"
      },
      call: {
        system: {
          remark: {
            remark: "0x48656c6c6f20506f6c6b61646f7421" // "Hello Polkadot!"
          }
        }
      }
    });
    console.log("Whitelisted caller transaction created (not submitted in simulator)");

    // 9. Query fellowship information (if available)
    console.log("\\n👥 Fellowship Information:");
    try {
      const fellowship = await typedApi.query.FellowshipCollective.Members.getValue(aliceAddress);
      console.log("Alice's fellowship rank:", fellowship?.toString());
    } catch (error) {
      console.log("Fellowship queries not available on this network");
    }

    // 10. Query current block for timing
    console.log("\\n⏰ Current Block Information:");
    const currentBlock = await typedApi.query.System.Number.getValue();
    console.log("Current block:", currentBlock?.toString());

    console.log("\\n✅ OpenGov operations demonstration completed!");
    console.log("Note: OpenGov operations require:");
    console.log("- Understanding of different tracks and their requirements");
    console.log("- Proper deposit amounts for proposal submission");
    console.log("- Sufficient conviction voting power");
    console.log("- In a real application, you would sign and submit these transactions");
    console.log("- Consider the lock periods for conviction voting");

  } catch (error) {
    console.error("❌ Error in OpenGov operations:", error);
  }
};

demonstrateOpenGovOperations().catch(console.error);
`;
	}
}
