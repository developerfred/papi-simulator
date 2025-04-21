import ExampleSelector from "@/components/ExampleSelector";
import NetworkSelector from "@/components/NetworkSelector";
import InfoPanel from "@/components/Panel";
import ActionButton from "@/components/ui/ActionButton";
import Card from "@/components/ui/Card";
import { useTheme } from "@/lib/theme/ThemeProvider";
import type { Example } from "@/lib/types/example";
import type { ConsoleOutput } from "@/lib/types/example";
import type { Network } from "@/lib/types/network";
import React from "react";
import Button from "../ui/Button";
import Link from "next/link";

interface SidebarProps {
	networks: Network[];
	examples: Example[];
	selectedNetwork: Network;
	selectedExample: Example;
	isRunning: boolean;
	progress: number;
	outputs: ConsoleOutput[];
	onNetworkChange: (networkId: string) => void;
	onExampleChange: (exampleId: string) => void;
	onRunCode: () => void;
	onClearOutput: () => void;
}

export default function Sidebar({
	networks,
	examples,
	selectedNetwork,
	selectedExample,
	isRunning,
	outputs,
	onNetworkChange,
	onExampleChange,
	onRunCode,
	onClearOutput,
}: SidebarProps) {
	const { isDarkTheme, getColor, getNetworkColor } = useTheme();

	const getDifficultyColor = (
		level: "beginner" | "intermediate" | "advanced",
	) => {
		const colorMap = {
			beginner: "#22C55E",
			intermediate: "#F59E0B",
			advanced: "#EF4444",
		};
		return colorMap[level] || colorMap["beginner"];
	};

	return (
		<div className="flex flex-col gap-4">
			<NetworkSelector
				networks={Object.values(networks)}
				selectedNetworkId={selectedNetwork.id}
				onNetworkChange={onNetworkChange}
			/>

			<ExampleSelector
				examples={examples}
				selectedExampleId={selectedExample.id}
				onExampleChange={onExampleChange}
			/>

			<InfoPanel network={selectedNetwork} example={selectedExample} />

			<Card>
				<div className="flex flex-col gap-3">
					<ActionButton
						onClick={onRunCode}
						disabled={isRunning}
						isPrimary={true}
						icon="play"
						fullWidth
						size="lg"
					>
						{isRunning ? "Running..." : "Run Code"}
					</ActionButton>

					<ActionButton
						onClick={onClearOutput}
						disabled={isRunning || outputs.length === 0}
						icon="trash"
						fullWidth
						size="md"
					>
						Clear Console
					</ActionButton>

					<div
						className="border-t my-2 pt-2"
						style={{ borderColor: getColor("divider") }}
					>
						<Link href="/dashboard">
							<Button
								variant="outline"
								fullWidth
								size="md"
								className="flex items-center justify-center"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									className="mr-2"
									fill="none"
									stroke={getNetworkColor("primary")}
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect x="3" y="3" width="7" height="7"></rect>
									<rect x="14" y="3" width="7" height="7"></rect>
									<rect x="14" y="14" width="7" height="7"></rect>
									<rect x="3" y="14" width="7" height="7"></rect>
								</svg>
								Blockchain Dashboard
							</Button>
						</Link>
					</div>

					<div
						className="flex items-center justify-center mt-2 text-xs"
						style={{
							color: isDarkTheme ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
						}}
					>
						<span>Example difficulty: </span>
						<span
							className="ml-1 font-medium"
							style={{
								color: getDifficultyColor(selectedExample.level),
							}}
						>
							{selectedExample.level.toUpperCase()}
						</span>
					</div>
				</div>
			</Card>
		</div>
	);
}
