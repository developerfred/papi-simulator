import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
import { ExportButton } from "@/lib/export-modal/ExportButton";
import { DeploymentGuideButton } from "../DeploymentGuide/DeploymentGuideModal";

const EDITOR_CONFIG = {
	MIN_HEIGHT: 400,
	MAX_HEIGHT: 900,
	DEFAULT_HEIGHT: 500,
	RESIZE_TIMEOUT: 50
} as const;

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

// Memoized utility function
const getComponentName = (exampleName: string): string => {
	return exampleName.replace(/\s+/g, '');
};


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

	
	const componentName = useMemo(() => getComponentName(selectedExample.name), [selectedExample.name]);
	const isComponentExample = useMemo(() => selectedExample.categories.includes("components"), [selectedExample.categories]);
	const showExportButton = useMemo(() => isLivePreviewMode && isComponentExample, [isLivePreviewMode, isComponentExample]);

	
	const containerStyles = useMemo(() => ({
		editorContainer: {
			transition: "width 0.3s ease",
			position: "relative" as const,
			zIndex: "var(--z-index-monaco-editor)",
			isolation: "isolate" as const
		},
		previewContainer: {
			transition: "width 0.3s ease",
			borderColor: getColor("border"),
			position: "relative" as const,
			zIndex: "var(--z-index-content)"
		},
		editorContent: {
			minHeight: `${EDITOR_CONFIG.MIN_HEIGHT}px`,
			transition: "width 0.3s ease"
		},
		exampleBadge: {
			backgroundColor: isDarkTheme
				? "rgba(255,255,255,0.05)"
				: "rgba(0,0,0,0.05)"
		},
		consoleSection: {
			position: "relative" as const,
			zIndex: "var(--z-index-content)"
		}
	}), [getColor, isDarkTheme]);

	
	const handleToggleLivePreview = useCallback(() => {
		setIsLivePreviewMode(prev => !prev);
		setIsCodeOutputVisible(true);
	}, []);

	const toggleCodeOutputVisibility = useCallback(() => {
		setIsCodeOutputVisible(prev => !prev);
	}, []);

	
	const adjustHeight = useCallback(() => {
		if (editorRef.current) {
			const actualHeight = editorRef.current.scrollHeight;
			const height = Math.min(
				Math.max(actualHeight, EDITOR_CONFIG.MIN_HEIGHT),
				EDITOR_CONFIG.MAX_HEIGHT
			);
			setEditorHeight(`${height}px`);
		}
	}, []);

	
	useEffect(() => {
		const timeoutId = setTimeout(adjustHeight, EDITOR_CONFIG.RESIZE_TIMEOUT);
		window.addEventListener("resize", adjustHeight);

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener("resize", adjustHeight);
		};
	}, [code, adjustHeight]);

	
	const HeaderContent = useMemo(() => (
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

				
				{showExportButton && (
					<Badge variant="success">Component rendering enabled</Badge>
				)}

			
				{showExportButton && (
					<ExportButton
						code={code}
						network={selectedNetwork}
						componentName={componentName}
					/>
				)}

				{showExportButton && (
					<DeploymentGuideButton 
  						componentName={componentName}
						packageName={`@papi-simulator/${componentName.toLowerCase()}`}/>
					)}

				
			</div>

			
			<div
				className="text-xs px-2 py-1 rounded flex items-center"
				style={containerStyles.exampleBadge}
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
	), [
		isLivePreviewMode,
		showExportButton,
		componentName,
		code,
		selectedNetwork,
		selectedExample.name,
		handleToggleLivePreview,
		containerStyles.exampleBadge
	]);

	// Memoized console output section
	const ConsoleOutputSection = useMemo(() => {
		if (!isLivePreviewMode) return null;

		return (
			<>
				<ConsoleOutputToggle
					isCodeOutputVisible={isCodeOutputVisible}
					toggleCodeOutputVisibility={toggleCodeOutputVisibility}
					style={containerStyles.consoleSection}
				/>
				{isCodeOutputVisible && (
					<div style={containerStyles.consoleSection}>
						<Console outputs={outputs} onClear={clearOutput} />
					</div>
				)}
			</>
		);
	}, [
		isLivePreviewMode,
		isCodeOutputVisible,
		outputs,
		clearOutput,
		toggleCodeOutputVisibility,
		containerStyles.consoleSection
	]);

	// Memoized editor section
	const EditorSection = useMemo(() => (
		<div
			ref={editorRef}
			className={`editor-container ${isLivePreviewMode ? "w-1/2" : "w-full"} pr-2 flex flex-col`}
			style={containerStyles.editorContainer}
		>
			<div
				className="flex-grow overflow-auto"
				style={{
					height: editorHeight,
					...containerStyles.editorContent
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
	), [
		isLivePreviewMode,
		editorHeight,
		isMounted,
		code,
		updateCode,
		isRunning,
		selectedNetwork.id,
		containerStyles.editorContainer,
		containerStyles.editorContent
	]);

	// Memoized preview section
	const PreviewSection = useMemo(() => {
		if (!isLivePreviewMode) return null;

		return (
			<div
				className="preview-container w-1/2 pl-2 border-l flex flex-col"
				style={containerStyles.previewContainer}
			>
				<div className="flex-grow overflow-auto">
					<LivePreviewContainer
						code={code}
						network={selectedNetwork}
						className="live-preview-container"
					/>
				</div>
			</div>
		);
	}, [
		isLivePreviewMode,
		code,
		selectedNetwork,
		containerStyles.previewContainer
	]);

	return (
		<div className="flex flex-col gap-4 h-full">
			<TutorialPanel
				example={selectedExample}
				network={selectedNetwork}
			/>

			<Card
				className="flex-1"
				header={HeaderContent}
			>
				<div className="flex flex-col">
					<div className="flex">
						{EditorSection}
						{PreviewSection}
					</div>

					{isMounted && ConsoleOutputSection}
				</div>
			</Card>
		</div>
	);
}