import ContentLayout from "@/components/layouts/ContentLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import NetworkBadge from "@/components/ui/NetworkBadge";
import { DEFAULT_NETWORK, NETWORKS } from "@/lib/constants/networks";
import { DEFAULT_EXAMPLE, EXAMPLES } from "@/lib/examples";
import { useCodeRunner } from "@/lib/hooks/useCodeRunner";
import { useLocalStorageState } from "@/lib/hooks/useLocalStorageState";
import { useTheme } from "@/lib/theme/ThemeProvider";
import type { Example } from "@/lib/types/example";
import type { Network } from "@/lib/types/network";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useMemo, useCallback } from "react";

const Main = dynamic(() => import("./Main"), { ssr: false });
const Sidebar = dynamic(() => import("./Sidebar"), { ssr: false });
const NetworkIndicator = dynamic(() => import("./NetworkIndicator"), {
	ssr: false,
});
const MobileSidebarToggle = dynamic(() => import("./MobileSidebarToggle"), {
	ssr: false,
});
const LoadingState = dynamic(() => import("./LoadingState"), { ssr: false });

export default function Playground() {
	// Removendo variáveis não utilizadas da desestruturação
	const { isLoaded, setCurrentNetworkId } = useTheme();

	const [selectedNetworkId, setSelectedNetworkId] = useLocalStorageState<string>(
		"selectedNetwork",
		DEFAULT_NETWORK.id,
	);
	const [selectedExampleId, setSelectedExampleId] = useLocalStorageState<string>(
		"selectedExample",
		DEFAULT_EXAMPLE.id,
	);
	const [selectedNetwork, setSelectedNetwork] =
		useState<Network>(DEFAULT_NETWORK);
	const [selectedExample, setSelectedExample] =
		useState<Example>(DEFAULT_EXAMPLE);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	const {
		code,
		outputs,
		isRunning,
		updateCode,
		setExampleCode,
		runCode,
		clearOutput,
	} = useCodeRunner();

	useEffect(() => {
		setIsMounted(true);
		const checkMobile = () => {
			setSidebarCollapsed(window.innerWidth < 1024);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		const network = NETWORKS[selectedNetworkId] || DEFAULT_NETWORK;
		setSelectedNetwork(network);
		setCurrentNetworkId(selectedNetworkId);
	}, [selectedNetworkId, setCurrentNetworkId]);

	useEffect(() => {
		const example =
			EXAMPLES.find((e) => e.id === selectedExampleId) || DEFAULT_EXAMPLE;
		setSelectedExample(example);
	}, [selectedExampleId]);

	useEffect(() => {
		if (selectedExample && selectedNetwork) {
			setExampleCode(selectedExample, selectedNetwork);
		}
	}, [selectedExample, selectedNetwork, setExampleCode]);

	// Envolvendo as funções handler em useCallback
	const handleRunCode = useCallback(() => {
		runCode(selectedExample, selectedNetwork);
	}, [runCode, selectedExample, selectedNetwork]);

	const handleNetworkChange = useCallback((networkId: string) => {
		setSelectedNetworkId(networkId);
	}, [setSelectedNetworkId]);

	const handleExampleChange = useCallback((exampleId: string) => {
		setSelectedExampleId(exampleId);
	}, [setSelectedExampleId]);

	const toggleSidebar = useCallback(() => {
		setSidebarCollapsed(prev => !prev);
	}, []);

	const SidebarContent = useMemo(
		() => (
			<Sidebar
				networks={Object.values(NETWORKS)}
				examples={EXAMPLES}
				selectedNetwork={selectedNetwork}
				selectedExample={selectedExample}
				isRunning={isRunning}
				outputs={outputs}
				onNetworkChange={handleNetworkChange}
				onExampleChange={handleExampleChange}
				onRunCode={handleRunCode}
				onClearOutput={clearOutput}
				progress={0}
			/>
		),
		[
			selectedNetwork,
			selectedExample,
			isRunning,
			outputs,
			handleNetworkChange,
			handleExampleChange,
			handleRunCode,
			clearOutput,
		],
	);

	const MainContent = useMemo(
		() => (
			<Main
				code={code}
				outputs={outputs}
				isRunning={isRunning}
				selectedExample={selectedExample}
				selectedNetwork={selectedNetwork}
				updateCode={updateCode}
				clearOutput={clearOutput}
				isMounted={isMounted}
			/>
		),
		[
			code,
			outputs,
			isRunning,
			selectedExample,
			selectedNetwork,
			updateCode,
			clearOutput,
			isMounted,
		],
	);

	if (!isLoaded || !isMounted) {
		return <LoadingState />;
	}

	// Mobile layout
	if (typeof window !== "undefined" && window.innerWidth < 1024) {
		return (
			<>
				<NetworkIndicator />
				<DashboardLayout
					title="Polkadot API Playground"
					description="Learn and experiment with polkadot-api"
					rightContent={<NetworkBadge network={selectedNetwork} />}
				>
					{sidebarCollapsed ? MainContent : SidebarContent}

					<MobileSidebarToggle
						isCollapsed={sidebarCollapsed}
						onToggle={toggleSidebar}
					/>
				</DashboardLayout>
			</>
		);
	}

	return (
		<>
			<NetworkIndicator />
			<DashboardLayout
				title="Polkadot API Playground"
				description="Learn and experiment with polkadot-api in a sandbox environment"
				rightContent={<NetworkBadge network={selectedNetwork} />}
			>
				<ContentLayout sidebar={SidebarContent} sidebarWidth="narrow">
					{MainContent}
				</ContentLayout>
			</DashboardLayout>
		</>
	);
}