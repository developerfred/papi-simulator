"use client";

import React from "react";
import { ChainProvider } from "@/context/ChainProvider";
import { BlockchainDashboard } from "@/components/blockchain";
import { useNetwork } from "@/lib/hooks/useNetwork";

/**
 * Blockchain dashboard page that integrates with the PAPI simulator
 */
export default function DashboardPage() {
	const { selectedNetwork } = useNetwork();

	return (
		<ChainProvider initialNetwork={selectedNetwork}>
			<BlockchainDashboard />
		</ChainProvider>
	);
}
