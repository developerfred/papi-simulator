/* eslint-disable  @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck

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

	// Memoized computed values
	const componentName = useMemo(() => getComponentName(selectedExample.name), [selectedExample.name]);
	const isComponentExample = useMemo(() => selectedExample.categories.includes("components"), [selectedExample.categories]);
	const showExportButton = useMemo(() => isLivePreviewMode && isComponentExample, [isLivePreviewMode, isComponentExample]);

	// Memoized styles
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
		consoleSection: {
			position: "relative" as const,
			zIndex: "var(--z-index-content)"
		}
	}), [getColor]);

	// Event handlers
	const handleToggleLivePreview = useCallback(() => {
		setIsLivePreviewMode(prev => !prev);
		setIsCodeOutputVisible(true);
	}, []);

	const toggleCodeOutputVisibility = useCallback(() => {
		setIsCodeOutputVisible(prev => !prev);
	}, []);

	// Height adjustment
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

	// Effects
	useEffect(() => {
		const timeoutId = setTimeout(adjustHeight, EDITOR_CONFIG.RESIZE_TIMEOUT);
		window.addEventListener("resize", adjustHeight);

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener("resize", adjustHeight);
		};
	}, [code, adjustHeight]);

	// Memoized header content with harmonized design
	const HeaderContent = useMemo(() => (
		<div className="flex justify-between items-center" >
			<div className="flex items-center gap-3" >
				<span className="font-medium text-sm" style={{ color: getColor('text-primary') }}>
					Code Editor
				</span>

				{/* Live Preview Toggle */}
				<Button
					variant={isLivePreviewMode ? "primary" : "outline"}
					size="sm"
					onClick={handleToggleLivePreview}
					networkColored={isLivePreviewMode}
					style={{ fontSize: '12px', height: '28px' }}
				>
					{isLivePreviewMode ? "Live Preview ON" : "Live Preview OFF"}
				</Button>

				{/* Component Status Badge */}
				{
					showExportButton && (
						<div
							style={
								{
									backgroundColor: getColor('success') + '15',
									color: getColor('success'),
									border: `1px solid ${getColor('success')}30`,
									borderRadius: '6px',
									padding: '4px 8px',
									fontSize: '11px',
									fontWeight: '600',
									display: 'inline-flex',
									alignItems: 'center',
									gap: '4px',
									height: '28px'
								}
							}
						>
							✓ Component Ready
						</div>
					)
				}
			</div>

			{/* Right side - Network badge and action buttons */}
			<div className="flex items-center gap-3" >
				{/* Action Buttons Container */}
				{showExportButton && (
					<div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
						<div className="relative group">
							<ExportButton
								code={code}
								network={selectedNetwork}
								componentName={componentName}
								className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Export
							</ExportButton>

							{/* Tooltip */}
							<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
								Export component code
							</div>
						</div>

						<div className="relative group">
							<DeploymentGuideButton
								componentName={componentName}
								packageName={`@papi-simulator/${componentName.toLowerCase()}`}
								className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Guide
							</DeploymentGuideButton>

							{/* Tooltip */}
							<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
								View deployment guide
							</div>
						</div>
					</div>
				)}

				{/* Network Badge */}
				<div
					className="text-xs px-3 py-1.5 rounded-md flex items-center border"
					style={{
						backgroundColor: getColor('surface'),
						borderColor: getColor('border'),
						color: getColor('text-secondary'),
						height: '32px'
					}}
				>
					<NetworkBadge
						network={selectedNetwork}
						size="sm"
						showName={false}
						className="mr-2"
					/>
					<span className="font-medium" > {selectedExample.name} </span>
				</div>
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
		getColor
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
				<div className="flex-grow overflow-auto" >
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
		<div className="flex flex-col gap-4 h-full" >
			<TutorialPanel
				example={selectedExample}
				network={selectedNetwork}
			/>

			<Card
				className="flex-1"
				header={HeaderContent}
			>
				<div className="flex flex-col" >
					<div className="flex" >
						{EditorSection}
						{PreviewSection}
					</div>

					{isMounted && ConsoleOutputSection}
				</div>
			</Card>
		</div>
	);
}