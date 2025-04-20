import React, { useState, useRef, useEffect } from "react";
import Console from "@/components/Console";
import TutorialPanel from "@/components/TutorialPanel";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import NetworkBadge from "@/components/ui/NetworkBadge";
import { useTheme } from "@/lib/theme/ThemeProvider";
import type { Example } from "@/lib/types/example";
import type { ConsoleOutput } from "@/lib/types/example";
import type { Network } from "@/lib/types/network";
import { CodeEditor, type SupportedNetwork } from "@/lib/editor";
import LivePreviewContainer from "@/components/LivePreview";

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
	const [isLivePreviewMode, setIsLivePreviewMode] = useState(false);
	const [editorHeight, setEditorHeight] = useState("auto");
	const editorRef = useRef<HTMLDivElement>(null);

	
	const handleToggleLivePreview = () => {
		setIsLivePreviewMode((prev) => !prev);
	};

	
	useEffect(() => {
		const adjustHeight = () => {
			if (editorRef.current) {
				
				const actualHeight = editorRef.current.scrollHeight;

				
				const height = Math.min(Math.max(actualHeight, 200), 600);

				setEditorHeight(`${height}px`);
			}
		};

		
		const timeoutId = setTimeout(adjustHeight, 50);

		
		window.addEventListener("resize", adjustHeight);

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener("resize", adjustHeight);
		};
	}, [code]);

	return (
		<div className="flex flex-col gap-4 h-full">
			<TutorialPanel example={selectedExample} network={selectedNetwork} />

			<Card
				className="flex-1"
				header={
					<div className="flex justify-between items-center">
						<div className="font-medium flex items-center">
							<span>Code Editor</span>
							<div
								className="ml-2 cursor-pointer"
								onClick={handleToggleLivePreview}
							>
								<Badge variant="default">
									{isLivePreviewMode ? "Live Preview" : "TypeScript"}
								</Badge>
							</div>
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
				<div className="flex">
					<div
						ref={editorRef}
						className={`${isLivePreviewMode ? "w-1/2" : "w-full"} pr-2`}
						style={{
							transition: "width 0.3s ease",
							height: editorHeight,
							overflowY: "auto",
						}}
					>
						{isMounted && (
							<CodeEditor
								code={code}
								onChange={updateCode}
								disabled={isRunning}
								style={{
									height: "100%",
									minHeight: "200px",
									maxHeight: "600px",
								}}
								network={selectedNetwork.id as SupportedNetwork}
							/>
						)}
					</div>

					{isLivePreviewMode && (
						<div
							className="w-1/2 pl-2 border-l "
							style={{ transition: "width 0.3s ease" }}
						>
							<LivePreviewContainer code={code} network={selectedNetwork} />
						</div>
					)}
				</div>
			</Card>

			{isMounted && <Console outputs={outputs} onClear={clearOutput} />}
		</div>
	);
}
