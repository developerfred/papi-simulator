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
import Button from "@/components/ui/Button";
import ConsoleOutputToggle from "@/components/Playground/ConsoleOutputToggle";

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
	const { isDarkTheme, getColor } = useTheme();
	const [isLivePreviewMode, setIsLivePreviewMode] = useState(false);
	const [editorHeight, setEditorHeight] = useState("auto");
	const [isCodeOutputVisible, setIsCodeOutputVisible] = useState(true);
	const editorRef = useRef<HTMLDivElement>(null);

	const handleToggleLivePreview = () => {
		setIsLivePreviewMode((prev) => !prev);
		setIsCodeOutputVisible(true);
	};

	const toggleCodeOutputVisibility = () => {
		setIsCodeOutputVisible((prev) => !prev);
	};

	useEffect(() => {
		const adjustHeight = () => {
			if (editorRef.current) {
				const actualHeight = editorRef.current.scrollHeight;
				const height = Math.min(Math.max(actualHeight, 200), 900);
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
						<div className="font-medium flex items-center gap-3">
							<span>Code Editor</span>
							<Button
								variant={isLivePreviewMode ? "primary" : "outline"}
								size="sm"
								onClick={handleToggleLivePreview}
								networkColored={isLivePreviewMode}
							>
								{isLivePreviewMode ? "Live Preview ON" : "Live Preview OFF"}
							</Button>
							{isLivePreviewMode &&
								selectedExample.categories.includes("components") && (
									<Badge variant="success">Component rendering enabled</Badge>
								)}
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
				<div className="flex flex-col">
					<div className="flex">
						<div
							ref={editorRef}
							className={`${isLivePreviewMode ? "w-1/2" : "w-full"} pr-2 flex flex-col`}
							style={{
								transition: "width 0.3s ease",
							}}
						>
							{isMounted && (
								<div
									className="flex-grow overflow-auto"
									style={{
										maxHeight: editorHeight,
									}}
								>
									<CodeEditor
										code={code}
										onChange={updateCode}
										disabled={isRunning}
										network={selectedNetwork.id as SupportedNetwork}
										language="typescript"
										string=""
									/>
								</div>
							)}
						</div>

						{isLivePreviewMode && (
							<div
								className="w-1/2 pl-2 border-l flex flex-col"
								style={{
									transition: "width 0.3s ease",
									borderColor: getColor("border"),
								}}
							>
								<div className="flex-grow overflow-auto">
									<LivePreviewContainer code={code} network={selectedNetwork} />
								</div>
							</div>
						)}
					</div>

					{isMounted && isLivePreviewMode && (
						<>
							<ConsoleOutputToggle
								isCodeOutputVisible={isCodeOutputVisible}
								toggleCodeOutputVisibility={toggleCodeOutputVisibility}
							/>
							{isCodeOutputVisible && (
								<Console outputs={outputs} onClear={clearOutput} />
							)}
						</>
					)}
				</div>
			</Card>
		</div>
	);
}
