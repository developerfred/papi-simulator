"use client";

import type React from "react";
import { Editor } from "@monaco-editor/react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import {
	EditorContainer,
	EditorLoadingPlaceholder,
	EditorErrorBoundary,
} from "./components";
import {
	useMonacoConfiguration,
	useEditorInstance,
	useMountedState,
} from "./hooks";
import {
	type CodeEditorProps,
	DEFAULT_EDITOR_OPTIONS,
	type SupportedNetwork,
} from "./types";

const CodeEditor: React.FC<CodeEditorProps> = ({
	code,
	onChange,
	disabled = false,
	language = "typescript",	
	network = "westend",
	className = "",
}) => {
	const { isDarkTheme } = useTheme();
	const isMounted = useMountedState();
	const containerClassName = `w-full h-full ${className}`;

	useMonacoConfiguration(network as SupportedNetwork);
	const { handleEditorDidMount } = useEditorInstance(code, onChange, disabled);

	if (!isMounted) {
		return (
			<EditorContainer className={containerClassName}>
				<EditorLoadingPlaceholder />
			</EditorContainer>
		);
	}

	return (
		<EditorErrorBoundary>
			<EditorContainer
				className={containerClassName}
			>
				<Editor
					width="100%"
					height="100%"
					defaultLanguage={language}
					value={code}
					theme={isDarkTheme ? "vs-dark" : "light"}
					onChange={(value) => onChange(value || "")}
					onMount={handleEditorDidMount}
					loading={<EditorLoadingPlaceholder />}
					options={{
						...DEFAULT_EDITOR_OPTIONS,
						readOnly: disabled,
						cursorBlinking: "blink",
						automaticLayout: true,
						wordWrap: "on",
						scrollbar: {
							vertical: "auto",
							horizontal: "auto",
						},
					}}
				/>
			</EditorContainer>
		</EditorErrorBoundary>
	);
};

export default CodeEditor;