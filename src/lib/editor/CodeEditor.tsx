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
	height = "400px",
	network = "westend",
}) => {
	const { isDarkTheme } = useTheme();
	const isMounted = useMountedState();

	useMonacoConfiguration(network as SupportedNetwork);
	const { handleEditorDidMount } = useEditorInstance(code, onChange, disabled);

	if (!isMounted) {
		return (
			<EditorContainer height={height}>
				<EditorLoadingPlaceholder />
			</EditorContainer>
		);
	}

	return (
		<EditorErrorBoundary>
			<EditorContainer height={height}>
				<Editor
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
					}}
				/>
			</EditorContainer>
		</EditorErrorBoundary>
	);
};

export default CodeEditor;
