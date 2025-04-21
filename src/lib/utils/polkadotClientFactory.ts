import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import type { Network } from "@/lib/types/network";

export async function createPolkadotClient(network: Network) {
	try {
		// Create the WebSocket provider with compatibility layer
		const provider = withPolkadotSdkCompat(getWsProvider(network.endpoint));

		// Create and return the client
		const client = createClient(provider);

		return client;
	} catch (error) {
		console.error("Failed to create Polkadot client:", error);
		throw error;
	}
}
