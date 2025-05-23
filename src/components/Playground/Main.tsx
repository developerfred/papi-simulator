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
import LivePreviewContainer from "@/components/LivePreview/LivePreviewContainer";
import Button from "@/components/ui/Button";
import ConsoleOutputToggle from "@/components/Playground/ConsoleOutputToggle";

const EDITOR_CONFIG = {
	MIN_HEIGHT: 400,
	MAX_HEIGHT: 900,
	DEFAULT_HEIGHT: 500,
	RESIZE_TIMEOUT: 50
};

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
	const [isLivePreviewMode, setIsLivePreviewMode] = useState<boolean>(false);
	const [editorHeight, setEditorHeight] = useState<string>(`${EDITOR_CONFIG.DEFAULT_HEIGHT}px`);
	const [isCodeOutputVisible, setIsCodeOutputVisible] = useState<boolean>(true);
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
				const height = Math.min(
					Math.max(actualHeight, EDITOR_CONFIG.MIN_HEIGHT),
					EDITOR_CONFIG.MAX_HEIGHT
				);
				setEditorHeight(`${height}px`);
			}
		};

		const timeoutId = setTimeout(adjustHeight, EDITOR_CONFIG.RESIZE_TIMEOUT);
		window.addEventListener("resize", adjustHeight);

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener("resize", adjustHeight);
		};
	}, [code]);

	
	const ConsoleOutputSection = isLivePreviewMode && (
		<>
			<ConsoleOutputToggle
				isCodeOutputVisible={isCodeOutputVisible}
				toggleCodeOutputVisibility={toggleCodeOutputVisibility}
				style={{ position: "relative", zIndex: "var(--z-index-content)" }} 
			/>
			{isCodeOutputVisible && (
				<div style={{ position: "relative", zIndex: "var(--z-index-content)" }}> 
				<Console outputs={outputs} onClear={clearOutput} />
				</div>
			)}
		</>
	);

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
									: "rgba(0,0,0,0.05)"
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
							className={`editor-container ${isLivePreviewMode ? "w-1/2" : "w-full"} pr-2 flex flex-col`}
							style={{
								transition: "width 0.3s ease",
								position: "relative",
								zIndex: "var(--z-index-monaco-editor)",
								isolation: "isolate" 
							}}
						>
							<div
								className="flex-grow overflow-auto"
								style={{
									height: editorHeight,
									minHeight: `${EDITOR_CONFIG.MIN_HEIGHT}px`,
									transition: "width 0.3s ease"
								}}
							>
								{isMounted && (
									<CodeEditor
										code={code}
										onChange={updateCode}
										disabled={isRunning}
										network={selectedNetwork.id as SupportedNetwork}
										language="typescript"
										className=""
									/>
								)}
							</div>
						</div>

						
						{isLivePreviewMode && (
							<div
								className="preview-container w-1/2 pl-2 border-l flex flex-col"
								style={{
									transition: "width 0.3s ease",
									borderColor: getColor("border"),
									position: "relative",
									zIndex: "var(--z-index-content)" 
								}}
							>
								<div className="flex-grow overflow-auto">
									<LivePreviewContainer
										code={code}
										network={selectedNetwork}
										className="live-preview-container"
									/>
								</div>
							</div>
						)}
					</div>
					
					{isMounted && ConsoleOutputSection}
				</div>
			</Card>
		</div>
	);
}