import CodeEditor from "@/components/CodeEditor";
import Console from "@/components/Console";
import TutorialPanel from "@/components/TutorialPanel";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import NetworkBadge from "@/components/ui/NetworkBadge";
import { useTheme } from "@/lib/theme/ThemeProvider";
import type { Example } from "@/lib/types/example";
import type { ConsoleOutput } from "@/lib/types/example";
import type { Network } from "@/lib/types/network";
import React from "react";

interface MainProps {
	code: string;
	outputs: ConsoleOutput[];
	isRunning: boolean;
	selectedExample: Example;
	selectedNetwork: Network;
	updateCode: (newCode: string) => void;
	clearOutput: () => void;
	isMounted: boolean;
}

export default function Main({
	code,
	outputs,
	isRunning,
	selectedExample,
	selectedNetwork,
	updateCode,
	clearOutput,
	isMounted,
}: MainProps) {
	const { isDarkTheme } = useTheme();

	return (
		<div className="flex flex-col gap-4 h-full">
			<TutorialPanel example={selectedExample} network={selectedNetwork} />

			<Card
				className="flex-1"
				header={
					<div className="flex justify-between items-center">
						<div className="font-medium flex items-center">
							<span>Code Editor</span>
							<Badge variant="default" className="ml-2">
								TypeScript
							</Badge>
						</div>
						<div
							className="text-xs px-2 py-1 rounded flex items-center"
							style={{
								backgroundColor: isDarkTheme
									? "rgba(255,255,255,0.05)"
									: "rgba(0,0,0,0.05)",
							}}
						>
							<NetworkBadge
								network={selectedNetwork}
								size="sm"
								showName={false}
								className="mr-2"
							/>
							{selectedExample.name}
						</div>
					</div>
				}
			>
				<div className="-m-4">
					{isMounted && (
						<CodeEditor
							code={code}
							onChange={updateCode}
							disabled={isRunning}
							height="400px"
						/>
					)}
				</div>
			</Card>

			{isMounted && <Console outputs={outputs} onClear={clearOutput} />}
		</div>
	);
}
